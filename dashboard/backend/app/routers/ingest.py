import json
from datetime import datetime

from fastapi import APIRouter, Depends, Header, HTTPException

from ..config import settings
from ..database import get_pool
from ..models import IngestRequest

router = APIRouter()


def verify_api_key(authorization: str = Header(...)) -> None:
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or token != settings.api_key:
        raise HTTPException(status_code=401, detail="Invalid API key")


@router.post("/api/ingest")
async def ingest(req: IngestRequest, _=Depends(verify_api_key)):
    pool = await get_pool()

    async with pool.acquire() as conn:
        async with conn.transaction():
            # 1. qa_runs
            run_row = await conn.fetchrow(
                """
                INSERT INTO qa_runs (
                    run_id, started_at, finished_at, duration_ms,
                    total_projects, healthy_projects, tested_projects,
                    total_tests, total_passed, total_failed, total_skipped,
                    raw_json
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                ON CONFLICT (run_id) DO UPDATE SET
                    finished_at = EXCLUDED.finished_at,
                    duration_ms = EXCLUDED.duration_ms,
                    total_projects = EXCLUDED.total_projects,
                    healthy_projects = EXCLUDED.healthy_projects,
                    tested_projects = EXCLUDED.tested_projects,
                    total_tests = EXCLUDED.total_tests,
                    total_passed = EXCLUDED.total_passed,
                    total_failed = EXCLUDED.total_failed,
                    total_skipped = EXCLUDED.total_skipped,
                    raw_json = EXCLUDED.raw_json
                RETURNING id
                """,
                req.runId,
                datetime.fromisoformat(req.startedAt),
                datetime.fromisoformat(req.finishedAt),
                req.durationMs,
                req.summary.totalProjects,
                req.summary.healthyProjects,
                req.summary.testedProjects,
                req.summary.totalTests,
                req.summary.totalPassed,
                req.summary.totalFailed,
                req.summary.totalSkipped,
                json.dumps(req.model_dump(), default=str),
            )
            run_pk = run_row["id"]

            # 2. qa_health_results
            for hr in req.healthResults:
                await conn.execute(
                    """
                    INSERT INTO qa_health_results (run_id, project_name, healthy, checked_at, endpoints)
                    VALUES ($1, $2, $3, $4, $5)
                    """,
                    run_pk,
                    hr.projectName,
                    hr.healthy,
                    datetime.fromisoformat(hr.checkedAt),
                    json.dumps([e.model_dump() for e in hr.endpoints], default=str),
                )

            # 3. qa_test_results + qa_failure_details
            for tr in req.testResults:
                tr_row = await conn.fetchrow(
                    """
                    INSERT INTO qa_test_results (
                        run_id, project_name, executed, skipped_reason,
                        passed, failed, skipped, total, exit_code, duration_ms, failures
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                    RETURNING id
                    """,
                    run_pk,
                    tr.projectName,
                    tr.executed,
                    tr.skippedReason,
                    tr.passed,
                    tr.failed,
                    tr.skipped,
                    tr.total,
                    tr.exitCode,
                    tr.durationMs,
                    tr.failures,
                )
                tr_pk = tr_row["id"]

                # failure details for this project
                if req.failureDetails:
                    for fd in req.failureDetails:
                        # Match by file path or suite containing project name
                        belongs = False
                        if fd.filePath and tr.projectName.lower() in fd.filePath.lower():
                            belongs = True
                        elif fd.suiteName and tr.projectName.lower() in fd.suiteName.lower():
                            belongs = True
                        elif not fd.filePath and not fd.suiteName:
                            belongs = True

                        if belongs:
                            await conn.execute(
                                """
                                INSERT INTO qa_failure_details (
                                    test_result_id, test_name, suite_name, file_path,
                                    error_message, category
                                ) VALUES ($1, $2, $3, $4, $5, $6)
                                """,
                                tr_pk,
                                fd.testName,
                                fd.suiteName,
                                fd.filePath,
                                fd.errorMessage,
                                fd.category,
                            )

            # 4. qa_suggestions
            if req.suggestions:
                for sg in req.suggestions:
                    await conn.execute(
                        """
                        INSERT INTO qa_suggestions (run_id, rule_id, severity, title, description, project_name)
                        VALUES ($1, $2, $3, $4, $5, $6)
                        """,
                        run_pk,
                        sg.ruleId,
                        sg.severity,
                        sg.title,
                        sg.description,
                        sg.projectName,
                    )

    return {"status": "ok", "runId": req.runId, "dbId": run_pk}

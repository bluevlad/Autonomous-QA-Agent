from fastapi import APIRouter, Depends, Header, HTTPException, Query

from ..config import settings
from ..database import get_pool

router = APIRouter()


@router.get("/api/health")
async def health_check():
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": str(e)}


def verify_api_key(authorization: str = Header(...)) -> None:
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or token != settings.api_key:
        raise HTTPException(status_code=401, detail="Invalid API key")


@router.post("/api/cleanup")
async def cleanup(
    retention_days: int = Query(90, ge=30, le=365),
    _=Depends(verify_api_key),
):
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM qa_cleanup($1)", retention_days
        )
    return {
        "status": "ok",
        "retentionDays": retention_days,
        "deletedFailures": row["deleted_failures"],
        "deletedEndpoints": row["deleted_endpoints"],
        "clearedRawJson": row["cleared_raw_json"],
    }

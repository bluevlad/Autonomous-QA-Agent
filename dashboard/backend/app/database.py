from contextlib import asynccontextmanager

import asyncpg
from fastapi import FastAPI

pool: asyncpg.Pool | None = None


async def create_pool(dsn: str, min_size: int = 2, max_size: int = 10) -> asyncpg.Pool:
    return await asyncpg.create_pool(dsn=dsn, min_size=min_size, max_size=max_size)


async def close_pool():
    global pool
    if pool:
        await pool.close()
        pool = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    from .config import settings

    global pool
    pool = await create_pool(
        dsn=settings.database_url,
        min_size=settings.db_min_pool,
        max_size=settings.db_max_pool,
    )
    yield
    await close_pool()


async def get_pool() -> asyncpg.Pool:
    if pool is None:
        raise RuntimeError("Database pool not initialized")
    return pool

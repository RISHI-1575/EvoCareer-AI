from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.core.database import engine, Base
from app.api import auth, profile, simulation, startup, interview, ws

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting EvoCareer AI...")
    Base.metadata.create_all(bind=engine)
    yield
    logger.info("Shutting down EvoCareer AI.")


app = FastAPI(
    title="EvoCareer AI",
    version="1.0.0",
    docs_url="/api/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url=None,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS_LIST,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)[:200]},
    )


from fastapi.exceptions import RequestValidationError

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        # Remove binary input from error response
        err = {k: v for k, v in error.items() if k != "input"}
        errors.append(err)
    return JSONResponse(
        status_code=422,
        content={"detail": errors},
    )


app.include_router(auth.router,       prefix="/api/auth",       tags=["auth"])
app.include_router(profile.router,    prefix="/api/profile",    tags=["profile"])
app.include_router(simulation.router, prefix="/api/simulation", tags=["simulation"])
app.include_router(startup.router,    prefix="/api/startup",    tags=["startup"])
app.include_router(interview.router,  prefix="/api/interview",  tags=["interview"])
app.include_router(ws.router,         prefix="/ws",             tags=["websocket"])


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}
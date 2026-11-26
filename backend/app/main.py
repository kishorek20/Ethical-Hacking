from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routers import auth, assessment, breach
from . import models  # noqa: F401

app = FastAPI(
    title="Personal Information Leakage Risk System",
    description="Aware, Safe, Protected",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    Base.metadata.create_all(bind=engine)


app.include_router(auth.router)
app.include_router(assessment.router)
app.include_router(breach.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "app": "Personal Info Leakage Risk System"}

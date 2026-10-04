from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router
from app.database.session import init_db
from app.database.seed import seed_demo_data

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    seed_demo_data()
    print("✓ FlowGuard Reference Monitor Initialized.")
    print("✓ Database ready and seed data loaded.")
    print("✓ Security Invariants Active.")
    yield

app = FastAPI(
    title="FlowGuard Zero-Trust Runtime Security",
    description="Runtime authorization and information-flow security layer for tool-connected AI agents (AURA-7.2 / Neura Shield)",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {
        "product": "FLOWGUARD",
        "tagline": "Zero-Trust Runtime Security for AI Agents",
        "team": "Neura Shield",
        "status": "PROTECTION_ACTIVE",
        "docs_url": "/docs",
    }

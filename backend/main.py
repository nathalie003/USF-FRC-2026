
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.interventions import router as intervention_router
from routes.monitoring import router as monitoring_router


app = FastAPI(
    title="N2O Guardian API",
    description=(
        "AI-powered wastewater monitoring "
        "and intervention decision support"
    ),
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(intervention_router)
app.include_router(monitoring_router)


@app.get("/")
def root():
    return {
        "name": "N2O Guardian",
        "version": "0.2.0",
        "status": "online",
        "mode": "prototype",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "simulation_engine": "online",
        "forecast_model": "not_connected",
        "hardware": "not_connected",
    }
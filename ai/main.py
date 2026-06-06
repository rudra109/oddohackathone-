from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import recommend, rank, forecast

app = FastAPI(title="VendorBridge AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recommend.router, tags=["Recommendations"])
app.include_router(rank.router, tags=["Rankings"])
app.include_router(forecast.router, tags=["Forecasting"])

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "VendorBridge AI"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

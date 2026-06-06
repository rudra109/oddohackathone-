from fastapi import APIRouter
from schemas import ForecastRequest
import numpy as np

router = APIRouter()

@router.post("/spend-forecast")
def spend_forecast(req: ForecastRequest):
    """
    Predicts next 3 months spend using linear regression on historical data.
    """
    history = req.history
    if len(history) < 2:
        # Not enough data, just return generic flat trend
        val = history[0].spend if history else 500000.0
        return {"forecast": [
            {"month": "Next M1", "predictedSpend": val},
            {"month": "Next M2", "predictedSpend": val},
            {"month": "Next M3", "predictedSpend": val}
        ]}

    # Prepare data for numpy
    x = np.array(range(len(history)))
    y = np.array([h.spend for h in history])

    # Simple linear regression (y = mx + c)
    m, c = np.polyfit(x, y, 1)

    # Predict next 3 points
    forecast = []
    next_x = len(history)
    for i in range(1, 4):
        pred_y = (m * (next_x + i - 1)) + c
        pred_y = max(0, round(pred_y, 2)) # Prevent negative predictions
        forecast.append({
            "month": f"Next Month {i}",
            "predictedSpend": pred_y
        })

    return {"forecast": forecast}

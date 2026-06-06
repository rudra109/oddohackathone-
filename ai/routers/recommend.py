from fastapi import APIRouter
from schemas import RecommendRequest
import random

router = APIRouter()

@router.post("/recommend-vendors")
def recommend_vendors(req: RecommendRequest):
    """
    Simulate AI Vendor Recommendation based on multi-criteria scoring.
    """
    vendors = req.vendors
    if not vendors:
        return {"recommendations": []}

    scored = []
    for v in vendors:
        # Mock AI math: base rating + random variance for "AI logic"
        score = (v.rating * 15) + random.uniform(5, 25)
        score = min(round(score, 1), 100)
        
        reason = "Top Rated" if v.rating >= 4.5 else "Good Value"
        if score > 85:
            reason = "Best Price + Fast Delivery"
            
        scored.append({
            "vendorId": v.id,
            "name": v.name,
            "score": score,
            "reason": reason
        })
        
    scored.sort(key=lambda x: x['score'], reverse=True)
    return {"recommendations": scored[:5]}

from fastapi import APIRouter
from schemas import RankRequest

router = APIRouter()

@router.post("/rank-quotations")
def rank_quotations(req: RankRequest):
    """
    Normalizes price, speed, and rating to rank quotations.
    """
    quotes = req.quotations
    if not quotes:
        return {"rankings": []}

    # Identify min/max for normalization
    prices = [q.totalPrice for q in quotes]
    days = [q.deliveryDays for q in quotes]
    min_price, max_price = min(prices), max(prices)
    min_days, max_days = min(days), max(days)

    scored = []
    for q in quotes:
        # Price score (lower is better, 0-40 points)
        price_range = max_price - min_price if max_price > min_price else 1
        price_score = 40 * (1 - ((q.totalPrice - min_price) / price_range))

        # Days score (lower is better, 0-30 points)
        days_range = max_days - min_days if max_days > min_days else 1
        days_score = 30 * (1 - ((q.deliveryDays - min_days) / days_range))

        # Rating score (higher is better, 0-30 points)
        rating_score = 30 * (q.vendorRating / 5.0)

        total_score = round(price_score + days_score + rating_score, 1)
        scored.append({
            "quotationId": q.id,
            "vendorName": q.vendorName,
            "score": total_score,
            "price": q.totalPrice,
            "days": q.deliveryDays,
            "badge": ""
        })

    # Sort descending by score
    scored.sort(key=lambda x: x['score'], reverse=True)

    # Assign badges based on specific achievements
    fastest_q = min(scored, key=lambda x: x['days'])
    cheapest_q = min(scored, key=lambda x: x['price'])

    for idx, s in enumerate(scored):
        badges = []
        if idx == 0:
            badges.append("Best Overall ⭐")
        if s['days'] == fastest_q['days']:
            badges.append("Fastest 🚀")
        if s['price'] == cheapest_q['price']:
            badges.append("Lowest Price 💰")
            
        s['badge'] = " | ".join(badges)
        # Cleanup temp keys
        del s['price']
        del s['days']

    return {"rankings": scored}

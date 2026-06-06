from pydantic import BaseModel
from typing import List, Optional

class VendorInput(BaseModel):
    id: str
    name: str
    category: str
    rating: float

class RecommendRequest(BaseModel):
    rfqId: str
    vendors: List[VendorInput]

class QuotationInput(BaseModel):
    id: str
    vendorName: str
    vendorRating: float
    totalPrice: float
    deliveryDays: int

class RankRequest(BaseModel):
    rfqId: str
    quotations: List[QuotationInput]

class HistoricalSpend(BaseModel):
    month: str
    spend: float

class ForecastRequest(BaseModel):
    history: List[HistoricalSpend]

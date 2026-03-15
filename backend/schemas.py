from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from models import SkillLevel, UserRole

class UserBase(BaseModel):
    email: str
    role: UserRole
    skill_level: Optional[SkillLevel] = None
    display_name: Optional[str] = None
    points: Optional[int] = 0
    wins: Optional[int] = 0
    losses: Optional[int] = 0

class UserCreate(UserBase):
    id: str

class User(UserBase):
    id: str
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    skill_level: Optional[SkillLevel] = None
    display_name: Optional[str] = None

class CourtBase(BaseModel):
    name: str

class CourtCreate(CourtBase):
    facility_id: int

class Court(CourtBase):
    id: int
    facility_id: int
    class Config:
        from_attributes = True

class FacilityBase(BaseModel):
    name: str
    manager_id: str
    instagram_handle: Optional[str] = None
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    google_maps_url: Optional[str] = None
    currency: Optional[str] = "USD"
    opening_time: Optional[str] = "08:00"
    closing_time: Optional[str] = "22:00"

class FacilityCreate(FacilityBase):
    pass

class FacilityUpdate(BaseModel):
    name: Optional[str] = None
    instagram_handle: Optional[str] = None
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    google_maps_url: Optional[str] = None
    currency: Optional[str] = None
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None

class Facility(FacilityBase):
    id: int
    courts: List[Court] = []
    class Config:
        from_attributes = True

class GameBase(BaseModel):
    title: str
    facility_id: int
    court_id: Optional[int] = None
    start_time: datetime
    max_players: int
    skill_level: SkillLevel
    score_team_a: Optional[int] = 0
    score_team_b: Optional[int] = 0
    is_finished: Optional[bool] = False

class GameCreate(GameBase):
    pass

class GameUpdateScore(BaseModel):
    score_team_a: int
    score_team_b: int

class Game(GameBase):
    id: int
    class Config:
        from_attributes = True

class BookingBase(BaseModel):
    court_id: int
    user_id: str
    start_time: datetime

class BookingCreate(BookingBase):
    pass

class Booking(BookingBase):
    id: int
    class Config:
        from_attributes = True

class UserSchedule(BaseModel):
    bookings: List[Booking]
    games: List[Game]

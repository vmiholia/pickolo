from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from models import UserRole, SkillLevel

class UserBase(BaseModel):
    id: str
    email: str
    role: UserRole
    skill_level: Optional[SkillLevel] = None

class UserUpdate(BaseModel):
    skill_level: Optional[SkillLevel] = None

class User(UserBase):
    class Config:
        orm_mode = True

class CourtBase(BaseModel):
    id: int
    name: str
    facility_id: int

class CourtCreate(BaseModel):
    name: str
    facility_id: int

class Court(CourtBase):
    class Config:
        orm_mode = True

class FacilityBase(BaseModel):
    id: int
    name: str
    manager_id: str
    instagram_handle: Optional[str] = None
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class FacilityUpdate(BaseModel):
    name: Optional[str] = None
    instagram_handle: Optional[str] = None
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class Facility(FacilityBase):
    class Config:
        orm_mode = True

class GameBase(BaseModel):
    title: str
    facility_id: int
    start_time: datetime
    max_players: int
    skill_level: SkillLevel

class GameCreate(GameBase):
    pass

class Game(GameBase):
    id: int
    class Config:
        orm_mode = True

class BookingBase(BaseModel):
    court_id: int
    user_id: str
    start_time: datetime

class BookingCreate(BookingBase):
    pass

class Booking(BookingBase):
    id: int
    class Config:
        orm_mode = True

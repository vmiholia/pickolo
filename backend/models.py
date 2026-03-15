from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, Float, Boolean
from sqlalchemy.orm import relationship
from database import Base
import enum

class SkillLevel(str, enum.Enum):
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    EXPERT = "Expert"

class UserRole(str, enum.Enum):
    PLAYER = "Player"
    MANAGER = "Manager"

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True) # userId for login
    email = Column(String, unique=True, index=True)
    display_name = Column(String, nullable=True)
    role = Column(Enum(UserRole))
    skill_level = Column(Enum(SkillLevel), nullable=True)
    points = Column(Integer, default=0)
    wins = Column(Integer, default=0)
    losses = Column(Integer, default=0)
    
    managed_facilities = relationship("Facility", back_populates="manager")
    participations = relationship("Participation", back_populates="user")

class Facility(Base):
    __tablename__ = "facilities"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    manager_id = Column(String, ForeignKey("users.id"))
    
    # Media & Location
    instagram_handle = Column(String, nullable=True)
    description = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    google_maps_url = Column(String, nullable=True)
    currency = Column(String, default="USD")
    opening_time = Column(String, default="08:00")
    closing_time = Column(String, default="22:00")
    
    manager = relationship("User", back_populates="managed_facilities")
    courts = relationship("Court", back_populates="facility", cascade="all, delete-orphan")
    games = relationship("Game", back_populates="facility", cascade="all, delete-orphan")

class Court(Base):
    __tablename__ = "courts"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    facility_id = Column(Integer, ForeignKey("facilities.id"))
    
    facility = relationship("Facility", back_populates="courts")
    bookings = relationship("Booking", back_populates="court", cascade="all, delete-orphan")
    games = relationship("Game", back_populates="court")

class Game(Base):
    """Represents an Open Play session created by a manager."""
    __tablename__ = "games"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    facility_id = Column(Integer, ForeignKey("facilities.id"))
    court_id = Column(Integer, ForeignKey("courts.id"), nullable=True)
    start_time = Column(DateTime)
    max_players = Column(Integer)
    skill_level = Column(Enum(SkillLevel))
    score_team_a = Column(Integer, default=0)
    score_team_b = Column(Integer, default=0)
    is_finished = Column(Boolean, default=False)
    
    facility = relationship("Facility", back_populates="games")
    court = relationship("Court", back_populates="games")
    participants = relationship("Participation", back_populates="game", cascade="all, delete-orphan")

class Participation(Base):
    """Tracks players joining Open Play games."""
    __tablename__ = "participations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    game_id = Column(Integer, ForeignKey("games.id"))
    
    user = relationship("User", back_populates="participations")
    game = relationship("Game", back_populates="participants")

class Booking(Base):
    """Represents a private 1-hour booking for a court."""
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    court_id = Column(Integer, ForeignKey("courts.id"))
    user_id = Column(String, ForeignKey("users.id"))
    start_time = Column(DateTime)
    
    court = relationship("Court", back_populates="bookings")

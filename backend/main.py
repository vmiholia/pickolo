from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models, schemas
from typing import List, Optional
from datetime import datetime, timedelta

app = FastAPI(title="Pickleheads Clone API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/login", response_model=schemas.User)
def login(user_id: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.put("/users/{user_id}", response_model=schemas.User)
def update_user(user_id: str, user_update: schemas.UserUpdate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.skill_level = user_update.skill_level
    db.commit()
    db.refresh(user)
    return user

@app.get("/users/{user_id}/schedule")
def get_user_schedule(user_id: str, db: Session = Depends(get_db)):
    bookings = db.query(models.Booking).filter(models.Booking.user_id == user_id).all()
    games = db.query(models.Game).join(models.Participation).filter(
        models.Participation.user_id == user_id
    ).all()
    return {
        "bookings": bookings,
        "games": games
    }

@app.get("/facilities", response_model=List[schemas.Facility])
def get_facilities(search: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Facility)
    if search:
        query = query.filter(models.Facility.name.ilike(f"%{search}%"))
    return query.all()

@app.get("/facilities/{facility_id}", response_model=schemas.Facility)
def get_facility(facility_id: int, db: Session = Depends(get_db)):
    facility = db.query(models.Facility).filter(models.Facility.id == facility_id).first()
    if not facility:
        raise HTTPException(status_code=404, detail="Facility not found")
    return facility

@app.put("/facilities/{facility_id}", response_model=schemas.Facility)
def update_facility(facility_id: int, facility_update: schemas.FacilityUpdate, db: Session = Depends(get_db)):
    facility = db.query(models.Facility).filter(models.Facility.id == facility_id).first()
    if not facility:
        raise HTTPException(status_code=404, detail="Facility not found")
    
    update_data = facility_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(facility, key, value)
    
    db.commit()
    db.refresh(facility)
    return facility

@app.get("/facilities/{facility_id}/courts", response_model=List[schemas.Court])
def get_courts(facility_id: int, db: Session = Depends(get_db)):
    return db.query(models.Court).filter(models.Court.facility_id == facility_id).all()

@app.post("/courts", response_model=schemas.Court)
def create_court(court: schemas.CourtCreate, db: Session = Depends(get_db)):
    db_court = models.Court(**court.dict())
    db.add(db_court)
    db.commit()
    db.refresh(db_court)
    return db_court

@app.get("/facilities/{facility_id}/bookings", response_model=List[schemas.Booking])
def get_bookings(facility_id: int, date: str, db: Session = Depends(get_db)):
    try:
        dt = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
         raise HTTPException(status_code=400, detail="Invalid date format, use YYYY-MM-DD")
    
    start_of_day = dt
    end_of_day = dt + timedelta(days=1)
    
    return db.query(models.Booking).join(models.Court).filter(
        models.Court.facility_id == facility_id,
        models.Booking.start_time >= start_of_day,
        models.Booking.start_time < end_of_day
    ).all()

@app.post("/bookings", response_model=schemas.Booking)
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(get_db)):
    # Check if court is booked at that time
    existing = db.query(models.Booking).filter(
        models.Booking.court_id == booking.court_id,
        models.Booking.start_time == booking.start_time
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Court already booked for this hour")
    
    db_booking = models.Booking(**booking.dict())
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

@app.get("/games", response_model=List[schemas.Game])
def get_games(skill_level: Optional[models.SkillLevel] = None, db: Session = Depends(get_db)):
    query = db.query(models.Game)
    if skill_level:
        query = query.filter(models.Game.skill_level == skill_level)
    return query.all()

@app.post("/games", response_model=schemas.Game)
def create_game(game: schemas.GameCreate, db: Session = Depends(get_db)):
    db_game = models.Game(**game.dict())
    db.add(db_game)
    db.commit()
    db.refresh(db_game)
    return db_game

@app.post("/games/{game_id}/join")
def join_game(game_id: int, user_id: str, db: Session = Depends(get_db)):
    # Check if already joined
    existing = db.query(models.Participation).filter(
        models.Participation.game_id == game_id,
        models.Participation.user_id == user_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already joined this game")
    
    participation = models.Participation(user_id=user_id, game_id=game_id)
    db.add(participation)
    db.commit()
    return {"message": "Joined successfully"}

@app.delete("/games/{game_id}/leave")
def leave_game(game_id: int, user_id: str, db: Session = Depends(get_db)):
    participation = db.query(models.Participation).filter(
        models.Participation.game_id == game_id,
        models.Participation.user_id == user_id
    ).first()
    if not participation:
        raise HTTPException(status_code=404, detail="Participation not found")
    db.delete(participation)
    db.commit()
    return {"message": "Left game successfully"}

@app.get("/games/{game_id}/participants")
def get_participants(game_id: int, db: Session = Depends(get_db)):
    return db.query(models.User).join(models.Participation).filter(
        models.Participation.game_id == game_id
    ).all()

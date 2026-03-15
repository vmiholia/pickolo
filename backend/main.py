from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import datetime

import models, schemas
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# User Endpoints
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
    
    update_data = user_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
        
    db.commit()
    db.refresh(user)
    return user

@app.get("/users/{user_id}/schedule", response_model=schemas.UserSchedule)
def get_user_schedule(user_id: str, db: Session = Depends(get_db)):
    bookings = db.query(models.Booking).filter(models.Booking.user_id == user_id).all()
    
    participations = db.query(models.Participation).filter(models.Participation.user_id == user_id).all()
    game_ids = [p.game_id for p in participations]
    games = db.query(models.Game).filter(models.Game.id.in_(game_ids)).all() if game_ids else []
    
    return {"bookings": bookings, "games": games}

@app.get("/leaderboard", response_model=List[schemas.User])
def get_leaderboard(db: Session = Depends(get_db)):
    return db.query(models.User).filter(models.User.role == models.UserRole.PLAYER).order_by(desc(models.User.points)).all()

# Facilities & Courts
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

# Bookings
@app.get("/facilities/{facility_id}/bookings", response_model=List[schemas.Booking])
def get_bookings(facility_id: int, date: str = Query(...), db: Session = Depends(get_db)):
    date_obj = datetime.strptime(date, "%Y-%m-%d").date()
    
    courts = db.query(models.Court).filter(models.Court.facility_id == facility_id).all()
    court_ids = [c.id for c in courts]
    
    if not court_ids:
        return []

    bookings = db.query(models.Booking).filter(
        models.Booking.court_id.in_(court_ids)
    ).all()
    
    return [b for b in bookings if b.start_time.date() == date_obj]

@app.post("/bookings", response_model=schemas.Booking)
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(get_db)):
    db_booking = models.Booking(**booking.dict())
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

@app.delete("/bookings/{booking_id}")
def delete_booking(booking_id: int, db: Session = Depends(get_db)):
    db_booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    db.delete(db_booking)
    db.commit()
    return {"message": "Booking deleted"}

# Games (Open Play)
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

@app.delete("/games/{game_id}")
def delete_game(game_id: int, db: Session = Depends(get_db)):
    db_game = db.query(models.Game).filter(models.Game.id == game_id).first()
    if not db_game:
        raise HTTPException(status_code=404, detail="Game not found")
    db.delete(db_game)
    db.commit()
    return {"message": "Game deleted"}

@app.put("/games/{game_id}/score")
def update_game_score(game_id: int, score: schemas.GameUpdateScore, db: Session = Depends(get_db)):
    db_game = db.query(models.Game).filter(models.Game.id == game_id).first()
    if not db_game:
        raise HTTPException(status_code=404, detail="Game not found")
    db_game.score_team_a = score.score_team_a
    db_game.score_team_b = score.score_team_b
    db_game.is_finished = True
    db.commit()
    return {"message": "Score updated"}

@app.post("/games/{game_id}/join")
def join_game(game_id: int, user_id: str = Query(...), db: Session = Depends(get_db)):
    game = db.query(models.Game).filter(models.Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
        
    existing = db.query(models.Participation).filter(
        models.Participation.game_id == game_id,
        models.Participation.user_id == user_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already joined")
        
    part = models.Participation(user_id=user_id, game_id=game_id)
    db.add(part)
    db.commit()
    return {"message": "Joined successfully"}

@app.delete("/games/{game_id}/leave")
def leave_game(game_id: int, user_id: str = Query(...), db: Session = Depends(get_db)):
    part = db.query(models.Participation).filter(
        models.Participation.game_id == game_id,
        models.Participation.user_id == user_id
    ).first()
    
    if not part:
        raise HTTPException(status_code=404, detail="Not joined")
        
    db.delete(part)
    db.commit()
    return {"message": "Left successfully"}

@app.get("/games/{game_id}/participants", response_model=List[schemas.User])
def get_participants(game_id: int, db: Session = Depends(get_db)):
    participations = db.query(models.Participation).filter(models.Participation.game_id == game_id).all()
    user_ids = [p.user_id for p in participations]
    if not user_ids:
        return []
    return db.query(models.User).filter(models.User.id.in_(user_ids)).all()

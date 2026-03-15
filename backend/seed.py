from database import SessionLocal, engine, Base
from models import User, Facility, Court, UserRole, SkillLevel
from datetime import datetime

def seed_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Create Users
    m1 = User(id="manager1", email="m1@212.com", role=UserRole.MANAGER)
    p1 = User(id="player1", email="p1@gmail.com", role=UserRole.PLAYER, skill_level=SkillLevel.BEGINNER)
    p2 = User(id="player2", email="p2@gmail.com", role=UserRole.PLAYER, skill_level=SkillLevel.INTERMEDIATE)
    db.add_all([m1, p1, p2])
    db.commit()

    # Create Facility 212
    f212 = Facility(
        name="212 Pickleball NYC", 
        manager_id="manager1",
        description="The premier indoor pickleball destination in the heart of NYC.",
        instagram_handle="pickleball212",
        latitude=40.7128,
        longitude=-74.0060
    )
    db.add(f212)
    db.commit()

    # Create 4 Courts for 212
    for i in range(1, 5):
        court = Court(name=f"Court {i}", facility_id=f212.id)
        db.add(court)
    db.commit()

    print("Database seeded successfully with only 212 Pickleball NYC!")
    db.close()

if __name__ == "__main__":
    seed_db()

from fastapi.testclient import TestClient
from sqlalchemy import create_mock_engine
from sqlalchemy.orm import sessionmaker
from main import app
from database import Base, get_db
import pytest
from sqlalchemy import create_engine
import os

# Use an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    # Seed a player
    from models import User, UserRole, SkillLevel, Facility, Court
    db = TestingSessionLocal()
    if not db.query(User).filter(User.id == "player1").first():
        user = User(id="player1", email="p1@test.com", role=UserRole.PLAYER, skill_level=SkillLevel.BEGINNER)
        db.add(user)
        manager = User(id="manager1", email="m1@test.com", role=UserRole.MANAGER)
        db.add(manager)
        facility = Facility(id=1, name="Test Facility", manager_id="manager1")
        db.add(facility)
        court = Court(id=1, name="Court 1", facility_id=1)
        db.add(court)
        db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)
    if os.path.exists("./test.db"):
        os.remove("./test.db")

def test_login():
    response = client.post("/login?user_id=player1")
    assert response.status_code == 200
    assert response.json()["id"] == "player1"

def test_login_invalid():
    response = client.post("/login?user_id=nonexistent")
    assert response.status_code == 404

def test_create_booking_success():
    data = {
        "court_id": 1,
        "user_id": "player1",
        "start_time": "2026-03-15T10:00:00"
    }
    response = client.post("/bookings", json=data)
    assert response.status_code == 200
    assert response.json()["court_id"] == 1

def test_create_booking_overlap_fail():
    data = {
        "court_id": 1,
        "user_id": "player1",
        "start_time": "2026-03-15T10:00:00"
    }
    # Second attempt should fail due to the new overlap check
    response = client.post("/bookings", json=data)
    assert response.status_code == 400
    assert response.json()["detail"] == "Court already booked for this time."

def test_get_user_schedule():
    response = client.get("/users/player1/schedule")
    assert response.status_code == 200
    assert len(response.json()["bookings"]) > 0

def test_update_facility_auth_success():
    data = {"name": "Updated Name"}
    response = client.put("/facilities/1?user_id=manager1", json=data)
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Name"

def test_update_facility_auth_fail():
    data = {"name": "Should Fail"}
    response = client.put("/facilities/1?user_id=player1", json=data)
    assert response.status_code == 403
    assert response.json()["detail"] == "Not authorized to manage this facility"

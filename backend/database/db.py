"""
SQLAlchemy Database Setup
"""
import json
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, Float, String, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = "sqlite:///./flood_analysis.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class AnalysisSession(Base):
    __tablename__ = "analysis_sessions"

    id            = Column(Integer, primary_key=True, index=True)
    created_at    = Column(DateTime, default=datetime.utcnow)
    rows          = Column(Integer)
    cols          = Column(Integer)
    risk_score    = Column(Float)
    risk_level    = Column(String(20))
    stats_json    = Column(Text)     # JSON blob
    result_json   = Column(Text)     # full result JSON


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def save_session(db, result: dict) -> AnalysisSession:
    session = AnalysisSession(
        rows=result.get("rows", 0),
        cols=result.get("cols", 0),
        risk_score=result.get("risk_score", 0),
        risk_level=result.get("risk_level", ""),
        stats_json=json.dumps(result.get("stats", {})),
        result_json=json.dumps({
            k: v for k, v in result.items()
            if k not in ("cells",)   # exclude very large field from db
        }),
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

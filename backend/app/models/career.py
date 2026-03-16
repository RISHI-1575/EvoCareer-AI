from sqlalchemy import Column, Integer, String, Float, JSON, DateTime, ForeignKey, func, Text, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base


class CareerProfile(Base):
    __tablename__ = "career_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    raw_input = Column(Text, nullable=False)
    intent_label = Column(String(100))
    intent_confidence = Column(Float)
    confidence_score = Column(Float)
    skills_json = Column(JSON, default=list)
    tools_json = Column(JSON, default=list)
    roles_json = Column(JSON, default=list)
    domains_json = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    user = relationship("User", backref="career_profiles")


class Skill(Base):
    __tablename__ = "skills"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100))
    proficiency = Column(Float, default=0.5)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Simulation(Base):
    __tablename__ = "simulations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    profile_id = Column(Integer, ForeignKey("career_profiles.id", ondelete="SET NULL"), nullable=True)
    simulation_type = Column(String(100))
    input_data = Column(JSON)
    output_data = Column(JSON)
    feasibility_score = Column(Float)
    is_validated = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", backref="simulations")


class Startup(Base):
    __tablename__ = "startups"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    idea_input = Column(Text, nullable=False)
    problem = Column(Text)
    market_data = Column(JSON)
    revenue_model = Column(JSON)
    mvp_plan = Column(JSON)
    pitch_deck = Column(Text)
    feasibility_score = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", backref="startups")


class InterviewSession(Base):
    __tablename__ = "interview_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    original_text = Column(Text, nullable=False)
    hesitation_score = Column(Float)
    confidence_score = Column(Float)
    strong_rewrite = Column(Text)
    leadership_rewrite = Column(Text)
    analysis = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", backref="interview_sessions")
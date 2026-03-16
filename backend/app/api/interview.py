from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.career import InterviewSession
from app.schemas.schemas import InterviewInput
from app.nlp.processor import analyze_confidence
from app.agents.agents import InterviewCoachAgent

router = APIRouter()
coach_agent = InterviewCoachAgent()


@router.post("/analyze", status_code=201)
def analyze_interview(data: InterviewInput, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    analysis = analyze_confidence(data.text)
    coaching = coach_agent.coach(data.text, analysis)
    session = InterviewSession(user_id=current_user.id, original_text=data.text, hesitation_score=analysis["hesitation_score"], confidence_score=analysis["confidence_score"], strong_rewrite=coaching.get("strong_rewrite",""), leadership_rewrite=coaching.get("leadership_rewrite",""), analysis={**analysis, "coaching_notes": coaching.get("coaching_notes","")})
    db.add(session)
    db.commit()
    db.refresh(session)
    return {"session_id": session.id, "analysis": analysis, "strong_rewrite": coaching.get("strong_rewrite"), "leadership_rewrite": coaching.get("leadership_rewrite"), "key_improvements": coaching.get("key_improvements",[]), "coaching_notes": coaching.get("coaching_notes",""), "created_at": session.created_at.isoformat()}


@router.get("/list")
def list_sessions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sessions = db.query(InterviewSession).filter(InterviewSession.user_id == current_user.id).order_by(InterviewSession.created_at.desc()).limit(20).all()
    return [{"id": s.id, "original_text": s.original_text[:80], "confidence_score": s.confidence_score, "created_at": s.created_at.isoformat()} for s in sessions]
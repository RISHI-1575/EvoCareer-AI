from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.career import Startup
from app.schemas.schemas import StartupInput
from app.agents.agents import StartupGeneratorAgent, FeasibilityValidatorAgent, NarrativeBuilderAgent

router = APIRouter()
startup_agent = StartupGeneratorAgent()
validator_agent = FeasibilityValidatorAgent()
narrative_agent = NarrativeBuilderAgent()


@router.post("/generate", status_code=201)
def generate_startup(data: StartupInput, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    blueprint = startup_agent.generate_blueprint(data.idea)
    validation = validator_agent.validate(blueprint)
    final_score = validation.get("feasibility_score", blueprint.get("feasibility_score", 0.6))
    startup = Startup(user_id=current_user.id, idea_input=data.idea, problem=blueprint.get("problem_statement"), market_data=blueprint.get("market"), revenue_model=blueprint.get("revenue"), mvp_plan=blueprint.get("mvp"), feasibility_score=final_score)
    db.add(startup)
    db.commit()
    db.refresh(startup)
    return {"startup_id": startup.id, "blueprint": blueprint, "validation": validation, "created_at": startup.created_at.isoformat()}


@router.post("/{startup_id}/pitch")
def generate_pitch(startup_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    startup = db.query(Startup).filter(Startup.id == startup_id, Startup.user_id == current_user.id).first()
    if not startup:
        raise HTTPException(status_code=404, detail="Startup not found")
    blueprint = {"problem_statement": startup.problem, "solution": startup.problem, "target_customer": "Target Market", "market": startup.market_data or {}, "revenue": startup.revenue_model or {}, "mvp": startup.mvp_plan or {}}
    narrative = narrative_agent.build_narrative(blueprint)
    startup.pitch_deck = narrative.get("investor_narrative", "")
    db.commit()
    return {"startup_id": startup.id, "narrative": narrative}


@router.get("/list")
def list_startups(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    startups = db.query(Startup).filter(Startup.user_id == current_user.id).order_by(Startup.created_at.desc()).limit(10).all()
    return [{"id": s.id, "idea_input": s.idea_input[:80], "problem": s.problem, "feasibility_score": s.feasibility_score, "created_at": s.created_at.isoformat()} for s in startups]
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.career import CareerProfile, Simulation
from app.schemas.schemas import SimulationInput
from app.agents.agents import CareerSimulationAgent

router = APIRouter()
sim_agent = CareerSimulationAgent()


@router.post("/run", status_code=201)
def run_simulation(data: SimulationInput, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile = db.query(CareerProfile).filter(CareerProfile.id == data.profile_id, CareerProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile_data = {"skills_json": profile.skills_json, "tools_json": profile.tools_json, "roles_json": profile.roles_json, "domains_json": profile.domains_json, "intent_label": profile.intent_label, "confidence_score": profile.confidence_score}
    output = sim_agent.simulate(profile_data=profile_data, simulation_type=data.simulation_type, context=data.additional_context)
    sim = Simulation(user_id=current_user.id, profile_id=profile.id, simulation_type=data.simulation_type, input_data=profile_data, output_data=output, feasibility_score=output.get("feasibility_score", 0.6), is_validated=True)
    db.add(sim)
    db.commit()
    db.refresh(sim)
    return {"simulation_id": sim.id, "output": output, "created_at": sim.created_at.isoformat()}


@router.get("/list")
def list_simulations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sims = db.query(Simulation).filter(Simulation.user_id == current_user.id).order_by(Simulation.created_at.desc()).limit(10).all()
    return [{"id": s.id, "simulation_type": s.simulation_type, "feasibility_score": s.feasibility_score, "created_at": s.created_at.isoformat()} for s in sims]


@router.get("/{sim_id}")
def get_simulation(sim_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    s = db.query(Simulation).filter(Simulation.id == sim_id, Simulation.user_id == current_user.id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return {"id": s.id, "simulation_type": s.simulation_type, "output_data": s.output_data, "feasibility_score": s.feasibility_score}
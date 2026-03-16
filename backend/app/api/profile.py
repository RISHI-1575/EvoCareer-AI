import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.career import CareerProfile
from app.nlp.processor import process_text
from app.nlp.resume_parser import parse_resume
from app.integrations.github import fetch_github_profile
from app.integrations.linkedin import fetch_linkedin_profile
from app.agents.agents import PersonaAgent

router = APIRouter()
persona_agent = PersonaAgent()
logger = logging.getLogger(__name__)

FORBIDDEN = ["ignore previous", "system:", "you are now", "jailbreak", "dan mode"]


@router.post("/analyze", status_code=201)
async def analyze_profile(
    raw_text:     str                  = Form(...),
    github_url:   Optional[str]        = Form(None),
    linkedin_url: Optional[str]        = Form(None),
    resume:       Optional[UploadFile] = File(None),
    db:           Session              = Depends(get_db),
    current_user: User                 = Depends(get_current_user),
):
    raw_text = raw_text.strip()
    if len(raw_text) < 20:
        raise HTTPException(status_code=422, detail="Please provide more detail (min 20 chars)")
    if len(raw_text) > 5000:
        raise HTTPException(status_code=422, detail="Input too long (max 5000 chars)")
    for phrase in FORBIDDEN:
        if phrase in raw_text.lower():
            raise HTTPException(status_code=422, detail="Invalid input detected")

    resume_text = ""
    if resume and resume.filename:
        try:
            file_bytes = await resume.read()
            if len(file_bytes) > 5 * 1024 * 1024:
                raise HTTPException(status_code=413, detail="Resume too large (max 5MB)")
            resume_text = parse_resume(file_bytes, resume.content_type or "")
        except HTTPException:
            raise
        except Exception as e:
            logger.warning(f"Resume parse error: {e}")

    github_data = None
    if github_url and github_url.strip():
        try:
            github_data = await fetch_github_profile(github_url.strip())
        except Exception as e:
            logger.warning(f"GitHub error: {e}")

    linkedin_data = None
    if linkedin_url and linkedin_url.strip():
        try:
            linkedin_data = await fetch_linkedin_profile(linkedin_url.strip())
        except Exception as e:
            logger.warning(f"LinkedIn error: {e}")

    nlp      = process_text(raw_text, resume_text, github_data, linkedin_data)
    entities = nlp["entities"]
    conf     = nlp["confidence_analysis"]

    persona = persona_agent.generate_persona(
        entities=entities,
        intent=nlp["intent_label"],
        raw_text=raw_text,
        resume_text=resume_text,
        github_data=github_data,
        linkedin_data=linkedin_data,
    )

    profile = CareerProfile(
        user_id           = current_user.id,
        raw_input         = raw_text,
        intent_label      = nlp["intent_label"],
        intent_confidence = nlp["intent_confidence"],
        confidence_score  = conf["confidence_score"],
        skills_json       = entities["skills"],
        tools_json        = entities["tools"],
        roles_json        = entities["roles"],
        domains_json      = entities["domains"],
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    return {
        "profile_id":          profile.id,
        "intent_label":        nlp["intent_label"],
        "intent_confidence":   nlp["intent_confidence"],
        "confidence_analysis": conf,
        "entities":            entities,
        "persona":             persona,
        "sources": {
            "has_resume":    bool(resume_text),
            "has_github":    bool(github_data),
            "has_linkedin":  bool(linkedin_data),
            "github_data":   github_data,
            "linkedin_data": linkedin_data,
        },
        "created_at": profile.created_at.isoformat(),
    }


@router.get("/list")
def list_profiles(
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    profiles = (
        db.query(CareerProfile)
        .filter(CareerProfile.user_id == current_user.id)
        .order_by(CareerProfile.created_at.desc())
        .limit(20)
        .all()
    )
    return [
        {
            "id":               p.id,
            "intent_label":     p.intent_label,
            "confidence_score": p.confidence_score,
            "skills":           p.skills_json,
            "tools":            p.tools_json,
            "roles":            p.roles_json,
            "domains":          p.domains_json,
            "created_at":       p.created_at.isoformat(),
        }
        for p in profiles
    ]


@router.get("/{profile_id}")
def get_profile(
    profile_id:   int,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    p = (
        db.query(CareerProfile)
        .filter(CareerProfile.id == profile_id, CareerProfile.user_id == current_user.id)
        .first()
    )
    if not p:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {
        "id":           p.id,
        "intent_label": p.intent_label,
        "entities": {
            "skills":  p.skills_json,
            "tools":   p.tools_json,
            "roles":   p.roles_json,
            "domains": p.domains_json,
        },
    }

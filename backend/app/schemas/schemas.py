from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime


class UserRegister(BaseModel):
    email: EmailStr
    full_name: str
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @field_validator("full_name")
    @classmethod
    def validate_name(cls, v):
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Name too short")
        if any(c in v for c in ["<", ">", "{", "}", ";"]):
            raise ValueError("Invalid characters in name")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class ProfileInput(BaseModel):
    raw_text: str

    @field_validator("raw_text")
    @classmethod
    def validate_text(cls, v):
        v = v.strip()
        if len(v) < 20:
            raise ValueError("Please provide more detail (minimum 20 characters)")
        if len(v) > 5000:
            raise ValueError("Input too long (maximum 5000 characters)")
        forbidden = ["ignore previous", "system:", "you are now", "jailbreak", "dan mode"]
        lower = v.lower()
        for phrase in forbidden:
            if phrase in lower:
                raise ValueError("Invalid input detected")
        return v


class SimulationInput(BaseModel):
    profile_id: int
    simulation_type: str
    additional_context: Optional[str] = None

    @field_validator("simulation_type")
    @classmethod
    def validate_type(cls, v):
        allowed = ["5_year_plan", "career_switch", "promotion_path", "freelance_path"]
        if v not in allowed:
            raise ValueError(f"simulation_type must be one of {allowed}")
        return v


class CareerMilestone(BaseModel):
    year: int
    title: str
    role: str
    skills_needed: List[str]
    salary_range: str
    probability: float


class SimulationOutput(BaseModel):
    simulation_type: str
    summary: str
    milestones: List[CareerMilestone]
    risks: List[str]
    opportunities: List[str]
    feasibility_score: float
    recommended_actions: List[str]


class StartupInput(BaseModel):
    idea: str

    @field_validator("idea")
    @classmethod
    def validate_idea(cls, v):
        v = v.strip()
        if len(v) < 20:
            raise ValueError("Please describe your idea in more detail")
        if len(v) > 3000:
            raise ValueError("Input too long")
        lower = v.lower()
        for phrase in ["ignore previous", "system:", "jailbreak"]:
            if phrase in lower:
                raise ValueError("Invalid input")
        return v


class MarketData(BaseModel):
    tam: str
    sam: str
    som: str
    competitors: List[str]
    differentiators: List[str]


class RevenueModel(BaseModel):
    primary: str
    streams: List[str]
    pricing_strategy: str
    unit_economics: str


class MVPPlan(BaseModel):
    core_features: List[str]
    tech_stack: List[str]
    timeline_weeks: int
    estimated_cost: str
    success_metrics: List[str]


class StartupBlueprintOutput(BaseModel):
    problem_statement: str
    solution: str
    target_customer: str
    market: MarketData
    revenue: RevenueModel
    mvp: MVPPlan
    risks: List[str]
    feasibility_score: float


class InterviewInput(BaseModel):
    text: str

    @field_validator("text")
    @classmethod
    def validate_text(cls, v):
        v = v.strip()
        if len(v) < 10:
            raise ValueError("Please provide more text")
        if len(v) > 2000:
            raise ValueError("Text too long (max 2000 chars)")
        return v
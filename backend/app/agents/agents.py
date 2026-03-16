import json
import logging
from typing import Dict, Any, Optional

import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger(__name__)

# Configure Gemini
if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your-gemini-api-key-here":
    genai.configure(api_key=settings.GEMINI_API_KEY)


class BaseAgent:
    MAX_RETRIES = 2
    MODEL = settings.GEMINI_MODEL

    def _call_llm(self, system_prompt: str, user_prompt: str) -> str:
        model = genai.GenerativeModel(
            model_name=self.MODEL,
            system_instruction=system_prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.7,
            ),
        )
        response = model.generate_content(user_prompt)
        return response.text

    def _validate_json(self, raw: str) -> Dict:
        try:
            return json.loads(raw)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON from Gemini: {e}")


class PersonaAgent(BaseAgent):
    SYSTEM_PROMPT = """You are a career profiling AI. Analyze the career background and return ONLY JSON:
{
  "persona_title": "professional identity in 3-5 words",
  "strengths": ["5 key strengths"],
  "growth_areas": ["3 growth areas"],
  "career_archetype": "Builder|Analyst|Innovator|Leader|Specialist|Communicator",
  "recommended_paths": ["3 career paths"],
  "unique_value_proposition": "one sentence unique value"
}"""

    def generate_persona(self, entities: Dict, intent: str, raw_text: str, **kwargs) -> Dict:
        # kwargs may include resume_text, github_data, linkedin_data
        resume_text = kwargs.get("resume_text", "")
        github_data = kwargs.get("github_data")
        linkedin_data = kwargs.get("linkedin_data")

        prompt = (
            f"Intent: {intent}\n"
            f"Skills: {', '.join(entities.get('skills', []))}\n"
            f"Roles: {', '.join(entities.get('roles', []))}\n"
            f"Context: {raw_text[:400]}"
        )
        if resume_text:
            prompt += f"\nResume excerpt: {resume_text[:300]}"
        if github_data:
            langs = ", ".join(github_data.get("top_languages", []))
            prompt += f"\nGitHub languages: {langs}"
        if linkedin_data:
            headline = linkedin_data.get("headline", "")
            prompt += f"\nLinkedIn headline: {headline}"

        for attempt in range(self.MAX_RETRIES + 1):
            try:
                return self._validate_json(self._call_llm(self.SYSTEM_PROMPT, prompt))
            except Exception as e:
                logger.warning(f"PersonaAgent attempt {attempt} failed: {e}")
                if attempt == self.MAX_RETRIES:
                    return {"persona_title": "Emerging Professional", "strengths": entities.get("skills", [])[:3] + ["adaptability", "learning"], "growth_areas": ["leadership", "communication", "specialization"], "career_archetype": "Builder", "recommended_paths": ["IC Track", "Management", "Entrepreneurship"], "unique_value_proposition": "A versatile professional with growth mindset."}


class CareerSimulationAgent(BaseAgent):
    SYSTEM_PROMPT = """Generate career simulation. Return ONLY JSON:
{
  "simulation_type": "string",
  "summary": "string",
  "milestones": [{"year":int,"title":"string","role":"string","skills_needed":["string"],"salary_range":"string","probability":0.0}],
  "risks": ["string"],
  "opportunities": ["string"],
  "feasibility_score": 0.0,
  "recommended_actions": ["string"]
}
milestones must have exactly 5 items for years 1,2,3,5,10."""

    def simulate(self, profile_data: Dict, simulation_type: str, context: Optional[str] = None) -> Dict:
        prompt = json.dumps({"simulation_type": simulation_type, "profile": {"skills": profile_data.get("skills_json", [])[:8], "roles": profile_data.get("roles_json", [])[:4], "domains": profile_data.get("domains_json", [])[:4], "intent": profile_data.get("intent_label")}, "context": context[:200] if context else None})
        for attempt in range(self.MAX_RETRIES + 1):
            try:
                return self._validate_json(self._call_llm(self.SYSTEM_PROMPT, prompt))
            except Exception as e:
                logger.warning(f"SimulationAgent attempt {attempt} failed: {e}")
                if attempt == self.MAX_RETRIES:
                    return {"simulation_type": simulation_type, "summary": "Simulation based on your profile.", "milestones": [{"year": y, "title": f"Year {y}", "role": "Professional", "skills_needed": ["leadership"], "salary_range": f"${70+i*15}k-${90+i*20}k", "probability": 0.85-i*0.06} for i, y in enumerate([1,2,3,5,10])], "risks": ["Market changes"], "opportunities": ["AI growth"], "feasibility_score": 0.72, "recommended_actions": ["Build portfolio", "Network actively"]}


class StartupGeneratorAgent(BaseAgent):
    SYSTEM_PROMPT = """Generate startup blueprint. Return ONLY JSON:
{
  "problem_statement": "string",
  "solution": "string",
  "target_customer": "string",
  "market": {"tam":"string","sam":"string","som":"string","competitors":["string"],"differentiators":["string"]},
  "revenue": {"primary":"string","streams":["string"],"pricing_strategy":"string","unit_economics":"string"},
  "mvp": {"core_features":["string"],"tech_stack":["string"],"timeline_weeks":int,"estimated_cost":"string","success_metrics":["string"]},
  "risks": ["string"],
  "feasibility_score": 0.0
}"""

    def generate_blueprint(self, idea: str) -> Dict:
        for attempt in range(self.MAX_RETRIES + 1):
            try:
                return self._validate_json(self._call_llm(self.SYSTEM_PROMPT, f"Startup idea: {idea[:500]}"))
            except Exception as e:
                logger.warning(f"StartupAgent attempt {attempt} failed: {e}")
                if attempt == self.MAX_RETRIES:
                    raise


class FeasibilityValidatorAgent(BaseAgent):
    SYSTEM_PROMPT = """Validate startup feasibility. Return ONLY JSON:
{
  "is_feasible": true,
  "feasibility_score": 0.0,
  "validation_notes": ["string"],
  "red_flags": ["string"],
  "adjusted_timeline_weeks": int,
  "confidence": "high|medium|low"
}"""

    def validate(self, blueprint: Dict) -> Dict:
        payload = json.dumps({"problem": blueprint.get("problem_statement","")[:150], "market_tam": blueprint.get("market",{}).get("tam"), "timeline": blueprint.get("mvp",{}).get("timeline_weeks"), "cost": blueprint.get("mvp",{}).get("estimated_cost")})
        try:
            return self._validate_json(self._call_llm(self.SYSTEM_PROMPT, payload))
        except Exception:
            return {"is_feasible": True, "feasibility_score": blueprint.get("feasibility_score", 0.65), "validation_notes": [], "red_flags": [], "adjusted_timeline_weeks": 12, "confidence": "medium"}


class NarrativeBuilderAgent(BaseAgent):
    SYSTEM_PROMPT = """Write startup pitch. Return ONLY JSON:
{
  "elevator_pitch": "string",
  "investor_narrative": "string",
  "tagline": "string",
  "unique_insight": "string"
}"""

    def build_narrative(self, blueprint: Dict) -> Dict:
        payload = json.dumps({"problem": blueprint.get("problem_statement","")[:150], "solution": blueprint.get("solution","")[:150], "target": blueprint.get("target_customer","")[:80], "tam": blueprint.get("market",{}).get("tam")})
        try:
            return self._validate_json(self._call_llm(self.SYSTEM_PROMPT, payload))
        except Exception:
            return {"elevator_pitch": "We solve this problem better than anyone.", "investor_narrative": "Pitch unavailable.", "tagline": "The future is here.", "unique_insight": "Unique insight unavailable."}


class InterviewCoachAgent(BaseAgent):
    SYSTEM_PROMPT = """You are an executive interview coach. Return ONLY JSON:
{
  "strong_rewrite": "confident direct results-focused rewrite",
  "leadership_rewrite": "rewrite emphasizing leadership and strategy",
  "key_improvements": ["list of 3-5 improvements"],
  "coaching_notes": "brief explanation of main issues"
}"""

    def coach(self, original_text: str, analysis: Dict) -> Dict:
        payload = json.dumps({"original": original_text[:600], "issues": {"hedging": analysis.get("hedging_phrases",[])[:4], "passive_voice": analysis.get("passive_voice_count",0), "confidence": analysis.get("confidence_score",50)}})
        for attempt in range(self.MAX_RETRIES + 1):
            try:
                data = self._validate_json(self._call_llm(self.SYSTEM_PROMPT, payload))
                if "strong_rewrite" not in data:
                    raise ValueError("Missing field")
                return data
            except Exception as e:
                logger.warning(f"InterviewCoach attempt {attempt} failed: {e}")
                if attempt == self.MAX_RETRIES:
                    return {"strong_rewrite": original_text, "leadership_rewrite": original_text, "key_improvements": ["Remove hedging language", "Use active voice", "Quantify achievements"], "coaching_notes": "Coaching service temporarily unavailable."}
export interface User { id:number; email:string; full_name:string; role:string; created_at:string }
export interface Entities { skills:string[]; tools:string[]; roles:string[]; domains:string[] }
export interface ConfidenceAnalysis { passive_voice_count:number; hedging_phrases:string[]; filler_words:string[]; sentiment_score:number; vocabulary_richness:number; hesitation_score:number; confidence_score:number }
export interface Persona { persona_title:string; strengths:string[]; growth_areas:string[]; career_archetype:string; recommended_paths:string[]; unique_value_proposition:string }
export interface ProfileResult { profile_id:number; intent_label:string; intent_confidence:number; confidence_analysis:ConfidenceAnalysis; entities:Entities; persona:Persona; created_at:string }
export interface CareerMilestone { year:number; title:string; role:string; skills_needed:string[]; salary_range:string; probability:number }
export interface SimulationResult { simulation_id:number; output:{ simulation_type:string; summary:string; milestones:CareerMilestone[]; risks:string[]; opportunities:string[]; feasibility_score:number; recommended_actions:string[] }; created_at:string }
export interface StartupResult { startup_id:number; blueprint:any; validation:any; created_at:string }
export interface InterviewResult { session_id:number; analysis:ConfidenceAnalysis; strong_rewrite:string; leadership_rewrite:string; key_improvements:string[]; coaching_notes:string; created_at:string }
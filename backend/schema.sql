CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS career_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    raw_input TEXT NOT NULL,
    intent_label VARCHAR(100),
    intent_confidence FLOAT,
    confidence_score FLOAT,
    skills_json JSONB DEFAULT '[]',
    tools_json JSONB DEFAULT '[]',
    roles_json JSONB DEFAULT '[]',
    domains_json JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    proficiency FLOAT DEFAULT 0.5,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS simulations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_id INTEGER REFERENCES career_profiles(id) ON DELETE SET NULL,
    simulation_type VARCHAR(100),
    input_data JSONB,
    output_data JSONB,
    feasibility_score FLOAT,
    is_validated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS startups (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    idea_input TEXT NOT NULL,
    problem TEXT,
    market_data JSONB,
    revenue_model JSONB,
    mvp_plan JSONB,
    pitch_deck TEXT,
    feasibility_score FLOAT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interview_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_text TEXT NOT NULL,
    hesitation_score FLOAT,
    confidence_score FLOAT,
    strong_rewrite TEXT,
    leadership_rewrite TEXT,
    analysis JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_career_profiles_user ON career_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_simulations_user ON simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_startups_user ON startups(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user ON interview_sessions(user_id);
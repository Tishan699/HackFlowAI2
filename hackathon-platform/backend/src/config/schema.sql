-- ====================================================================
-- HackFlow AI Platform - Supabase PostgreSQL Database Schema
-- Database: postgresql://postgres:HackflowAI@6999@db.afoihoajkbilpisyrsfc.supabase.co:5432/postgres
-- ====================================================================

-- 1. Users Table (Multi-organizer, Participants, Judges, Mentors)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'participant',
    organization VARCHAR(255),
    avatar VARCHAR(10),
    is_email_verified BOOLEAN DEFAULT FALSE,
    mfa_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE
);

-- 2. OTP Codes Table (Email verification & 2FA Login security)
CREATE TABLE IF NOT EXISTS otps (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(10) NOT NULL,
    purpose VARCHAR(50) NOT NULL,
    expires_at BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Hackathons / Events Table (Multi-Organizer Event Scoping & Details)
CREATE TABLE IF NOT EXISTS hackathons (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    tagline TEXT,
    description TEXT,
    date VARCHAR(100),
    start_date VARCHAR(50),
    end_date VARCHAR(50),
    participants INTEGER DEFAULT 0,
    max_teams INTEGER DEFAULT 100,
    status VARCHAR(50) DEFAULT 'Upcoming',
    badge VARCHAR(50) DEFAULT 'Registration Open',
    category VARCHAR(100) DEFAULT 'AI & Machine Learning',
    prize_pool VARCHAR(100) DEFAULT '$10,000',
    location VARCHAR(255) DEFAULT 'Hybrid',
    organizer_id VARCHAR(255),
    organizer_email VARCHAR(255),
    organizer VARCHAR(255),
    rules JSONB DEFAULT '[]'::jsonb,
    timeline JSONB DEFAULT '[]'::jsonb,
    prizes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Teams Table
CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    leader VARCHAR(255),
    leader_email VARCHAR(255),
    hackathon_id VARCHAR(255) NOT NULL,
    hackathon_title VARCHAR(255),
    project_title VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Registered',
    checked_in BOOLEAN DEFAULT FALSE,
    check_in_time TIMESTAMP WITH TIME ZONE,
    members JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Submissions / Projects Table (With AI Evaluation Rubrics)
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    tagline TEXT,
    team_name VARCHAR(255),
    team_id VARCHAR(255),
    hackathon_id VARCHAR(255),
    category VARCHAR(100),
    description TEXT,
    github_url TEXT,
    demo_url TEXT,
    video_url TEXT,
    tech_stack JSONB DEFAULT '[]'::jsonb,
    ai_score NUMERIC(5,2),
    ai_review JSONB,
    rubric_breakdown JSONB,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Judges Table
CREATE TABLE IF NOT EXISTS judges (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    company VARCHAR(255),
    role VARCHAR(100),
    expertise JSONB DEFAULT '[]'::jsonb,
    assigned_hackathons JSONB DEFAULT '[]'::jsonb,
    scored_projects INTEGER DEFAULT 0
);

-- 7. Mentors Table
CREATE TABLE IF NOT EXISTS mentors (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    company VARCHAR(255),
    role VARCHAR(100),
    expertise JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'Available',
    scheduled_sessions INTEGER DEFAULT 0
);

-- 8. QR Attendance & Check-ins Table
CREATE TABLE IF NOT EXISTS attendance (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    user_name VARCHAR(255),
    email VARCHAR(255),
    hackathon_id VARCHAR(255),
    role VARCHAR(50),
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'Checked-in',
    scan_method VARCHAR(50) DEFAULT 'QR'
);

-- 9. Hackathon Members Table (Contextual Per-Event RBAC: PARTICIPANT, JUDGE, ORGANIZER)
CREATE TABLE IF NOT EXISTS hackathon_members (
    id VARCHAR(255) PRIMARY KEY,
    hackathon_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'PARTICIPANT',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    source VARCHAR(50) DEFAULT 'REGISTRATION',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Judge Applications Table (User Application & AI Review Workflow)
CREATE TABLE IF NOT EXISTS judge_applications (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    hackathon_id VARCHAR(255) NOT NULL,
    hackathon_title VARCHAR(255),
    experience_years INTEGER DEFAULT 0,
    organization VARCHAR(255),
    title VARCHAR(255),
    expertise TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    previous_judging TEXT,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    ai_evaluation JSONB DEFAULT '{}'::jsonb,
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Judge Invitations Table (Direct Organizer Invitations)
CREATE TABLE IF NOT EXISTS judge_invitations (
    id VARCHAR(255) PRIMARY KEY,
    hackathon_id VARCHAR(255) NOT NULL,
    hackathon_title VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    judge_name VARCHAR(255),
    role_description TEXT,
    expertise TEXT,
    invited_by VARCHAR(255),
    invited_by_email VARCHAR(255),
    token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Event Change History & Audit Log Table (Sensitive Field Restrictions)
CREATE TABLE IF NOT EXISTS event_change_history (
    id VARCHAR(255) PRIMARY KEY,
    hackathon_id VARCHAR(255) NOT NULL,
    hackathon_title VARCHAR(255),
    organizer_id VARCHAR(255) NOT NULL,
    organizer_name VARCHAR(255),
    field VARCHAR(100) NOT NULL,
    before_value TEXT,
    after_value TEXT,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'PENDING_APPROVAL',
    ai_analysis JSONB DEFAULT '{}'::jsonb,
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Organizer Applications Table (Host Verification & Admin Approval)
CREATE TABLE IF NOT EXISTS organizer_applications (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    organization_name VARCHAR(255) NOT NULL,
    website TEXT,
    official_email VARCHAR(255),
    contact_phone VARCHAR(50),
    past_events TEXT,
    proposal TEXT NOT NULL,
    estimated_participants INTEGER DEFAULT 100,
    status VARCHAR(50) DEFAULT 'PENDING',
    ai_evaluation JSONB DEFAULT '{}'::jsonb,
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create helpful indexes for performance
CREATE INDEX IF NOT EXISTS idx_hackathons_organizer ON hackathons(organizer_id);
CREATE INDEX IF NOT EXISTS idx_teams_hackathon ON teams(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_projects_hackathon ON projects(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_otps_email ON otps(email);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_hackathon_members ON hackathon_members(hackathon_id, user_id, role);
CREATE INDEX IF NOT EXISTS idx_judge_applications ON judge_applications(hackathon_id, status);
CREATE INDEX IF NOT EXISTS idx_event_change_history ON event_change_history(hackathon_id, status);
CREATE INDEX IF NOT EXISTS idx_organizer_applications ON organizer_applications(status);

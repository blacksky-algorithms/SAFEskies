-- Create the auth_states table
CREATE TABLE IF NOT EXISTS auth_states (
    key TEXT PRIMARY KEY,
    state TEXT NOT NULL
);

-- Create the auth_sessions table
CREATE TABLE IF NOT EXISTS auth_sessions (
    key TEXT PRIMARY KEY,
    session TEXT NOT NULL
);

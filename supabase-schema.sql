-- Supabase Database Schema for Crypto Faucet
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Table for storing ad verification sessions
CREATE TABLE IF NOT EXISTS ad_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    session_id TEXT UNIQUE NOT NULL,
    ad_type TEXT NOT NULL CHECK (ad_type IN ('propeller', 'mock')),
    ad_id TEXT,
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    duration INTEGER NOT NULL DEFAULT 0,
    ip_address TEXT NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    propeller_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table for rate limiting
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_address TEXT UNIQUE NOT NULL,
    ip_address TEXT NOT NULL,
    last_claim_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    claim_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ad_verifications_session_id ON ad_verifications(session_id);
CREATE INDEX IF NOT EXISTS idx_ad_verifications_wallet_address ON ad_verifications(wallet_address);
CREATE INDEX IF NOT EXISTS idx_ad_verifications_created_at ON ad_verifications(created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_wallet_address ON rate_limits(wallet_address);
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_address ON rate_limits(ip_address);
CREATE INDEX IF NOT EXISTS idx_rate_limits_last_claim_time ON rate_limits(last_claim_time);

-- Row Level Security (RLS) policies
ALTER TABLE ad_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access (adjust based on your security needs)
CREATE POLICY "Allow public access to ad_verifications" ON ad_verifications
    FOR ALL USING (true);

CREATE POLICY "Allow public access to rate_limits" ON rate_limits
    FOR ALL USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_ad_verifications_updated_at 
    BEFORE UPDATE ON ad_verifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rate_limits_updated_at 
    BEFORE UPDATE ON rate_limits 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
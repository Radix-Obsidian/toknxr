-- Migration: Add CodeHalu Hallucination Analysis Tables
-- Created: 2025-01-27
-- Purpose: Support systematic code hallucination detection and analysis

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main hallucination analysis table
-- Stores the overall analysis result for each code interaction
CREATE TABLE hallucination_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interaction_id UUID REFERENCES interactions(id) ON DELETE CASCADE,
    overall_hallucination_rate DECIMAL(5,4) NOT NULL CHECK (overall_hallucination_rate >= 0 AND overall_hallucination_rate <= 1),
    analysis_version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    detection_time_ms INTEGER NOT NULL CHECK (detection_time_ms >= 0),
    code_length INTEGER NOT NULL CHECK (code_length >= 0),
    language VARCHAR(20) NOT NULL DEFAULT 'python',
    execution_verified BOOLEAN NOT NULL DEFAULT false,
    has_critical_issues BOOLEAN NOT NULL DEFAULT false,
    code_quality_impact DECIMAL(8,2) NOT NULL DEFAULT 0,
    
    -- Summary statistics
    total_hallucinations INTEGER NOT NULL DEFAULT 0 CHECK (total_hallucinations >= 0),
    critical_count INTEGER NOT NULL DEFAULT 0 CHECK (critical_count >= 0),
    high_severity_count INTEGER NOT NULL DEFAULT 0 CHECK (high_severity_count >= 0),
    medium_severity_count INTEGER NOT NULL DEFAULT 0 CHECK (medium_severity_count >= 0),
    low_severity_count INTEGER NOT NULL DEFAULT 0 CHECK (low_severity_count >= 0),
    most_common_category VARCHAR(20),
    overall_risk VARCHAR(10) NOT NULL DEFAULT 'low' CHECK (overall_risk IN ('low', 'medium', 'high', 'critical')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual hallucination categories table
-- Stores detailed information about each detected hallucination
CREATE TABLE hallucination_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID REFERENCES hallucination_analysis(id) ON DELETE CASCADE,
    
    -- Category classification
    category_type VARCHAR(20) NOT NULL CHECK (category_type IN ('mapping', 'naming', 'resource', 'logic')),
    category_subtype VARCHAR(30) NOT NULL CHECK (category_subtype IN (
        'data_compliance', 'structure_access',
        'identity', 'external_source', 
        'physical_constraint', 'computational_boundary',
        'logic_deviation', 'logic_breakdown'
    )),
    
    -- Severity and confidence
    severity VARCHAR(10) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    
    -- Detection details
    detection_method VARCHAR(20) NOT NULL CHECK (detection_method IN ('static', 'execution', 'pattern', 'statistical')),
    evidence JSONB NOT NULL DEFAULT '[]',
    line_numbers INTEGER[],
    error_message TEXT,
    suggested_fix TEXT,
    
    -- Business impact
    estimated_dev_time_wasted DECIMAL(6,2) NOT NULL DEFAULT 0,
    cost_multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.0,
    quality_impact INTEGER NOT NULL DEFAULT 0 CHECK (quality_impact >= 0 AND quality_impact <= 100),
    estimated_cost_usd DECIMAL(8,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Execution results table
-- Stores results from code execution verification
CREATE TABLE execution_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID REFERENCES hallucination_analysis(id) ON DELETE CASCADE,
    
    -- Execution status
    success BOOLEAN NOT NULL,
    exit_code INTEGER,
    timed_out BOOLEAN NOT NULL DEFAULT false,
    
    -- Output and errors
    output TEXT,
    stderr TEXT,
    errors JSONB DEFAULT '[]',
    
    -- Resource usage
    memory_mb DECIMAL(8,2) NOT NULL DEFAULT 0,
    execution_time_ms INTEGER NOT NULL DEFAULT 0,
    cpu_usage DECIMAL(5,2) NOT NULL DEFAULT 0,
    peak_memory_mb DECIMAL(8,2),
    system_calls INTEGER,
    
    -- Security
    security_flags JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Execution errors table
-- Detailed breakdown of individual execution errors
CREATE TABLE execution_errors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    execution_result_id UUID REFERENCES execution_results(id) ON DELETE CASCADE,
    
    error_type VARCHAR(50) NOT NULL,
    error_message TEXT NOT NULL,
    line_number INTEGER,
    column_number INTEGER,
    stack_trace TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hallucination recommendations table
-- Stores actionable recommendations for users
CREATE TABLE hallucination_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID REFERENCES hallucination_analysis(id) ON DELETE CASCADE,
    
    category_type VARCHAR(20) NOT NULL CHECK (category_type IN ('mapping', 'naming', 'resource', 'logic')),
    priority VARCHAR(10) NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    action_items JSONB NOT NULL DEFAULT '[]',
    expected_impact TEXT NOT NULL,
    estimated_time_to_fix VARCHAR(50),
    resources JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Historical patterns table
-- Stores statistical patterns for cross-analysis
CREATE TABLE historical_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    pattern_id VARCHAR(100) NOT NULL UNIQUE,
    frequency INTEGER NOT NULL DEFAULT 1,
    categories VARCHAR(20)[] NOT NULL,
    success_rate DECIMAL(5,4) NOT NULL DEFAULT 0,
    reliability DECIMAL(3,2) NOT NULL DEFAULT 0,
    
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying

-- Primary lookup indexes
CREATE INDEX idx_hallucination_analysis_interaction_id ON hallucination_analysis(interaction_id);
CREATE INDEX idx_hallucination_analysis_created_at ON hallucination_analysis(created_at DESC);
CREATE INDEX idx_hallucination_analysis_risk ON hallucination_analysis(overall_risk);

-- Category analysis indexes
CREATE INDEX idx_hallucination_categories_analysis_id ON hallucination_categories(analysis_id);
CREATE INDEX idx_hallucination_categories_type ON hallucination_categories(category_type);
CREATE INDEX idx_hallucination_categories_severity ON hallucination_categories(severity);
CREATE INDEX idx_hallucination_categories_confidence ON hallucination_categories(confidence DESC);

-- Execution results indexes
CREATE INDEX idx_execution_results_analysis_id ON execution_results(analysis_id);
CREATE INDEX idx_execution_results_success ON execution_results(success);
CREATE INDEX idx_execution_errors_execution_result_id ON execution_errors(execution_result_id);

-- Recommendations indexes
CREATE INDEX idx_hallucination_recommendations_analysis_id ON hallucination_recommendations(analysis_id);
CREATE INDEX idx_hallucination_recommendations_priority ON hallucination_recommendations(priority);

-- Historical patterns indexes
CREATE INDEX idx_historical_patterns_pattern_id ON historical_patterns(pattern_id);
CREATE INDEX idx_historical_patterns_frequency ON historical_patterns(frequency DESC);
CREATE INDEX idx_historical_patterns_last_seen ON historical_patterns(last_seen DESC);

-- Composite indexes for common queries
CREATE INDEX idx_categories_type_severity ON hallucination_categories(category_type, severity);
CREATE INDEX idx_analysis_risk_created ON hallucination_analysis(overall_risk, created_at DESC);
CREATE INDEX idx_categories_analysis_type ON hallucination_categories(analysis_id, category_type);

-- Add triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_hallucination_analysis_updated_at 
    BEFORE UPDATE ON hallucination_analysis 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_historical_patterns_updated_at 
    BEFORE UPDATE ON historical_patterns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies if needed
-- Note: These would be customized based on your authentication setup

-- Enable RLS on tables
ALTER TABLE hallucination_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE hallucination_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE hallucination_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE historical_patterns ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (customize based on your auth setup)
-- Allow users to see their own data
CREATE POLICY "Users can view their own hallucination analysis" ON hallucination_analysis
    FOR SELECT USING (
        interaction_id IN (
            SELECT id FROM interactions WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own hallucination analysis" ON hallucination_analysis
    FOR INSERT WITH CHECK (
        interaction_id IN (
            SELECT id FROM interactions WHERE user_id = auth.uid()
        )
    );

-- Similar policies for other tables
CREATE POLICY "Users can view their own categories" ON hallucination_categories
    FOR SELECT USING (
        analysis_id IN (
            SELECT id FROM hallucination_analysis 
            WHERE interaction_id IN (
                SELECT id FROM interactions WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert their own categories" ON hallucination_categories
    FOR INSERT WITH CHECK (
        analysis_id IN (
            SELECT id FROM hallucination_analysis 
            WHERE interaction_id IN (
                SELECT id FROM interactions WHERE user_id = auth.uid()
            )
        )
    );

-- Add helpful views for common queries

-- View for hallucination summary by provider
CREATE VIEW hallucination_summary_by_provider AS
SELECT 
    i.provider,
    COUNT(ha.id) as total_analyses,
    AVG(ha.overall_hallucination_rate) as avg_hallucination_rate,
    SUM(ha.critical_count) as total_critical,
    SUM(ha.high_severity_count) as total_high,
    SUM(ha.medium_severity_count) as total_medium,
    SUM(ha.low_severity_count) as total_low,
    AVG(ha.code_quality_impact) as avg_quality_impact
FROM hallucination_analysis ha
JOIN interactions i ON ha.interaction_id = i.id
GROUP BY i.provider;

-- View for category breakdown
CREATE VIEW hallucination_category_breakdown AS
SELECT 
    hc.category_type,
    hc.category_subtype,
    COUNT(*) as occurrence_count,
    AVG(hc.confidence) as avg_confidence,
    AVG(hc.estimated_dev_time_wasted) as avg_dev_time_wasted,
    AVG(hc.quality_impact) as avg_quality_impact
FROM hallucination_categories hc
GROUP BY hc.category_type, hc.category_subtype
ORDER BY occurrence_count DESC;

-- View for recent hallucination trends
CREATE VIEW recent_hallucination_trends AS
SELECT 
    DATE(ha.created_at) as analysis_date,
    COUNT(ha.id) as total_analyses,
    AVG(ha.overall_hallucination_rate) as avg_rate,
    SUM(ha.critical_count) as critical_issues,
    COUNT(CASE WHEN ha.overall_risk = 'critical' THEN 1 END) as critical_analyses
FROM hallucination_analysis ha
WHERE ha.created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(ha.created_at)
ORDER BY analysis_date DESC;

-- Add comments for documentation
COMMENT ON TABLE hallucination_analysis IS 'Main table storing CodeHalu hallucination analysis results';
COMMENT ON TABLE hallucination_categories IS 'Detailed breakdown of individual hallucination categories detected';
COMMENT ON TABLE execution_results IS 'Results from code execution verification in sandbox environment';
COMMENT ON TABLE execution_errors IS 'Individual errors encountered during code execution';
COMMENT ON TABLE hallucination_recommendations IS 'Actionable recommendations generated based on hallucination analysis';
COMMENT ON TABLE historical_patterns IS 'Statistical patterns for cross-analysis and trend detection';

COMMENT ON COLUMN hallucination_analysis.overall_hallucination_rate IS 'Overall hallucination rate (0.0-1.0) calculated from detected categories';
COMMENT ON COLUMN hallucination_categories.confidence IS 'Confidence score (0.0-1.0) in the hallucination detection';
COMMENT ON COLUMN execution_results.memory_mb IS 'Memory usage in megabytes during code execution';
COMMENT ON COLUMN historical_patterns.reliability IS 'Reliability score (0.0-1.0) for this pattern based on historical data';
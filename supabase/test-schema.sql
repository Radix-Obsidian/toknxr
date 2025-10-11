-- Test script to validate hallucination analysis schema
-- This script tests the database schema without requiring a full Supabase setup

-- Test 1: Create a mock interactions table for testing
CREATE TEMPORARY TABLE IF NOT EXISTS interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    provider VARCHAR(50),
    model VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert test interaction
INSERT INTO interactions (provider, model) VALUES ('Gemini-Pro', 'gemini-2.5-flash');

-- Test 2: Insert test hallucination analysis
INSERT INTO hallucination_analysis (
    interaction_id,
    overall_hallucination_rate,
    analysis_version,
    detection_time_ms,
    code_length,
    language,
    execution_verified,
    has_critical_issues,
    code_quality_impact,
    total_hallucinations,
    critical_count,
    high_severity_count,
    medium_severity_count,
    low_severity_count,
    most_common_category,
    overall_risk
) VALUES (
    (SELECT id FROM interactions LIMIT 1),
    0.75,
    '1.0.0',
    150,
    250,
    'python',
    true,
    true,
    25.5,
    3,
    1,
    1,
    1,
    0,
    'mapping',
    'high'
);

-- Test 3: Insert test hallucination categories
INSERT INTO hallucination_categories (
    analysis_id,
    category_type,
    category_subtype,
    severity,
    confidence,
    detection_method,
    evidence,
    line_numbers,
    error_message,
    suggested_fix,
    estimated_dev_time_wasted,
    cost_multiplier,
    quality_impact,
    estimated_cost_usd
) VALUES 
(
    (SELECT id FROM hallucination_analysis LIMIT 1),
    'mapping',
    'data_compliance',
    'high',
    0.85,
    'static',
    '["Type mismatch detected at: x + \"hello\""]',
    ARRAY[3],
    'TypeError: unsupported operand type(s)',
    'Add type checking before operations',
    2.5,
    1.3,
    25,
    12.50
),
(
    (SELECT id FROM hallucination_analysis LIMIT 1),
    'naming',
    'identity',
    'medium',
    0.90,
    'pattern',
    '["Variable ''undefined_var'' used before definition"]',
    ARRAY[5],
    'NameError: name ''undefined_var'' is not defined',
    'Define variable before use',
    1.8,
    1.2,
    20,
    9.00
);

-- Test 4: Insert test execution result
INSERT INTO execution_results (
    analysis_id,
    success,
    exit_code,
    timed_out,
    output,
    stderr,
    errors,
    memory_mb,
    execution_time_ms,
    cpu_usage,
    peak_memory_mb,
    system_calls,
    security_flags
) VALUES (
    (SELECT id FROM hallucination_analysis LIMIT 1),
    false,
    1,
    false,
    '',
    'TypeError: unsupported operand type(s)',
    '[{"type": "TypeError", "message": "unsupported operand type(s)", "line_number": 3}]',
    45.2,
    1250,
    15.5,
    48.1,
    125,
    '[]'
);

-- Test 5: Insert test execution errors
INSERT INTO execution_errors (
    execution_result_id,
    error_type,
    error_message,
    line_number,
    column_number,
    stack_trace
) VALUES (
    (SELECT id FROM execution_results LIMIT 1),
    'TypeError',
    'unsupported operand type(s) for +: ''int'' and ''str''',
    3,
    12,
    'Traceback (most recent call last):\n  File "<string>", line 3, in <module>\nTypeError: unsupported operand type(s) for +: ''int'' and ''str'''
);

-- Test 6: Insert test recommendations
INSERT INTO hallucination_recommendations (
    analysis_id,
    category_type,
    priority,
    title,
    description,
    action_items,
    expected_impact,
    estimated_time_to_fix,
    resources
) VALUES (
    (SELECT id FROM hallucination_analysis LIMIT 1),
    'mapping',
    'high',
    'Fix Data Type and Structure Issues',
    'Address type mismatches and structure access problems',
    '["Add type checking before operations", "Validate array indices and dictionary keys", "Use proper type conversion methods"]',
    'Reduce runtime errors by 60-80%',
    '30 minutes',
    '["https://docs.python.org/3/library/functions.html#type", "https://realpython.com/python-type-checking/"]'
);

-- Test 7: Insert test historical pattern
INSERT INTO historical_patterns (
    pattern_id,
    frequency,
    categories,
    success_rate,
    reliability,
    first_seen,
    last_seen
) VALUES (
    'type_mismatch_string_int',
    15,
    ARRAY['mapping'],
    0.25,
    0.85,
    NOW() - INTERVAL '30 days',
    NOW()
);

-- Test Queries: Validate the schema works correctly

-- Query 1: Test hallucination summary by provider view
SELECT * FROM hallucination_summary_by_provider;

-- Query 2: Test category breakdown view
SELECT * FROM hallucination_category_breakdown;

-- Query 3: Test recent trends view
SELECT * FROM recent_hallucination_trends;

-- Query 4: Test complex join query
SELECT 
    ha.overall_hallucination_rate,
    ha.overall_risk,
    hc.category_type,
    hc.severity,
    hc.confidence,
    er.success as execution_success,
    hr.title as recommendation_title
FROM hallucination_analysis ha
LEFT JOIN hallucination_categories hc ON ha.id = hc.analysis_id
LEFT JOIN execution_results er ON ha.id = er.analysis_id
LEFT JOIN hallucination_recommendations hr ON ha.id = hr.analysis_id
WHERE ha.overall_risk IN ('high', 'critical')
ORDER BY ha.overall_hallucination_rate DESC;

-- Query 5: Test aggregation query
SELECT 
    hc.category_type,
    COUNT(*) as total_occurrences,
    AVG(hc.confidence) as avg_confidence,
    AVG(hc.estimated_dev_time_wasted) as avg_time_wasted,
    SUM(hc.quality_impact) as total_quality_impact
FROM hallucination_categories hc
GROUP BY hc.category_type
ORDER BY total_occurrences DESC;

-- Query 6: Test historical patterns query
SELECT 
    hp.pattern_id,
    hp.frequency,
    hp.success_rate,
    hp.reliability,
    EXTRACT(DAYS FROM (hp.last_seen - hp.first_seen)) as pattern_age_days
FROM historical_patterns hp
WHERE hp.reliability > 0.8
ORDER BY hp.frequency DESC;

-- Validation: Check constraints and data integrity
SELECT 
    'hallucination_analysis' as table_name,
    COUNT(*) as record_count,
    MIN(overall_hallucination_rate) as min_rate,
    MAX(overall_hallucination_rate) as max_rate,
    AVG(overall_hallucination_rate) as avg_rate
FROM hallucination_analysis

UNION ALL

SELECT 
    'hallucination_categories' as table_name,
    COUNT(*) as record_count,
    MIN(confidence) as min_confidence,
    MAX(confidence) as max_confidence,
    AVG(confidence) as avg_confidence
FROM hallucination_categories

UNION ALL

SELECT 
    'execution_results' as table_name,
    COUNT(*) as record_count,
    MIN(memory_mb) as min_memory,
    MAX(memory_mb) as max_memory,
    AVG(memory_mb) as avg_memory
FROM execution_results;

-- Test: Verify foreign key relationships
SELECT 
    'Analysis -> Categories' as relationship,
    COUNT(hc.id) as category_count,
    COUNT(DISTINCT hc.analysis_id) as unique_analyses
FROM hallucination_analysis ha
LEFT JOIN hallucination_categories hc ON ha.id = hc.analysis_id

UNION ALL

SELECT 
    'Analysis -> Execution' as relationship,
    COUNT(er.id) as execution_count,
    COUNT(DISTINCT er.analysis_id) as unique_analyses
FROM hallucination_analysis ha
LEFT JOIN execution_results er ON ha.id = er.analysis_id

UNION ALL

SELECT 
    'Analysis -> Recommendations' as relationship,
    COUNT(hr.id) as recommendation_count,
    COUNT(DISTINCT hr.analysis_id) as unique_analyses
FROM hallucination_analysis ha
LEFT JOIN hallucination_recommendations hr ON ha.id = hr.analysis_id;

-- Cleanup: Drop temporary table
DROP TABLE IF EXISTS interactions;
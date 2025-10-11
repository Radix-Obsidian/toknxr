#!/usr/bin/env node

/**
 * Test script for Hallucination Database Service
 */

import { 
  MockHallucinationDatabaseService,
  convertCodeHaluResultToDbRecords 
} from './lib/hallucination-database-service.js';

async function testDatabaseService() {
  console.log('🗄️  Testing Hallucination Database Service\n');
  
  const service = new MockHallucinationDatabaseService();
  
  try {
    // Test 1: Create Analysis
    console.log('📊 Test 1: Creating Hallucination Analysis');
    const analysisInput = {
      interaction_id: 'test-interaction-123',
      overall_hallucination_rate: 0.75,
      analysis_version: '1.0.0',
      detection_time_ms: 150,
      code_length: 250,
      language: 'python',
      execution_verified: true,
      has_critical_issues: true,
      code_quality_impact: 25.5,
      total_hallucinations: 3,
      critical_count: 1,
      high_severity_count: 1,
      medium_severity_count: 1,
      low_severity_count: 0,
      most_common_category: 'mapping',
      overall_risk: 'high',
    };
    
    const analysis = await service.createAnalysis(analysisInput);
    console.log(`✅ Created analysis: ${analysis.id}`);
    console.log(`   Risk Level: ${analysis.overall_risk}`);
    console.log(`   Hallucination Rate: ${(analysis.overall_hallucination_rate * 100).toFixed(1)}%`);
    
    // Test 2: Create Categories
    console.log('\n🏷️  Test 2: Creating Hallucination Categories');
    const categories = [
      {
        analysis_id: analysis.id,
        category_type: 'mapping',
        category_subtype: 'data_compliance',
        severity: 'high',
        confidence: 0.85,
        detection_method: 'static',
        evidence: ['Type mismatch detected at: x + "hello"'],
        line_numbers: [3],
        error_message: 'TypeError: unsupported operand type(s)',
        suggested_fix: 'Add type checking before operations',
        estimated_dev_time_wasted: 2.5,
        cost_multiplier: 1.3,
        quality_impact: 25,
        estimated_cost_usd: 12.50,
      },
      {
        analysis_id: analysis.id,
        category_type: 'naming',
        category_subtype: 'identity',
        severity: 'medium',
        confidence: 0.90,
        detection_method: 'pattern',
        evidence: ['Variable "undefined_var" used before definition'],
        line_numbers: [5],
        error_message: 'NameError: name "undefined_var" is not defined',
        suggested_fix: 'Define variable before use',
        estimated_dev_time_wasted: 1.8,
        cost_multiplier: 1.2,
        quality_impact: 20,
        estimated_cost_usd: 9.00,
      },
      {
        analysis_id: analysis.id,
        category_type: 'resource',
        category_subtype: 'computational_boundary',
        severity: 'critical',
        confidence: 0.95,
        detection_method: 'static',
        evidence: ['Potential infinite loop: while True without break'],
        line_numbers: [8],
        suggested_fix: 'Add break condition or timeout',
        estimated_dev_time_wasted: 4.0,
        cost_multiplier: 1.8,
        quality_impact: 40,
        estimated_cost_usd: 20.00,
      },
    ];
    
    for (const categoryInput of categories) {
      const category = await service.createCategory(categoryInput);
      console.log(`✅ Created ${category.category_type} category (${category.severity})`);
      console.log(`   Confidence: ${(category.confidence * 100).toFixed(0)}%`);
      console.log(`   Evidence: ${category.evidence[0]}`);
    }
    
    // Test 3: Create Execution Result
    console.log('\n⚡ Test 3: Creating Execution Result');
    const executionInput = {
      analysis_id: analysis.id,
      success: false,
      exit_code: 1,
      timed_out: false,
      output: '',
      stderr: 'TypeError: unsupported operand type(s)',
      errors: [
        {
          type: 'TypeError',
          message: 'unsupported operand type(s) for +: "int" and "str"',
          line_number: 3,
        }
      ],
      memory_mb: 45.2,
      execution_time_ms: 1250,
      cpu_usage: 15.5,
      peak_memory_mb: 48.1,
      system_calls: 125,
      security_flags: [],
    };
    
    const executionResult = await service.createExecutionResult(executionInput);
    console.log(`✅ Created execution result: ${executionResult.id}`);
    console.log(`   Success: ${executionResult.success}`);
    console.log(`   Memory Usage: ${executionResult.memory_mb}MB`);
    console.log(`   Execution Time: ${executionResult.execution_time_ms}ms`);
    
    // Test 4: Create Recommendations
    console.log('\n💡 Test 4: Creating Recommendations');
    const recommendations = [
      {
        analysis_id: analysis.id,
        category_type: 'mapping',
        priority: 'high',
        title: 'Fix Data Type and Structure Issues',
        description: 'Address type mismatches and structure access problems',
        action_items: [
          'Add type checking before operations',
          'Validate array indices and dictionary keys',
          'Use proper type conversion methods',
        ],
        expected_impact: 'Reduce runtime errors by 60-80%',
        estimated_time_to_fix: '30 minutes',
        resources: ['https://docs.python.org/3/library/functions.html#type'],
      },
      {
        analysis_id: analysis.id,
        category_type: 'naming',
        priority: 'medium',
        title: 'Resolve Variable and Import Issues',
        description: 'Fix undefined variables and missing imports',
        action_items: [
          'Define all variables before use',
          'Check import statements for typos',
          'Verify module availability',
        ],
        expected_impact: 'Eliminate name-related errors',
        estimated_time_to_fix: '15 minutes',
      },
    ];
    
    for (const recInput of recommendations) {
      const recommendation = await service.createRecommendation(recInput);
      console.log(`✅ Created ${recommendation.category_type} recommendation (${recommendation.priority})`);
      console.log(`   Title: ${recommendation.title}`);
      console.log(`   Action Items: ${recommendation.action_items.length}`);
    }
    
    // Test 5: Retrieve Complete Analysis
    console.log('\n📋 Test 5: Retrieving Complete Analysis');
    const completeAnalysis = await service.getAnalysis(analysis.id);
    if (completeAnalysis) {
      console.log(`✅ Retrieved complete analysis: ${completeAnalysis.analysis.id}`);
      console.log(`   Categories: ${completeAnalysis.categories.length}`);
      console.log(`   Execution Result: ${completeAnalysis.execution_result ? 'Yes' : 'No'}`);
      console.log(`   Recommendations: ${completeAnalysis.recommendations.length}`);
      
      // Show category breakdown
      const categoryBreakdown = completeAnalysis.categories.reduce((acc, cat) => {
        acc[cat.category_type] = (acc[cat.category_type] || 0) + 1;
        return acc;
      }, {});
      console.log(`   Category Breakdown:`, categoryBreakdown);
    }
    
    // Test 6: Analytics Operations
    console.log('\n📈 Test 6: Testing Analytics Operations');
    
    const providerSummary = await service.getProviderSummary();
    console.log(`✅ Provider Summary: ${providerSummary.length} providers`);
    providerSummary.forEach(provider => {
      console.log(`   ${provider.provider}: ${provider.total_analyses} analyses, ${(provider.avg_hallucination_rate * 100).toFixed(1)}% avg rate`);
    });
    
    const categoryBreakdown = await service.getCategoryBreakdown();
    console.log(`✅ Category Breakdown: ${categoryBreakdown.length} categories`);
    categoryBreakdown.forEach(cat => {
      console.log(`   ${cat.category_type}/${cat.category_subtype}: ${cat.occurrence_count} occurrences`);
    });
    
    const recentTrends = await service.getRecentTrends(7);
    console.log(`✅ Recent Trends: ${recentTrends.length} days`);
    recentTrends.forEach(trend => {
      console.log(`   ${trend.analysis_date}: ${trend.total_analyses} analyses, ${(trend.avg_rate * 100).toFixed(1)}% avg rate`);
    });
    
    // Test 7: Historical Patterns
    console.log('\n📊 Test 7: Testing Historical Patterns');
    await service.updateHistoricalPattern('type_mismatch_string_int', ['mapping']);
    await service.updateHistoricalPattern('undefined_variable_usage', ['naming']);
    await service.updateHistoricalPattern('type_mismatch_string_int', ['mapping']); // Update again
    
    const patterns = await service.getHistoricalPatterns(0.0);
    console.log(`✅ Historical Patterns: ${patterns.length} patterns`);
    patterns.forEach(pattern => {
      console.log(`   ${pattern.pattern_id}: frequency ${pattern.frequency}, reliability ${(pattern.reliability * 100).toFixed(1)}%`);
    });
    
    // Test 8: Filtering and Pagination
    console.log('\n🔍 Test 8: Testing Filtering and Pagination');
    
    // Create additional analyses for filtering
    await service.createAnalysis({
      ...analysisInput,
      interaction_id: 'test-interaction-456',
      overall_risk: 'low',
      overall_hallucination_rate: 0.3,
    });
    
    await service.createAnalysis({
      ...analysisInput,
      interaction_id: 'test-interaction-789',
      overall_risk: 'critical',
      overall_hallucination_rate: 0.95,
    });
    
    const highRiskAnalyses = await service.listAnalyses({ overall_risk: 'high' });
    console.log(`✅ High Risk Analyses: ${highRiskAnalyses.length}`);
    
    const criticalAnalyses = await service.listAnalyses({ overall_risk: 'critical' });
    console.log(`✅ Critical Analyses: ${criticalAnalyses.length}`);
    
    const paginatedAnalyses = await service.listAnalyses({}, { page: 1, limit: 2 });
    console.log(`✅ Paginated Analyses (page 1, limit 2): ${paginatedAnalyses.length}`);
    
    // Test 9: CodeHaluResult Conversion
    console.log('\n🔄 Test 9: Testing CodeHaluResult Conversion');
    const mockCodeHaluResult = {
      overallHallucinationRate: 0.65,
      categories: [
        {
          type: 'mapping',
          subtype: 'data_compliance',
          severity: 'high',
          confidence: 0.85,
          evidence: ['Type mismatch detected'],
          detectionMethod: 'static',
          businessImpact: {
            estimatedDevTimeWasted: 2.5,
            costMultiplier: 1.3,
            qualityImpact: 25,
            estimatedCostUSD: 12.50,
          },
          lineNumbers: [3],
          errorMessage: 'TypeError',
          suggestedFix: 'Add type checking',
        }
      ],
      executionResult: {
        success: false,
        output: '',
        stderr: 'Error output',
        errors: [{ type: 'TypeError', message: 'Type error', lineNumber: 3 }],
        resourceUsage: { memoryMB: 45.2, executionTimeMs: 1250, cpuUsage: 15.5 },
        securityFlags: [],
        timedOut: false,
        exitCode: 1,
      },
      codeQualityImpact: 25.5,
      recommendations: [
        {
          category: 'mapping',
          priority: 'high',
          title: 'Fix Type Issues',
          description: 'Address type mismatches',
          actionItems: ['Add type checking'],
          expectedImpact: 'Reduce errors',
        }
      ],
      detectionMetadata: {
        analysisTimeMs: 150,
        detectionVersion: '1.0.0',
        language: 'python',
        codeLength: 250,
        timestamp: '2025-01-27T00:00:00Z',
        executionVerified: true,
      },
      hasCriticalIssues: true,
      summary: {
        totalHallucinations: 1,
        criticalCount: 0,
        highSeverityCount: 1,
        mediumSeverityCount: 0,
        lowSeverityCount: 0,
        mostCommonCategory: 'mapping',
        overallRisk: 'high',
      },
    };
    
    const dbRecords = convertCodeHaluResultToDbRecords(mockCodeHaluResult, 'test-interaction-conversion');
    console.log(`✅ Converted CodeHaluResult to DB records:`);
    console.log(`   Analysis: ${dbRecords.analysis.overall_hallucination_rate * 100}% rate, ${dbRecords.analysis.overall_risk} risk`);
    console.log(`   Categories: ${dbRecords.categories.length}`);
    console.log(`   Execution Result: ${dbRecords.executionResult ? 'Yes' : 'No'}`);
    console.log(`   Recommendations: ${dbRecords.recommendations.length}`);
    
    console.log('\n✅ All database service tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Database service test failed:', error);
    process.exit(1);
  }
}

// Run the test
testDatabaseService().catch(console.error);
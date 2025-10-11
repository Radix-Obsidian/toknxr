#!/usr/bin/env node

/**
 * Quick test script for the Enhanced Hallucination Detector
 */

import { CodeHaluDetector } from './lib/enhanced-hallucination-detector.js';

async function testDetector() {
  console.log('🧪 Testing Enhanced Hallucination Detector\n');
  
  const detector = new CodeHaluDetector();
  
  // Test cases with different types of hallucinations
  const testCases = [
    {
      name: 'Clean Code (No Hallucinations)',
      code: `
def greet(name):
    return f"Hello, {name}!"

result = greet("World")
print(result)
`,
    },
    {
      name: 'Mapping Hallucination - Type Mismatch',
      code: `
x = 5
result = x + "hello"
print(result)
`,
    },
    {
      name: 'Naming Hallucination - Undefined Variable',
      code: `
print(undefined_variable)
result = another_undefined + 10
`,
    },
    {
      name: 'Resource Hallucination - Infinite Loop',
      code: `
while True:
    print("This will run forever")
    x = x + 1
`,
    },
    {
      name: 'Logic Hallucination - Repeated Lines',
      code: `
print("Hello World")
print("Hello World")
x = 5
x = 5
`,
    },
    {
      name: 'Multiple Issues',
      code: `
import nonexistentmodule
def bad_function():
    while True:
        undefined_var = 5 + "string"
        arr = [1, 2, 3]
        value = arr[100]
`,
    },
  ];
  
  for (const testCase of testCases) {
    console.log(`\n📋 Testing: ${testCase.name}`);
    console.log('─'.repeat(50));
    
    try {
      const result = await detector.detectHallucinations(testCase.code, 'python');
      
      console.log(`📊 Overall Hallucination Rate: ${(result.overallHallucinationRate * 100).toFixed(1)}%`);
      console.log(`🎯 Total Issues Found: ${result.categories.length}`);
      console.log(`⚠️  Critical Issues: ${result.summary.criticalCount}`);
      console.log(`🔴 High Severity: ${result.summary.highSeverityCount}`);
      console.log(`🟡 Medium Severity: ${result.summary.mediumSeverityCount}`);
      console.log(`🟢 Low Severity: ${result.summary.lowSeverityCount}`);
      console.log(`⏱️  Analysis Time: ${result.detectionMetadata.analysisTimeMs}ms`);
      
      if (result.categories.length > 0) {
        console.log('\n🔍 Detected Issues:');
        result.categories.forEach((category, index) => {
          console.log(`  ${index + 1}. ${category.type.toUpperCase()} - ${category.subtype}`);
          console.log(`     Severity: ${category.severity} | Confidence: ${(category.confidence * 100).toFixed(0)}%`);
          console.log(`     Evidence: ${category.evidence[0]}`);
          if (category.lineNumbers && category.lineNumbers.length > 0) {
            console.log(`     Line: ${category.lineNumbers[0]}`);
          }
        });
      }
      
      if (result.recommendations.length > 0) {
        console.log('\n💡 Recommendations:');
        result.recommendations.forEach((rec, index) => {
          console.log(`  ${index + 1}. ${rec.title} (${rec.priority} priority)`);
          console.log(`     ${rec.description}`);
        });
      }
      
    } catch (error) {
      console.error(`❌ Error testing ${testCase.name}:`, error.message);
    }
  }
  
  console.log('\n✅ Testing completed!');
}

// Run the test
testDetector().catch(console.error);
#!/usr/bin/env node

/**
 * Test script for Enhanced Hallucination Pattern Detection
 */

import { HallucinationPatterns } from './lib/hallucination-patterns.js';
import { CodeHaluDetector } from './lib/enhanced-hallucination-detector.js';

async function testEnhancedPatterns() {
  console.log('🔍 Testing Enhanced Hallucination Pattern Detection\n');
  
  const patterns = new HallucinationPatterns();
  const detector = new CodeHaluDetector();
  
  // Test cases with different types of hallucinations
  const testCases = [
    {
      name: 'Mapping Hallucinations - Type Mismatches',
      code: `
x = 5
result = x + "hello"
number = 42
number.append(item)
arr = [1, 2, 3]
value = arr[100]
data = {"name": "John"}
age = data["age"]  # No existence check
`,
      expectedCategories: ['mapping'],
      expectedSubtypes: ['data_compliance', 'structure_access'],
    },
    {
      name: 'Naming Hallucinations - Undefined Variables',
      code: `
print(undefined_variable)
result = another_undefined + 10
import nonexistentmoduleverylongname
from INVALIDMODULE import something
none_var = None
value = none_var.attribute
`,
      expectedCategories: ['naming'],
      expectedSubtypes: ['identity', 'external_source'],
    },
    {
      name: 'Resource Hallucinations - Infinite Loops & Recursion',
      code: `
while True:
    print("This will run forever")
    x = x + 1

def factorial(n):
    return n * factorial(n - 1)

for i in range(10000000):
    print(i)

large_list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50]
`,
      expectedCategories: ['resource'],
      expectedSubtypes: ['computational_boundary', 'physical_constraint'],
    },
    {
      name: 'Logic Hallucinations - Contradictions & Incomplete Code',
      code: `
if False:
    print("This will never execute")

if x == y and x != y:
    print("Contradictory")

print("Hello World")
print("Hello World")

def incomplete_function():

def test_function():
    return True
    print("This will never execute")
    x = 5
`,
      expectedCategories: ['logic'],
      expectedSubtypes: ['logic_deviation', 'logic_breakdown'],
    },
    {
      name: 'Clean Code - Minimal Issues',
      code: `
import os
import json

def greet(name):
    if name:
        return f"Hello, {name}!"
    return "Hello, World!"

def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

data = {"name": "John", "age": 30}
if "email" in data:
    email = data["email"]
else:
    email = "unknown"

result = greet(data.get("name", "Anonymous"))
print(result)
`,
      expectedCategories: [],
      expectedSubtypes: [],
    },
    {
      name: 'Complex Real-World Example',
      code: `
import nonexistentlibrary
from BADMODULE import something

def process_data(data):
    # Type mismatch
    result = 5 + "hello"
    
    # Undefined variable
    total = undefined_var + 10
    
    # Unchecked dictionary access
    name = data["name"]
    email = data["email"]
    
    # Potential index out of bounds
    items = [1, 2, 3]
    value = items[100]
    
    # Invalid method on primitive
    number = 42
    number.append(5)
    
    # Infinite loop
    while True:
        print("Processing...")
        count = count + 1
    
    return result

def recursive_function(n):
    # No base case
    return recursive_function(n - 1)

# Repeated lines
print("Starting process")
print("Starting process")

# Incomplete function
def unfinished():

# Contradictory condition
if False:
    print("Never reached")
`,
      expectedCategories: ['mapping', 'naming', 'resource', 'logic'],
      expectedSubtypes: ['data_compliance', 'structure_access', 'identity', 'external_source', 'computational_boundary', 'physical_constraint', 'logic_deviation', 'logic_breakdown'],
    },
  ];
  
  for (const testCase of testCases) {
    console.log(`\n📋 Testing: ${testCase.name}`);
    console.log('─'.repeat(60));
    
    try {
      // Test pattern detection
      const patternResult = patterns.detectPatterns(testCase.code);
      
      console.log(`🔍 Pattern Detection Results:`);
      console.log(`   Total Matches: ${patternResult.matches.length}`);
      console.log(`   Total Categories: ${patternResult.categories.length}`);
      console.log(`   Overall Confidence: ${(patternResult.confidence * 100).toFixed(1)}%`);
      
      // Show code structure analysis
      const structure = patternResult.codeStructure;
      console.log(`\n📊 Code Structure Analysis:`);
      console.log(`   Functions: ${structure.functions.length} (${structure.functions.join(', ') || 'none'})`);
      console.log(`   Classes: ${structure.classes.length} (${structure.classes.join(', ') || 'none'})`);
      console.log(`   Variables: ${structure.variables.length}`);
      console.log(`   Imports: ${structure.imports.length} (${structure.imports.join(', ') || 'none'})`);
      console.log(`   Loops: ${structure.controlFlow.loops}`);
      console.log(`   Conditionals: ${structure.controlFlow.conditionals}`);
      console.log(`   Try Blocks: ${structure.controlFlow.tryBlocks}`);
      console.log(`   Cyclomatic Complexity: ${structure.complexity.cyclomaticComplexity}`);
      console.log(`   Lines of Code: ${structure.complexity.linesOfCode}`);
      console.log(`   Max Nesting Depth: ${structure.complexity.nestingDepth}`);
      
      // Show detected categories
      if (patternResult.categories.length > 0) {
        console.log(`\n🏷️  Detected Hallucination Categories:`);
        
        const categoryGroups = patternResult.categories.reduce((groups, cat) => {
          const key = `${cat.type}/${cat.subtype}`;
          if (!groups[key]) groups[key] = [];
          groups[key].push(cat);
          return groups;
        }, {});
        
        for (const [categoryKey, cats] of Object.entries(categoryGroups)) {
          console.log(`   ${categoryKey}: ${cats.length} occurrences`);
          cats.forEach((cat, index) => {
            console.log(`     ${index + 1}. ${cat.severity} severity (${(cat.confidence * 100).toFixed(0)}% confidence)`);
            console.log(`        Evidence: ${cat.evidence[0]}`);
            if (cat.lineNumbers && cat.lineNumbers.length > 0) {
              console.log(`        Line: ${cat.lineNumbers[0]}`);
            }
            if (cat.suggestedFix) {
              console.log(`        Fix: ${cat.suggestedFix}`);
            }
          });
        }
      }
      
      // Test enhanced detector integration
      console.log(`\n🤖 Enhanced Detector Integration:`);
      const detectorResult = await detector.detectHallucinations(testCase.code, 'python');
      
      console.log(`   Overall Hallucination Rate: ${(detectorResult.overallHallucinationRate * 100).toFixed(1)}%`);
      console.log(`   Total Issues: ${detectorResult.categories.length}`);
      console.log(`   Critical Issues: ${detectorResult.summary.criticalCount}`);
      console.log(`   High Severity: ${detectorResult.summary.highSeverityCount}`);
      console.log(`   Medium Severity: ${detectorResult.summary.mediumSeverityCount}`);
      console.log(`   Low Severity: ${detectorResult.summary.lowSeverityCount}`);
      console.log(`   Overall Risk: ${detectorResult.summary.overallRisk}`);
      console.log(`   Analysis Time: ${detectorResult.detectionMetadata.analysisTimeMs}ms`);
      
      // Show recommendations
      if (detectorResult.recommendations.length > 0) {
        console.log(`\n💡 Generated Recommendations:`);
        detectorResult.recommendations.forEach((rec, index) => {
          console.log(`   ${index + 1}. ${rec.title} (${rec.priority} priority)`);
          console.log(`      ${rec.description}`);
          console.log(`      Expected Impact: ${rec.expectedImpact}`);
        });
      }
      
      // Validate expected categories
      if (testCase.expectedCategories.length > 0) {
        console.log(`\n✅ Validation:`);
        const foundCategories = [...new Set(patternResult.categories.map(c => c.type))];
        const foundSubtypes = [...new Set(patternResult.categories.map(c => c.subtype))];
        
        const missingCategories = testCase.expectedCategories.filter(cat => !foundCategories.includes(cat));
        const missingSubtypes = testCase.expectedSubtypes.filter(sub => !foundSubtypes.includes(sub));
        
        if (missingCategories.length === 0) {
          console.log(`   ✅ All expected categories detected: ${foundCategories.join(', ')}`);
        } else {
          console.log(`   ⚠️  Missing categories: ${missingCategories.join(', ')}`);
        }
        
        if (missingSubtypes.length === 0) {
          console.log(`   ✅ All expected subtypes detected`);
        } else {
          console.log(`   ⚠️  Missing subtypes: ${missingSubtypes.join(', ')}`);
        }
      } else {
        console.log(`\n✅ Clean code validation: ${patternResult.categories.length} issues found (expected minimal)`);
      }
      
    } catch (error) {
      console.error(`❌ Error testing ${testCase.name}:`, error.message);
    }
  }
  
  // Test pattern management
  console.log(`\n\n🔧 Testing Pattern Management:`);
  console.log('─'.repeat(60));
  
  const allPatterns = patterns.getPatterns();
  console.log(`📋 Total Available Patterns: ${allPatterns.length}`);
  
  const categoryBreakdown = allPatterns.reduce((breakdown, pattern) => {
    breakdown[pattern.category] = (breakdown[pattern.category] || 0) + 1;
    return breakdown;
  }, {});
  
  console.log(`📊 Pattern Distribution:`);
  for (const [category, count] of Object.entries(categoryBreakdown)) {
    console.log(`   ${category}: ${count} patterns`);
    
    const categoryPatterns = patterns.getPatternsByCategory(category);
    categoryPatterns.forEach(pattern => {
      console.log(`     - ${pattern.name} (${pattern.severity})`);
    });
  }
  
  // Test specific pattern lookup
  console.log(`\n🔍 Pattern Lookup Test:`);
  const specificPattern = patterns.getPattern('type_mismatch_string_number');
  if (specificPattern) {
    console.log(`✅ Found pattern: ${specificPattern.name}`);
    console.log(`   Description: ${specificPattern.description}`);
    console.log(`   Category: ${specificPattern.category}/${specificPattern.subtype}`);
    console.log(`   Severity: ${specificPattern.severity}`);
    console.log(`   Confidence: ${(specificPattern.confidence * 100).toFixed(0)}%`);
    console.log(`   Examples: ${specificPattern.examples.length}`);
  } else {
    console.log(`❌ Pattern not found`);
  }
  
  console.log('\n✅ Enhanced pattern detection testing completed!');
}

// Run the test
testEnhancedPatterns().catch(console.error);
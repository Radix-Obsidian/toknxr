/**
 * Unit tests for Hallucination Pattern Detection
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { HallucinationPatterns } from '../../src/hallucination-patterns.js';

describe('HallucinationPatterns', () => {
  let patterns: HallucinationPatterns;

  beforeEach(() => {
    patterns = new HallucinationPatterns();
  });

  describe('Pattern Detection', () => {
    it('should detect type mismatch patterns', () => {
      const code = `
x = 5
result = x + "hello"
value = "10" * number
`;
      
      const result = patterns.detectPatterns(code);
      
      const typeMismatches = result.categories.filter(
        c => c.type === 'mapping' && c.subtype === 'data_compliance'
      );
      
      expect(typeMismatches.length).toBeGreaterThan(0);
      expect(typeMismatches[0].evidence[0]).toContain('Type mismatch detected');
      expect(typeMismatches[0].severity).toBe('high');
    });

    it('should detect invalid method calls on primitives', () => {
      const code = `
number = 5
number.append(item)
text = "hello"
text.keys()
`;
      
      const result = patterns.detectPatterns(code);
      
      const invalidMethods = result.categories.filter(
        c => c.evidence[0].includes('Invalid method call')
      );
      
      expect(invalidMethods.length).toBeGreaterThan(0);
      expect(invalidMethods[0].severity).toBe('high');
    });

    it('should detect potential index out of bounds', () => {
      const code = `
arr = [1, 2, 3]
value = arr[100]
data = getData()
item = data[999]
`;
      
      const result = patterns.detectPatterns(code);
      
      const indexIssues = result.categories.filter(
        c => c.evidence[0].includes('Potential index out of bounds')
      );
      
      expect(indexIssues.length).toBeGreaterThan(0);
      expect(indexIssues[0].type).toBe('mapping');
      expect(indexIssues[0].subtype).toBe('structure_access');
    });

    it('should detect unchecked dictionary access', () => {
      const code = `
data = {"name": "John"}
age = data["age"]  # No existence check
email = data["email"]
`;
      
      const result = patterns.detectPatterns(code);
      
      const dictIssues = result.categories.filter(
        c => c.evidence[0].includes('Unchecked dictionary access')
      );
      
      expect(dictIssues.length).toBeGreaterThan(0);
      expect(dictIssues[0].type).toBe('mapping');
      expect(dictIssues[0].subtype).toBe('structure_access');
    });

    it('should not flag checked dictionary access', () => {
      const code = `
data = {"name": "John"}
if "age" in data:
    age = data["age"]
email = data.get("email", "unknown")
`;
      
      const result = patterns.detectPatterns(code);
      
      const dictIssues = result.categories.filter(
        c => c.evidence[0].includes('Unchecked dictionary access')
      );
      
      expect(dictIssues.length).toBe(0);
    });
  });

  describe('Naming Hallucination Detection', () => {
    it('should detect undefined variable usage', () => {
      const code = `
print(undefined_variable)
result = another_undefined + 10
`;
      
      const result = patterns.detectPatterns(code);
      
      const undefinedVars = result.categories.filter(
        c => c.type === 'naming' && c.subtype === 'identity'
      );
      
      expect(undefinedVars.length).toBeGreaterThan(0);
      expect(undefinedVars[0].evidence[0]).toContain('used before definition');
    });

    it('should not flag defined variables', () => {
      const code = `
x = 5
y = 10
result = x + y
print(result)
`;
      
      const result = patterns.detectPatterns(code);
      
      const undefinedVars = result.categories.filter(
        c => c.evidence[0].includes('used before definition')
      );
      
      expect(undefinedVars.length).toBe(0);
    });

    it('should detect suspicious module imports', () => {
      const code = `
import nonexistentmoduleverylongname
from INVALIDMODULE import something
import module123456
`;
      
      const result = patterns.detectPatterns(code);
      
      const moduleIssues = result.categories.filter(
        c => c.type === 'naming' && c.subtype === 'external_source'
      );
      
      expect(moduleIssues.length).toBeGreaterThan(0);
      expect(moduleIssues[0].evidence[0]).toContain('Potentially non-existent module');
    });

    it('should not flag common Python modules', () => {
      const code = `
import os
import sys
import json
from datetime import datetime
`;
      
      const result = patterns.detectPatterns(code);
      
      const moduleIssues = result.categories.filter(
        c => c.type === 'naming' && c.subtype === 'external_source'
      );
      
      expect(moduleIssues.length).toBe(0);
    });

    it('should detect attribute access on None', () => {
      const code = `
result = None
value = result.attribute
`;
      
      const result = patterns.detectPatterns(code);
      
      const noneAccess = result.categories.filter(
        c => c.evidence[0].includes('Attribute access on potentially None variable')
      );
      
      expect(noneAccess.length).toBeGreaterThan(0);
    });
  });

  describe('Resource Hallucination Detection', () => {
    it('should detect infinite loops', () => {
      const code = `
while True:
    print("This will run forever")
    x = x + 1
`;
      
      const result = patterns.detectPatterns(code);
      
      const infiniteLoops = result.categories.filter(
        c => c.type === 'resource' && c.subtype === 'computational_boundary'
      );
      
      expect(infiniteLoops.length).toBeGreaterThan(0);
      expect(infiniteLoops[0].evidence[0]).toContain('Potential infinite loop');
      expect(infiniteLoops[0].severity).toBe('critical');
    });

    it('should not flag while True with break', () => {
      const code = `
while True:
    if condition:
        break
    process_data()
`;
      
      const result = patterns.detectPatterns(code);
      
      const infiniteLoops = result.categories.filter(
        c => c.evidence[0].includes('Potential infinite loop')
      );
      
      expect(infiniteLoops.length).toBe(0);
    });

    it('should detect recursive functions without base case', () => {
      const code = `
def factorial(n):
    return n * factorial(n - 1)
`;
      
      const result = patterns.detectPatterns(code);
      
      const recursionIssues = result.categories.filter(
        c => c.type === 'resource' && c.subtype === 'physical_constraint'
      );
      
      expect(recursionIssues.length).toBeGreaterThan(0);
      expect(recursionIssues[0].evidence[0]).toContain('may lack proper base case');
      expect(recursionIssues[0].severity).toBe('critical');
    });

    it('should not flag recursive functions with base case', () => {
      const code = `
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)
`;
      
      const result = patterns.detectPatterns(code);
      
      const recursionIssues = result.categories.filter(
        c => c.evidence[0].includes('may lack proper base case')
      );
      
      expect(recursionIssues.length).toBe(0);
    });

    it('should detect large range operations', () => {
      const code = `
for i in range(10000000):
    print(i)
`;
      
      const result = patterns.detectPatterns(code);
      
      const largeRanges = result.categories.filter(
        c => c.evidence[0].includes('Large range operation')
      );
      
      expect(largeRanges.length).toBeGreaterThan(0);
      expect(largeRanges[0].severity).toBe('high');
    });

    it('should detect memory intensive operations', () => {
      const code = `
large_list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60]
`;
      
      const result = patterns.detectPatterns(code);
      
      const memoryIntensive = result.categories.filter(
        c => c.evidence[0].includes('Large data structure detected')
      );
      
      expect(memoryIntensive.length).toBeGreaterThan(0);
      expect(memoryIntensive[0].type).toBe('resource');
    });
  });

  describe('Logic Hallucination Detection', () => {
    it('should detect contradictory conditions', () => {
      const code = `
if False:
    print("This will never execute")
    
if x == y and x != y:
    print("Contradictory")
`;
      
      const result = patterns.detectPatterns(code);
      
      const contradictory = result.categories.filter(
        c => c.type === 'logic' && c.subtype === 'logic_deviation'
      );
      
      expect(contradictory.length).toBeGreaterThan(0);
      expect(contradictory[0].evidence[0]).toContain('Always false condition');
    });

    it('should detect repeated lines', () => {
      const code = `
print("Hello World")
print("Hello World")
x = 5
x = 5
`;
      
      const result = patterns.detectPatterns(code);
      
      const repeated = result.categories.filter(
        c => c.evidence[0].includes('Repeated line detected')
      );
      
      expect(repeated.length).toBeGreaterThan(0);
      expect(repeated[0].type).toBe('logic');
      expect(repeated[0].subtype).toBe('logic_breakdown');
    });

    it('should detect incomplete function definitions', () => {
      const code = `
def incomplete_function():
`;
      
      const result = patterns.detectPatterns(code);
      
      const incomplete = result.categories.filter(
        c => c.evidence[0].includes('Incomplete function definition')
      );
      
      expect(incomplete.length).toBeGreaterThan(0);
      expect(incomplete[0].severity).toBe('high');
    });

    it('should detect unreachable code', () => {
      const code = `
def test_function():
    return True
    print("This will never execute")
    x = 5
`;
      
      const result = patterns.detectPatterns(code);
      
      const unreachable = result.categories.filter(
        c => c.evidence[0].includes('Unreachable code after return')
      );
      
      expect(unreachable.length).toBeGreaterThan(0);
      expect(unreachable[0].type).toBe('logic');
    });
  });

  describe('Code Structure Analysis', () => {
    it('should analyze code structure correctly', () => {
      const code = `
import os
import sys

class MyClass:
    def __init__(self):
        self.value = 0
    
    def method(self):
        return self.value

def my_function(x, y):
    if x > y:
        for i in range(10):
            try:
                result = x + y
            except Exception:
                pass
    return result

variable = 10
another_var = "hello"
`;
      
      const result = patterns.detectPatterns(code);
      
      expect(result.codeStructure.functions).toContain('my_function');
      expect(result.codeStructure.classes).toContain('MyClass');
      expect(result.codeStructure.variables).toContain('variable');
      expect(result.codeStructure.imports).toContain('os');
      
      expect(result.codeStructure.controlFlow.loops).toBeGreaterThan(0);
      expect(result.codeStructure.controlFlow.conditionals).toBeGreaterThan(0);
      expect(result.codeStructure.controlFlow.tryBlocks).toBeGreaterThan(0);
      
      expect(result.codeStructure.complexity.cyclomaticComplexity).toBeGreaterThan(1);
      expect(result.codeStructure.complexity.linesOfCode).toBeGreaterThan(10);
    });
  });

  describe('Pattern Management', () => {
    it('should return all available patterns', () => {
      const allPatterns = patterns.getPatterns();
      
      expect(allPatterns.length).toBeGreaterThan(0);
      expect(allPatterns.every(p => p.id && p.name && p.category)).toBe(true);
    });

    it('should filter patterns by category', () => {
      const mappingPatterns = patterns.getPatternsByCategory('mapping');
      const namingPatterns = patterns.getPatternsByCategory('naming');
      
      expect(mappingPatterns.every(p => p.category === 'mapping')).toBe(true);
      expect(namingPatterns.every(p => p.category === 'naming')).toBe(true);
      expect(mappingPatterns.length).toBeGreaterThan(0);
      expect(namingPatterns.length).toBeGreaterThan(0);
    });

    it('should get pattern by ID', () => {
      const pattern = patterns.getPattern('type_mismatch_string_number');
      
      expect(pattern).toBeDefined();
      expect(pattern!.id).toBe('type_mismatch_string_number');
      expect(pattern!.category).toBe('mapping');
    });

    it('should return undefined for non-existent pattern ID', () => {
      const pattern = patterns.getPattern('non_existent_pattern');
      
      expect(pattern).toBeUndefined();
    });
  });

  describe('Confidence Calculation', () => {
    it('should calculate overall confidence correctly', () => {
      const code = `
x = 5 + "hello"  # High confidence pattern
result = undefined_var  # High confidence pattern
`;
      
      const result = patterns.detectPatterns(code);
      
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.confidence).toBeLessThanOrEqual(1.0);
    });

    it('should return high confidence for clean code', () => {
      const code = `
def greet(name):
    return f"Hello, {name}!"

result = greet("World")
print(result)
`;
      
      const result = patterns.detectPatterns(code);
      
      // Clean code should have few or no pattern matches
      expect(result.categories.length).toBeLessThan(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty code', () => {
      const result = patterns.detectPatterns('');
      
      expect(result.matches).toHaveLength(0);
      expect(result.categories).toHaveLength(0);
      expect(result.confidence).toBe(1.0);
    });

    it('should handle code with only comments', () => {
      const code = `
# This is a comment
# Another comment
`;
      
      const result = patterns.detectPatterns(code);
      
      expect(result.categories.length).toBeLessThan(2);
    });

    it('should handle code with complex string literals', () => {
      const code = `
text = "This string contains + and * symbols"
regex = r"\\d+\\.\\d+"
multiline = """
This is a multiline string
with various symbols + - * /
"""
`;
      
      const result = patterns.detectPatterns(code);
      
      // Should not flag string literals as type mismatches
      const typeMismatches = result.categories.filter(
        c => c.evidence[0].includes('Type mismatch detected')
      );
      
      expect(typeMismatches.length).toBe(0);
    });
  });
});
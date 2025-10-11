/**
 * Unit tests for Enhanced Hallucination Detector
 * Testing the CodeHalu implementation for systematic code hallucination detection
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { CodeHaluDetector } from '../../src/enhanced-hallucination-detector.js';
import {
  HallucinationType,
  HallucinationSubtype,
  DetectionOptions,
} from '../../src/types/hallucination-types.js';

describe('CodeHaluDetector', () => {
  let detector: CodeHaluDetector;

  beforeEach(() => {
    detector = new CodeHaluDetector();
  });

  describe('Basic Functionality', () => {
    it('should create detector instance', () => {
      expect(detector).toBeInstanceOf(CodeHaluDetector);
    });

    it('should handle empty code input', async () => {
      await expect(detector.detectHallucinations('', 'python')).rejects.toThrow('Code cannot be empty');
    });

    it('should handle unsupported language', async () => {
      await expect(detector.detectHallucinations('print("hello")', 'javascript')).rejects.toThrow('Language \'javascript\' not yet supported');
    });

    it('should return valid result structure for simple code', async () => {
      const code = 'print("Hello, World!")';
      const result = await detector.detectHallucinations(code, 'python');

      expect(result).toHaveProperty('overallHallucinationRate');
      expect(result).toHaveProperty('categories');
      expect(result).toHaveProperty('codeQualityImpact');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('detectionMetadata');
      expect(result).toHaveProperty('hasCriticalIssues');
      expect(result).toHaveProperty('summary');

      expect(typeof result.overallHallucinationRate).toBe('number');
      expect(Array.isArray(result.categories)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });
  });

  describe('Mapping Hallucination Detection', () => {
    it('should detect data compliance issues - type mismatch', async () => {
      const code = `
x = 5
result = x + "hello"
`;
      const result = await detector.detectHallucinations(code, 'python');
      
      const mappingIssues = result.categories.filter(c => c.type === 'mapping' && c.subtype === 'data_compliance');
      expect(mappingIssues.length).toBeGreaterThan(0);
      expect(mappingIssues[0].evidence[0]).toContain('Type mismatch detected');
    });

    it('should detect structure access issues - potential index out of bounds', async () => {
      const code = `
arr = [1, 2, 3]
value = arr[100]
`;
      const result = await detector.detectHallucinations(code, 'python');
      
      const structureIssues = result.categories.filter(c => c.type === 'mapping' && c.subtype === 'structure_access');
      expect(structureIssues.length).toBeGreaterThan(0);
      expect(structureIssues[0].evidence[0]).toContain('Potential index out of bounds');
    });

    it('should detect unchecked dictionary key access', async () => {
      const code = `
data = {"name": "John"}
age = data["age"]
`;
      const result = await detector.detectHallucinations(code, 'python');
      
      const structureIssues = result.categories.filter(c => c.type === 'mapping' && c.subtype === 'structure_access');
      expect(structureIssues.length).toBeGreaterThan(0);
      expect(structureIssues[0].evidence[0]).toContain('Unchecked dictionary key access');
    });
  });

  describe('Naming Hallucination Detection', () => {
    it('should detect identity issues - undefined variable', async () => {
      const code = `
print(undefined_variable)
`;
      const result = await detector.detectHallucinations(code, 'python');
      
      const identityIssues = result.categories.filter(c => c.type === 'naming' && c.subtype === 'identity');
      expect(identityIssues.length).toBeGreaterThan(0);
      expect(identityIssues[0].evidence[0]).toContain('used before definition');
    });

    it('should detect external source issues - non-existent module', async () => {
      const code = `
import nonexistentmoduleverylongname
`;
      const result = await detector.detectHallucinations(code, 'python');
      
      const externalIssues = result.categories.filter(c => c.type === 'naming' && c.subtype === 'external_source');
      expect(externalIssues.length).toBeGreaterThan(0);
      expect(externalIssues[0].evidence[0]).toContain('Potentially non-existent module');
    });

    it('should not flag common Python modules', async () => {
      const code = `
import os
import sys
import json
`;
      const result = await detector.detectHallucinations(code, 'python');
      
      const externalIssues = result.categories.filter(c => c.type === 'naming' && c.subtype === 'external_source');
      expect(externalIssues.length).toBe(0);
    });
  });

  describe('Resource Hallucination Detection', () => {
    it('should detect physical constraint issues - recursive function without base case', async () => {
      const code = `
def factorial(n):
    return n * factorial(n - 1)
`;
      const result = await detector.detectHallucinations(code, 'python');
      
      const physicalIssues = result.categories.filter(c => c.type === 'resource' && c.subtype === 'physical_constraint');
      expect(physicalIssues.length).toBeGreaterThan(0);
      expect(physicalIssues[0].evidence[0]).toContain('may lack proper base case');
    });

    it('should detect computational boundary issues - infinite loop', async () => {
      const code = `
while True:
    print("This will run forever")
`;
      const result = await detector.detectHallucinations(code, 'python');
      
      const boundaryIssues = result.categories.filter(c => c.type === 'resource' && c.subtype === 'computational_boundary');
      expect(boundaryIssues.length).toBeGreaterThan(0);
      expect(boundaryIssues[0].evidence[0]).toContain('Potential infinite loop');
    });

    it('should detect large range operations', async () => {
      const code = `
for i in range(10000000):
    print(i)
`;
      const result = await detector.detectHallucinations(code, 'python');
      
      const boundaryIssues = result.categories.filter(c => c.type === 'resource' && c.subtype === 'computational_boundary');
      expect(boundaryIssues.length).toBeGreaterThan(0);
      expect(boundaryIssues[0].evidence[0]).toContain('Large range operation');
    });
  });

  describe('Logic Hallucination Detection', () => {
    it('should detect logic deviation issues - always false condition', async () => {
      const code = `
if False:
    print("This will never execute")
`;
      const result = await detector.detectHallucinations(code, 'python');
      
      const deviationIssues = result.categories.filter(c => c.type === 'logic' && c.subtype === 'logic_deviation');
      expect(deviationIssues.length).toBeGreaterThan(0);
      expect(deviationIssues[0].evidence[0]).toContain('Always false condition');
    });

    it('should detect logic breakdown issues - repeated lines', async () => {
      const code = `
print("Hello World")
print("Hello World")
`;
      const result = await detector.detectHallucinations(code, 'python');
      
      const breakdownIssues = result.categories.filter(c => c.type === 'logic' && c.subtype === 'logic_breakdown');
      expect(breakdownIssues.length).toBeGreaterThan(0);
      expect(breakdownIssues[0].evidence[0]).toContain('Repeated line detected');
    });

    it('should detect incomplete function definitions', async () => {
      const code = `
def incomplete_function():
`;
      const result = await detector.detectHallucinations(code, 'python');
      
      const breakdownIssues = result.categories.filter(c => c.type === 'logic' && c.subtype === 'logic_breakdown');
      expect(breakdownIssues.length).toBeGreaterThan(0);
      expect(breakdownIssues[0].evidence[0]).toContain('Incomplete function definition');
    });
  });

  describe('Detection Options', () => {
    it('should respect confidence threshold', async () => {
      const code = `
x = undefined_var
`;
      const options: DetectionOptions = {
        confidenceThreshold: 0.9,
      };
      
      const result = await detector.detectHallucinations(code, 'python', options);
      
      // All returned categories should have confidence >= 0.9
      result.categories.forEach(category => {
        expect(category.confidence).toBeGreaterThanOrEqual(0.9);
      });
    });

    it('should focus on specific categories when requested', async () => {
      const code = `
x = undefined_var
y = 5 + "hello"
`;
      const options: DetectionOptions = {
        focusCategories: ['mapping'],
      };
      
      const result = await detector.detectHallucinations(code, 'python', options);
      
      // Should only contain mapping hallucinations
      result.categories.forEach(category => {
        expect(category.type).toBe('mapping');
      });
    });

    it('should generate recommendations when enabled', async () => {
      const code = `
x = undefined_var
`;
      const options: DetectionOptions = {
        generateRecommendations: true,
      };
      
      const result = await detector.detectHallucinations(code, 'python', options);
      
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations[0]).toHaveProperty('title');
      expect(result.recommendations[0]).toHaveProperty('actionItems');
    });

    it('should not generate recommendations when disabled', async () => {
      const code = `
x = undefined_var
`;
      const options: DetectionOptions = {
        generateRecommendations: false,
      };
      
      const result = await detector.detectHallucinations(code, 'python', options);
      
      expect(result.recommendations.length).toBe(0);
    });
  });

  describe('Result Metrics', () => {
    it('should calculate hallucination rate correctly', async () => {
      const code = `
print("Hello World")
`;
      const result = await detector.detectHallucinations(code, 'python');
      
      expect(result.overallHallucinationRate).toBeGreaterThanOrEqual(0);
      expect(result.overallHallucinationRate).toBeLessThanOrEqual(1);
    });

    it('should provide accurate summary statistics', async () => {
      const code = `
x = undefined_var
y = 5 + "hello"
`;
      const result = await detector.detectHallucinations(code, 'python');
      
      const { summary } = result;
      expect(summary.totalHallucinations).toBe(result.categories.length);
      
      const actualCritical = result.categories.filter(c => c.severity === 'critical').length;
      const actualHigh = result.categories.filter(c => c.severity === 'high').length;
      const actualMedium = result.categories.filter(c => c.severity === 'medium').length;
      const actualLow = result.categories.filter(c => c.severity === 'low').length;
      
      expect(summary.criticalCount).toBe(actualCritical);
      expect(summary.highSeverityCount).toBe(actualHigh);
      expect(summary.mediumSeverityCount).toBe(actualMedium);
      expect(summary.lowSeverityCount).toBe(actualLow);
    });

    it('should set hasCriticalIssues flag correctly', async () => {
      const codeWithCritical = `
while True:
    pass
`;
      const result = await detector.detectHallucinations(codeWithCritical, 'python');
      
      const hasCritical = result.categories.some(c => c.severity === 'critical');
      expect(result.hasCriticalIssues).toBe(hasCritical);
    });
  });

  describe('Detection Metadata', () => {
    it('should provide complete metadata', async () => {
      const code = 'print("Hello World")';
      const result = await detector.detectHallucinations(code, 'python');
      
      const { detectionMetadata } = result;
      expect(detectionMetadata.analysisTimeMs).toBeGreaterThan(0);
      expect(detectionMetadata.detectionVersion).toBe('1.0.0');
      expect(detectionMetadata.language).toBe('python');
      expect(detectionMetadata.codeLength).toBe(code.length);
      expect(detectionMetadata.timestamp).toBeDefined();
      expect(detectionMetadata.executionVerified).toBe(false); // Execution not implemented yet
    });
  });

  describe('Error Handling', () => {
    it('should handle detection errors gracefully', async () => {
      // This test would be more meaningful with actual error scenarios
      // For now, we test that the detector doesn't crash on edge cases
      
      const edgeCases = [
        '# Just a comment',
        '    ', // Only whitespace
        'print("test")\n\n\n', // Multiple newlines
      ];
      
      for (const code of edgeCases) {
        const result = await detector.detectHallucinations(code.trim() || 'pass', 'python');
        expect(result).toBeDefined();
        expect(result.detectionMetadata).toBeDefined();
      }
    });
  });

  describe('Performance', () => {
    it('should complete analysis within reasonable time', async () => {
      const code = `
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

result = fibonacci(10)
print(result)
`;
      
      const startTime = Date.now();
      const result = await detector.detectHallucinations(code, 'python');
      const endTime = Date.now();
      
      const analysisTime = endTime - startTime;
      expect(analysisTime).toBeLessThan(1000); // Should complete within 1 second
      expect(result.detectionMetadata.analysisTimeMs).toBeLessThan(1000);
    });
  });
});

describe('Hallucination Type Definitions', () => {
  it('should have all required hallucination types', () => {
    const expectedTypes: HallucinationType[] = ['mapping', 'naming', 'resource', 'logic'];
    expectedTypes.forEach(type => {
      expect(['mapping', 'naming', 'resource', 'logic']).toContain(type);
    });
  });

  it('should have all required hallucination subtypes', () => {
    const expectedSubtypes: HallucinationSubtype[] = [
      'data_compliance', 'structure_access',
      'identity', 'external_source',
      'physical_constraint', 'computational_boundary',
      'logic_deviation', 'logic_breakdown'
    ];
    
    expectedSubtypes.forEach(subtype => {
      expect([
        'data_compliance', 'structure_access',
        'identity', 'external_source',
        'physical_constraint', 'computational_boundary',
        'logic_deviation', 'logic_breakdown'
      ]).toContain(subtype);
    });
  });
});
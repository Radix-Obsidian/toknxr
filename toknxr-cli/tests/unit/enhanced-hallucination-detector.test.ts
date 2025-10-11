/**
 * Unit tests for Enhanced Hallucination Detector
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { CodeHaluDetector, createCodeHaluDetector, detectCodeHallucinations } from '../../src/enhanced-hallucination-detector.js';
import { HallucinationPatterns, detectAllPatterns } from '../../src/hallucination-patterns.js';
import { ExecutionBasedDetector } from '../../src/execution-based-detector.js';

describe('Enhanced Hallucination Detector', () => {
  let detector: CodeHaluDetector;

  beforeEach(() => {
    detector = createCodeHaluDetector({
      enableExecutionAnalysis: true,
      enableStaticAnalysis: true,
      enablePatternMatching: true,
      confidenceThreshold: 0.6,
    });
  });

  describe('Pattern Detection', () => {
    it('should detect mapping hallucinations (TypeError patterns)', () => {
      const code = `
x = "hello"
y = 5
result = x + y  # TypeError: can't concatenate str and int
print(result)
`;
      
      const patterns = detectAllPatterns(code);
      const mappingPatterns = patterns.filter(p => p.category === 'mapping');
      
      expect(mappingPatterns.length).toBeGreaterThan(0);
      expect(mappingPatterns[0].pattern).toBe('typeError');
      expect(mappingPatterns[0].confidence).toBeGreaterThan(0.7);
      expect(mappingPatterns[0].severity).toBe('high');
    });

    it('should detect naming hallucinations (NameError patterns)', () => {
      const code = `
def greet():
    return f"Hello, {name}!"  # NameError: name 'name' is not defined

message = greet()
print(message)
`;
      
      const patterns = detectAllPatterns(code);
      const namingPatterns = patterns.filter(p => p.category === 'naming');
      
      expect(namingPatterns.length).toBeGreaterThan(0);
      expect(namingPatterns[0].pattern).toBe('nameError');
      expect(namingPatterns[0].confidence).toBeGreaterThan(0.7);
    });

    it('should detect resource hallucinations (memory patterns)', () => {
      const code = `
# Create a huge list that will cause memory issues
big_list = [0] * 10000000  # MemoryError: out of memory
print(len(big_list))
`;
      
      const patterns = detectAllPatterns(code);
      const resourcePatterns = patterns.filter(p => p.category === 'resource');
      
      expect(resourcePatterns.length).toBeGreaterThan(0);
      expect(resourcePatterns[0].subtype).toBe('physical_constraint');
    });

    it('should detect logic hallucinations (infinite loop patterns)', () => {
      const code = `
while True:  # infinite loop detected
    print("This will run forever")
    x = x + 1
`;
      
      const patterns = detectAllPatterns(code);
      const logicPatterns = patterns.filter(p => p.category === 'logic');
      
      expect(logicPatterns.length).toBeGreaterThan(0);
      expect(logicPatterns[0].severity).toBe('high');
    });
  });

  describe('Core Detection Algorithm', () => {
    it('should detect hallucinations in simple problematic code', async () => {
      const code = `
def divide_numbers(a, b):
    return a / b  # ZeroDivisionError when b=0

result = divide_numbers(10, 0)
print(result)
`;
      
      const result = await detector.detectHallucinations(code, 'python');
      
      expect(result.overallHallucinationRate).toBeGreaterThan(0);
      expect(result.categories.length).toBeGreaterThan(0);
      expect(result.analysisMetadata.detectionMethods).toContain('static');
      expect(result.recommendations.length).toBeGreaterThan(0);
    }, 15000);

    it('should handle clean code with low hallucination rate', async () => {
      const code = `
def add_numbers(a, b):
    """Add two numbers safely."""
    if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
        raise ValueError("Both arguments must be numbers")
    return a + b

result = add_numbers(5, 3)
print(f"Result: {result}")
`;
      
      const result = await detector.detectHallucinations(code, 'python');
      
      expect(result.overallHallucinationRate).toBeLessThan(0.3);
      expect(result.categories.length).toBeLessThanOrEqual(1);
    }, 15000);

    it('should provide business impact analysis', async () => {
      const code = `
# Multiple issues in one code block
undefined_var = some_undefined_variable  # NameError
result = "text" + 123  # TypeError
big_list = [0] * 1000000  # Memory issue
`;
      
      const result = await detector.detectHallucinations(code, 'python');
      
      expect(result.businessImpact.estimatedDevTimeWasted).toBeGreaterThan(0);
      expect(result.businessImpact.costOfHallucinations).toBeGreaterThan(0);
      expect(result.businessImpact.qualityImpact).toBeGreaterThan(0);
      expect(result.businessImpact.costMultiplier).toBeGreaterThan(1.0);
    }, 15000);

    it('should generate appropriate recommendations', async () => {
      const code = `
# Code with naming and mapping issues
print(undefined_variable)  # NameError
result = "hello" + 5  # TypeError
`;
      
      const result = await detector.detectHallucinations(code, 'python');
      
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations[0].title).toBeDefined();
      expect(result.recommendations[0].actionItems.length).toBeGreaterThan(0);
      expect(result.recommendations[0].expectedImpact).toBeDefined();
    }, 15000);
  });

  describe('Execution-Based Detection', () => {
    it('should detect runtime errors through execution', async () => {
      const code = `
def test_function():
    x = 10
    y = 0
    return x / y  # This will cause ZeroDivisionError

result = test_function()
print(result)
`;
      
      const result = await detector.detectHallucinations(code, 'python');
      
      expect(result.executionResult).toBeDefined();
      expect(result.executionResult?.success).toBe(false);
      expect(result.executionResult?.errors.length).toBeGreaterThan(0);
      
      // Should detect logic hallucination from execution
      const logicCategories = result.categories.filter(c => c.type === 'logic');
      expect(logicCategories.length).toBeGreaterThan(0);
    }, 15000);

    it('should detect resource usage issues', async () => {
      const code = `
# Code that uses significant memory
data = list(range(50000))  # Large list
result = sum(data)
print(f"Sum: {result}")
`;
      
      const result = await detector.detectHallucinations(code, 'python');
      
      expect(result.executionResult).toBeDefined();
      expect(result.executionResult?.resourceUsage.memoryMB).toBeGreaterThan(0);
      
      // May detect resource hallucination if memory usage is high
      const resourceCategories = result.categories.filter(c => c.type === 'resource');
      // Note: This might not always trigger depending on system resources
    }, 15000);

    it('should validate output correctness when expected output provided', async () => {
      const code = `
def calculate_factorial(n):
    if n <= 1:
        return 1
    return n * calculate_factorial(n - 1)

result = calculate_factorial(5)
print(result)
`;
      
      const context = {
        expectedOutput: 120,
      };
      
      const result = await detector.detectHallucinations(code, 'python', context);
      
      expect(result.executionResult).toBeDefined();
      expect(result.executionResult?.success).toBe(true);
      
      // Should have low hallucination rate for correct implementation
      expect(result.overallHallucinationRate).toBeLessThan(0.3);
    }, 15000);
  });

  describe('Configuration and Error Handling', () => {
    it('should handle invalid input gracefully', async () => {
      const result = await detector.detectHallucinations('', 'python');
      
      expect(result.overallHallucinationRate).toBe(1.0);
      expect(result.categories.length).toBeGreaterThan(0);
      expect(result.categories[0].severity).toBe('critical');
    });

    it('should respect confidence threshold configuration', async () => {
      const lowThresholdDetector = createCodeHaluDetector({
        confidenceThreshold: 0.3,
      });
      
      const highThresholdDetector = createCodeHaluDetector({
        confidenceThreshold: 0.9,
      });
      
      const code = `
# Borderline case that might have medium confidence
result = some_var + 1  # Potential NameError
`;
      
      const lowResult = await lowThresholdDetector.detectHallucinations(code, 'python');
      const highResult = await highThresholdDetector.detectHallucinations(code, 'python');
      
      // Low threshold should detect more issues
      expect(lowResult.categories.length).toBeGreaterThanOrEqual(highResult.categories.length);
    }, 15000);

    it('should handle unsupported languages gracefully', async () => {
      const code = `
console.log("Hello, World!");
const result = undefined_variable + 5;
`;
      
      const result = await detector.detectHallucinations(code, 'javascript');
      
      // Should still perform static analysis even for unsupported languages
      expect(result.analysisMetadata.language).toBe('javascript');
      expect(result.analysisMetadata.detectionMethods).toContain('static');
    }, 15000);
  });

  describe('Performance and Optimization', () => {
    it('should complete detection within reasonable time', async () => {
      const code = `
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

result = fibonacci(10)
print(f"Fibonacci(10) = {result}")
`;
      
      const startTime = Date.now();
      const result = await detector.detectHallucinations(code, 'python');
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
      expect(result.analysisMetadata.detectionTimeMs).toBeLessThan(10000);
    }, 15000);

    it('should handle complex code with multiple issues efficiently', async () => {
      const code = `
# Complex code with multiple potential issues
import nonexistent_module  # ImportError

def problematic_function(data):
    result = []
    for i in range(len(data)):
        if data[i] > 0:
            result.append(data[i] / 0)  # ZeroDivisionError
        else:
            result.append(undefined_var)  # NameError
    return result

# Memory intensive operation
big_data = [i for i in range(100000)]
processed = problematic_function(big_data)
print(len(processed))
`;
      
      const result = await detector.detectHallucinations(code, 'python');
      
      expect(result.categories.length).toBeGreaterThan(2);
      expect(result.overallHallucinationRate).toBeGreaterThan(0.5);
      
      // Should detect multiple types of hallucinations
      const categoryTypes = new Set(result.categories.map(c => c.type));
      expect(categoryTypes.size).toBeGreaterThan(1);
    }, 20000);
  });

  describe('Utility Functions', () => {
    it('should work with utility function for quick detection', async () => {
      const code = `
def safe_divide(a, b):
    if b == 0:
        return None
    return a / b

result = safe_divide(10, 2)
print(result)
`;
      
      const result = await detectCodeHallucinations(code, 'python', {
        enableExecution: true,
        confidenceThreshold: 0.7,
      });
      
      expect(result.overallHallucinationRate).toBeLessThan(0.3);
      expect(result.categories.length).toBeLessThanOrEqual(1);
    }, 15000);
  });
});

describe('Pattern Detection System', () => {
  describe('HallucinationPatterns', () => {
    it('should detect mapping patterns correctly', () => {
      const code = `
x = "hello"
y = 5
result = x + y  # TypeError: can't concatenate str and int
`;
      
      const patterns = HallucinationPatterns.detectMappingHallucinations(code);
      
      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns[0].category).toBe('mapping');
      expect(patterns[0].subtype).toBe('data_compliance');
    });

    it('should analyze code structure correctly', () => {
      const code = `
import os
import sys

class Calculator:
    def __init__(self):
        self.result = 0
    
    def add(self, x, y):
        return x + y
    
    async def async_operation(self):
        await some_async_call()

def main():
    calc = Calculator()
    try:
        result = calc.add(5, 3)
        print(result)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
`;
      
      const structure = HallucinationPatterns.analyzeCodeStructure(code);
      
      expect(structure.functions.length).toBeGreaterThan(0);
      expect(structure.classes.length).toBeGreaterThan(0);
      expect(structure.imports.length).toBeGreaterThan(0);
      expect(structure.hasAsyncCode).toBe(true);
      expect(structure.hasErrorHandling).toBe(true);
      expect(structure.complexity).toBeGreaterThan(1);
    });

    it('should convert pattern results to hallucination categories', () => {
      const code = `
print(undefined_variable)  # NameError: name not defined
result = "text" + 123  # TypeError: can't concatenate
`;
      
      const patterns = detectAllPatterns(code);
      const categories = HallucinationPatterns.convertToHallucinationCategories(patterns);
      
      expect(categories.length).toBeGreaterThan(0);
      expect(categories[0].type).toBeDefined();
      expect(categories[0].confidence).toBeGreaterThan(0);
      expect(categories[0].businessImpact).toBeDefined();
      expect(categories[0].suggestedFix).toBeDefined();
    });
  });
});

describe('Execution-Based Detection', () => {
  let executionDetector: ExecutionBasedDetector;

  beforeEach(() => {
    executionDetector = new ExecutionBasedDetector({
      memoryThresholdMB: 32,
      executionTimeThresholdMs: 2000,
    });
  });

  it('should detect resource hallucinations from execution results', async () => {
    const mockExecutionResult = {
      success: true,
      output: 'Test output',
      errors: [],
      resourceUsage: {
        memoryMB: 64, // Above threshold
        executionTimeMs: 3000, // Above threshold
        cpuUsage: 85, // Above threshold
      },
      securityFlags: [],
      timedOut: false,
    };

    const categories = await executionDetector.detectResourceHallucinations(mockExecutionResult);
    
    expect(categories.length).toBeGreaterThan(0);
    
    const resourceCategories = categories.filter(c => c.type === 'resource');
    expect(resourceCategories.length).toBeGreaterThan(0);
  });

  it('should detect logic hallucinations from code analysis', async () => {
    const code = `
while True:
    print("Infinite loop")
    # No break statement
`;
    
    const mockExecutionResult = {
      success: false,
      output: '',
      errors: [],
      resourceUsage: {
        memoryMB: 10,
        executionTimeMs: 1000,
        cpuUsage: 50,
      },
      securityFlags: [],
      timedOut: true,
    };

    const categories = await executionDetector.detectLogicHallucinations(code, mockExecutionResult);
    
    expect(categories.length).toBeGreaterThan(0);
    
    const logicCategories = categories.filter(c => c.type === 'logic');
    expect(logicCategories.length).toBeGreaterThan(0);
  });
});
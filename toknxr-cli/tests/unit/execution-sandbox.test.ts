/**
 * Unit tests for Execution Sandbox
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { ExecutionSandbox, checkPythonAvailability } from '../../src/execution-sandbox.js';
import { ResourceLimits, TestCase } from '../../src/types/hallucination-types.js';

describe('ExecutionSandbox', () => {
  let sandbox: ExecutionSandbox;

  beforeEach(() => {
    sandbox = new ExecutionSandbox();
  });

  describe('Basic Execution', () => {
    it('should execute simple Python code successfully', async () => {
      const code = `
result = 2 + 2
print(f"Result: {result}")
`;
      
      const result = await sandbox.execute(code);
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('Result: 4');
      expect(result.errors).toHaveLength(0);
      expect(result.timedOut).toBe(false);
      expect(result.resourceUsage.executionTimeMs).toBeGreaterThan(0);
    }, 10000);

    it('should capture print output correctly', async () => {
      const code = `
print("Hello, World!")
print("Line 2")
for i in range(3):
    print(f"Count: {i}")
`;
      
      const result = await sandbox.execute(code);
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('Hello, World!');
      expect(result.output).toContain('Line 2');
      expect(result.output).toContain('Count: 0');
      expect(result.output).toContain('Count: 1');
      expect(result.output).toContain('Count: 2');
    }, 10000);

    it('should handle code with variables and functions', async () => {
      const code = `
def greet(name):
    return f"Hello, {name}!"

name = "Alice"
message = greet(name)
print(message)

def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

result = factorial(5)
print(f"Factorial of 5: {result}")
`;
      
      const result = await sandbox.execute(code);
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('Hello, Alice!');
      expect(result.output).toContain('Factorial of 5: 120');
    }, 10000);
  });

  describe('Error Handling', () => {
    it('should handle syntax errors', async () => {
      const code = `
print("Missing closing quote
invalid syntax here
`;
      
      const result = await sandbox.execute(code);
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].type).toContain('Error');
    }, 10000);

    it('should handle runtime errors', async () => {
      const code = `
x = 5
y = 0
result = x / y  # Division by zero
print(f"Result: {result}")
`;
      
      const result = await sandbox.execute(code);
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].type).toBe('ZeroDivisionError');
      expect(result.errors[0].message).toContain('division by zero');
    }, 10000);

    it('should handle name errors', async () => {
      const code = `
print(undefined_variable)
`;
      
      const result = await sandbox.execute(code);
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].type).toBe('NameError');
      expect(result.errors[0].message).toContain('undefined_variable');
    }, 10000);

    it('should handle type errors', async () => {
      const code = `
x = "hello"
y = 5
result = x + y  # Type error
`;
      
      const result = await sandbox.execute(code);
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].type).toBe('TypeError');
    }, 10000);
  });

  describe('Security Assessment', () => {
    it('should detect dangerous imports', () => {
      const code = `
import os
import subprocess
import sys
os.system("ls")
`;
      
      const assessment = sandbox.validateSafety(code);
      
      expect(assessment.isSafe).toBe(false);
      expect(assessment.risks.length).toBeGreaterThan(0);
      expect(assessment.confidence).toBeLessThan(1.0);
      expect(assessment.allowExecution).toBe(false);
    });

    it('should detect dangerous function calls', () => {
      const code = `
exec("print('dangerous')")
eval("2 + 2")
__import__("os")
`;
      
      const assessment = sandbox.validateSafety(code);
      
      expect(assessment.isSafe).toBe(false);
      expect(assessment.risks.length).toBeGreaterThan(0);
      expect(assessment.allowExecution).toBe(false);
    });

    it('should detect file operations', () => {
      const code = `
with open("/etc/passwd", "r") as f:
    content = f.read()
    print(content)
`;
      
      const assessment = sandbox.validateSafety(code);
      
      expect(assessment.isSafe).toBe(false);
      expect(assessment.risks.length).toBeGreaterThan(0);
    });

    it('should detect potential infinite loops', () => {
      const code = `
while True:
    print("This will run forever")
    x = x + 1
`;
      
      const assessment = sandbox.validateSafety(code);
      
      expect(assessment.isSafe).toBe(false);
      expect(assessment.risks).toContain('Potential infinite loop detected');
    });

    it('should allow safe code', () => {
      const code = `
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

result = fibonacci(10)
print(f"Fibonacci(10) = {result}")
`;
      
      const assessment = sandbox.validateSafety(code);
      
      expect(assessment.isSafe).toBe(true);
      expect(assessment.allowExecution).toBe(true);
      expect(assessment.confidence).toBeGreaterThan(0.5);
    });
  });

  describe('Resource Limits', () => {
    it('should respect execution timeout', async () => {
      const code = `
import time
time.sleep(10)  # Sleep for 10 seconds
print("This should not print")
`;
      
      // Set a short timeout
      const customSandbox = new ExecutionSandbox({ maxExecutionTimeMs: 1000 });
      const result = await customSandbox.execute(code);
      
      expect(result.success).toBe(false);
      expect(result.timedOut).toBe(true);
      expect(result.errors.some(e => e.type === 'TimeoutError')).toBe(true);
    }, 15000);

    it('should track resource usage', async () => {
      const code = `
# Create some data to use memory
data = [i for i in range(1000)]
result = sum(data)
print(f"Sum: {result}")
`;
      
      const result = await sandbox.execute(code);
      
      expect(result.success).toBe(true);
      expect(result.resourceUsage.executionTimeMs).toBeGreaterThan(0);
      expect(result.resourceUsage.memoryMB).toBeGreaterThanOrEqual(0);
    }, 10000);

    it('should get and set resource limits', () => {
      const limits = sandbox.getResourceLimits();
      
      expect(limits.maxMemoryMB).toBeDefined();
      expect(limits.maxExecutionTimeMs).toBeDefined();
      expect(limits.maxCpuCores).toBeDefined();
      
      const newLimits = {
        maxMemoryMB: 64,
        maxExecutionTimeMs: 2000,
      };
      
      sandbox.setResourceLimits(newLimits);
      const updatedLimits = sandbox.getResourceLimits();
      
      expect(updatedLimits.maxMemoryMB).toBe(64);
      expect(updatedLimits.maxExecutionTimeMs).toBe(2000);
    });
  });

  describe('Test Case Execution', () => {
    it('should execute code with test cases', async () => {
      const code = `
def add(a, b):
    return a + b

if 'test_input' in locals():
    result = add(test_input[0], test_input[1])
    print(f"Result: {result}")
`;
      
      const testCases: TestCase[] = [
        {
          description: 'Add positive numbers',
          input: [2, 3],
          expectedOutput: 5,
          timeoutMs: 1000,
        },
        {
          description: 'Add negative numbers',
          input: [-1, -2],
          expectedOutput: -3,
          timeoutMs: 1000,
        },
      ];
      
      const results = await sandbox.executeWithTests(code, testCases);
      
      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[0].output).toContain('Result: 5');
      expect(results[1].success).toBe(true);
      expect(results[1].output).toContain('Result: -3');
    }, 15000);

    it('should stop on critical test failure', async () => {
      const code = `
def divide(a, b):
    return a / b

if 'test_input' in locals():
    result = divide(test_input[0], test_input[1])
    print(f"Result: {result}")
`;
      
      const testCases: TestCase[] = [
        {
          description: 'Normal division',
          input: [10, 2],
          expectedOutput: 5,
          critical: false,
        },
        {
          description: 'Division by zero',
          input: [10, 0],
          critical: true,
        },
        {
          description: 'This should not run',
          input: [6, 3],
          critical: false,
        },
      ];
      
      const results = await sandbox.executeWithTests(code, testCases);
      
      expect(results).toHaveLength(2); // Should stop after critical failure
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].errors[0].type).toBe('ZeroDivisionError');
    }, 15000);
  });

  describe('Input Validation', () => {
    it('should reject empty code', async () => {
      const result = await sandbox.execute('');
      
      expect(result.success).toBe(false);
      expect(result.errors[0].message).toContain('Code cannot be empty');
    });

    it('should reject unsupported language', async () => {
      const result = await sandbox.execute('console.log("hello");', 'javascript');
      
      expect(result.success).toBe(false);
      expect(result.errors[0].message).toContain('not supported');
    });

    it('should reject code that is too long', async () => {
      const longCode = 'print("x");\n'.repeat(50000); // Very long code
      
      const result = await sandbox.execute(longCode);
      
      expect(result.success).toBe(false);
      expect(result.errors[0].message).toContain('too long');
    });
  });

  describe('Edge Cases', () => {
    it('should handle code with no output', async () => {
      const code = `
x = 5
y = 10
z = x + y
# No print statements
`;
      
      const result = await sandbox.execute(code);
      
      expect(result.success).toBe(true);
      expect(result.output).toBe('');
    }, 10000);

    it('should handle code with only comments', async () => {
      const code = `
# This is a comment
# Another comment
# No actual code
`;
      
      const result = await sandbox.execute(code);
      
      expect(result.success).toBe(true);
      expect(result.output).toBe('');
    }, 10000);

    it('should handle code with unicode characters', async () => {
      const code = `
message = "Hello, 世界! 🌍"
print(message)
emoji = "🐍"
print(f"Python {emoji}")
`;
      
      const result = await sandbox.execute(code);
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('Hello, 世界! 🌍');
      expect(result.output).toContain('Python 🐍');
    }, 10000);
  });
});

describe('Python Availability', () => {
  it('should check if Python is available', async () => {
    const isAvailable = await checkPythonAvailability();
    
    // This test might fail in environments without Python
    // but it should at least return a boolean
    expect(typeof isAvailable).toBe('boolean');
  }, 10000);
});
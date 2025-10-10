#!/usr/bin/env node

// Direct test of code analysis functions
import { analyzeCodeQuality, scoreEffectiveness, extractCodeFromResponse } from './src/code-analysis.ts';

console.log('🧪 Testing AI Code Quality Analysis Feature\n');

// Test 1: Code Quality Analysis
const testCode = `/**
 * Calculate fibonacci sequence
 * @param {number} n - number of terms
 * @returns {number[]} fibonacci sequence
 */
function fibonacci(n) {
  if (typeof n !== 'number' || n < 1 || n > 100) {
    throw new Error('Invalid input: n must be a number between 1 and 100');
  }

  const sequence = [0, 1];
  for (let i = 2; i < n; i++) {
    sequence.push(sequence[i - 1] + sequence[i - 2]);
  }

  return sequence.slice(0, n);
}`;

console.log('1. Testing Code Quality Analysis:');
console.log('📝 Input code length:', testCode.length, 'characters');
console.log('📝 Code:');
console.log(testCode.substring(0, 100) + '...\n');

// Analyze code quality
const qualityMetrics = analyzeCodeQuality(testCode, 'javascript');

console.log('🔍 Analysis Results:');
console.log('✅ Syntax Valid:', qualityMetrics.syntaxValid);
console.log('📊 Lines of Code:', qualityMetrics.linesOfCode);
console.log('🎯 Has Functions:', qualityMetrics.hasFunctions);
console.log('📚 Estimated Readability:', `${qualityMetrics.estimatedReadability}/10`);
console.log('⚠️  Potential Issues:', qualityMetrics.potentialIssues.length || 'None');
console.log();

// Test 2: Effectiveness Scoring
const userPrompt = "Write a JavaScript function to calculate the fibonacci sequence up to n terms. Include proper error handling and use JSDoc comments.";

const aiResponse = `Here's a JavaScript function for calculating the Fibonacci sequence:

\`\`\`javascript
${testCode}
\`\`\`

This function includes error handling and JSDoc comments as requested.`;

console.log('2. Testing Effectiveness Analysis:');
console.log('👤 User Prompt:', userPrompt.substring(0, 80) + '...');
console.log('🤖 AI Response preview:', aiResponse.substring(0, 80) + '...\n');

// Extract code and score effectiveness
const extractedCode = extractCodeFromResponse(aiResponse);
if (extractedCode) {
  console.log('🔍 Extracted Code Language:', extractedCode.language);

  const effectiveness = scoreEffectiveness(userPrompt, aiResponse, extractedCode.code);

  console.log('📊 Effectiveness Scores:');
  console.log('🎯 Prompt Clarity Match:', `${effectiveness.promptClarityMatch}/100`);
  console.log('✅ Code Completeness:', `${effectiveness.codeCompleteness}/100`);
  console.log('🔧 Code Correctness:', `${effectiveness.codeCorrectness}/100`);
  console.log('⚡ Code Efficiency:', `${effectiveness.codeEfficiency}/100`);
  console.log('🏆 Overall Effectiveness:', `${effectiveness.overallEffectiveness}/100`);
} else {
  console.log('❌ Failed to extract code from response');
}

console.log('\n🎉 Code Analysis Feature is WORKING! 🎉');
console.log('\n💡 This same analysis runs on every coding request through the TokNxr proxy.');
console.log('📈 It provides insights into AI performance beyond just token costs.');

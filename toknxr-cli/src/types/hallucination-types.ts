/**
 * Enhanced Hallucination Detection Types
 * Based on CodeHalu research methodology for systematic code hallucination detection
 * 
 * @see https://github.com/yuchen814/CodeHalu
 * @version 1.0.0
 */

/**
 * Main hallucination categories based on CodeHalu taxonomy
 */
export type HallucinationType = 'mapping' | 'naming' | 'resource' | 'logic';

/**
 * Detailed subcategories for each main hallucination type
 */
export type HallucinationSubtype = 
  // Mapping Hallucinations - Issues with data types, values, and structures
  | 'data_compliance'        // Type mismatches, rule violations
  | 'structure_access'       // Non-existent array indices, dictionary keys
  
  // Naming Hallucinations - Memory and factual issues with variables, attributes, modules
  | 'identity'               // Undefined variables, unassigned variables, non-existent properties
  | 'external_source'        // Non-existent modules, import failures
  
  // Resource Hallucinations - Issues with resource consumption and control flow
  | 'physical_constraint'    // Memory limits, stack depth, physical constraints
  | 'computational_boundary' // Numerical overflow, iteration control issues
  
  // Logic Hallucinations - Discrepancies between expected and actual outcomes
  | 'logic_deviation'        // Incorrect outputs, logical inconsistencies
  | 'logic_breakdown';       // Context loss, stuttering, infinite loops

/**
 * Severity levels for hallucination impact assessment
 */
export type HallucinationSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Detection methods used to identify hallucinations
 */
export type DetectionMethod = 'static' | 'execution' | 'pattern' | 'statistical' | 'error';

/**
 * Business impact metrics for hallucination assessment
 */
export interface BusinessImpact {
  /** Estimated developer time wasted in hours */
  estimatedDevTimeWasted: number;
  
  /** Cost multiplier relative to baseline (1.0 = baseline cost) */
  costMultiplier: number;
  
  /** Quality impact on 0-100 scale */
  qualityImpact: number;
  
  /** Cost of hallucinations in USD */
  costOfHallucinations: number;
}

/**
 * Evidence supporting hallucination detection
 */
export interface Evidence {
  /** Type of evidence */
  type: string;
  
  /** Evidence content */
  content: string;
  
  /** Line number if applicable */
  lineNumber?: number;
  
  /** Confidence in this evidence */
  confidence: number;
}

/**
 * Individual hallucination category with detailed analysis
 */
export interface HallucinationCategory {
  /** Main hallucination type */
  type: HallucinationType;
  
  /** Specific subtype within the main category */
  subtype: HallucinationSubtype;
  
  /** Severity level of this hallucination */
  severity: HallucinationSeverity;
  
  /** Confidence score (0.0 - 1.0) in the detection */
  confidence: number;
  
  /** Human-readable description */
  description: string;
  
  /** Evidence supporting this hallucination detection */
  evidence: Evidence[];
  
  /** Line numbers where hallucination was detected (if applicable) */
  lineNumbers?: number[];
  
  /** Specific error message or pattern that triggered detection */
  errorMessage?: string;
  
  /** Suggested fix or mitigation strategy */
  suggestedFix?: string;
  
  /** Business impact assessment */
  businessImpact: BusinessImpact;
}

/**
 * Execution result from code verification
 */
export interface ExecutionResult {
  success: boolean;
  output?: string;
  stderr?: string;
  errors: ExecutionError[];
  resourceUsage: ResourceUsage;
  securityFlags: string[];
  exitCode?: number;
  timedOut: boolean;
}

/**
 * Resource limits for safe execution
 */
export interface ResourceLimits {
  maxMemoryMB: number;
  maxExecutionTimeMs: number;
  maxCpuCores: number;
  maxFileOperations: number;
  maxNetworkOperations: number;
  allowedSystemCalls: string[];
}

/**
 * Security assessment result
 */
export interface SecurityAssessment {
  isSafe: boolean;
  risks: string[];
  confidence: number;
  recommendations: string[];
  allowExecution: boolean;
}

/**
 * Execution options
 */
export interface ExecutionOptions {
  timeoutMs?: number;
  memoryLimitMB?: number;
  allowNetworking?: boolean;
  allowFileSystem?: boolean;
}

/**
 * Test case for code execution
 */
export interface TestCase {
  description: string;
  input?: any;
  expectedOutput?: any;
  timeoutMs?: number;
  critical?: boolean;
}

/**
 * Individual execution error details
 */
export interface ExecutionError {
  /** Type of error (e.g., 'NameError', 'TypeError') */
  type: string;
  
  /** Error message */
  message: string;
  
  /** Line number where error occurred */
  lineNumber?: number;
  
  /** Column number where error occurred */
  columnNumber?: number;
  
  /** Stack trace if available */
  stackTrace?: string;
}

/**
 * Resource usage metrics during code execution
 */
export interface ResourceUsage {
  /** Memory usage in megabytes */
  memoryMB: number;
  
  /** Execution time in milliseconds */
  executionTimeMs: number;
  
  /** CPU usage percentage */
  cpuUsage: number;
  
  /** Peak memory usage in megabytes */
  peakMemoryMB?: number;
  
  /** Number of system calls made */
  systemCalls?: number;
}

/**
 * User recommendation based on hallucination analysis
 */
export interface Recommendation {
  /** Priority level for this recommendation */
  priority: 'high' | 'medium' | 'low';
  
  /** Short, actionable title */
  title: string;
  
  /** Detailed description of the recommendation */
  description: string;
  
  /** Specific action items for the user */
  actionItems: string[];
  
  /** Expected impact of following this recommendation */
  expectedImpact: string;
  
  /** Estimated time to implement this recommendation */
  estimatedTimeToFix?: string;
  
  /** Links to relevant documentation or resources */
  resources?: string[];
}

/**
 * Metadata about the hallucination detection process
 */
export interface DetectionMetadata {
  /** Time taken for analysis in milliseconds */
  analysisTimeMs: number;
  
  /** Version of detection algorithm used */
  detectionVersion: string;
  
  /** Programming language analyzed */
  language: string;
  
  /** Length of code analyzed in characters */
  codeLength: number;
  
  /** Timestamp when analysis was performed */
  timestamp: string;
  
  /** Whether execution verification was performed */
  executionVerified: boolean;
  
  /** Number of patterns checked */
  patternsChecked?: number;
  
  /** Statistical confidence in overall analysis */
  statisticalConfidence?: number;
}

/**
 * Analysis metadata
 */
export interface AnalysisMetadata {
  /** Time taken for detection in milliseconds */
  detectionTimeMs: number;
  
  /** Length of code analyzed */
  codeLength: number;
  
  /** Programming language */
  language: string;
  
  /** Detection methods used */
  detectionMethods: DetectionMethod[];
  
  /** Analysis version */
  analysisVersion: string;
  
  /** Pattern statistics if available */
  patternStats?: {
    totalPatterns: number;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
    avgConfidence: number;
  };
}

/**
 * Complete result of CodeHalu hallucination analysis
 */
export interface CodeHaluResult {
  /** Overall hallucination rate (0.0 - 1.0) */
  overallHallucinationRate: number;
  
  /** Detected hallucination categories */
  categories: HallucinationCategory[];
  
  /** Execution result if code was executed */
  executionResult?: ExecutionResult;
  
  /** Generated recommendations for the user */
  recommendations: Recommendation[];
  
  /** Metadata about the analysis process */
  analysisMetadata: AnalysisMetadata;
  
  /** Business impact assessment */
  businessImpact: BusinessImpact;
}

/**
 * Configuration options for hallucination detection
 */
export interface DetectionOptions {
  /** Whether to perform execution verification */
  enableExecution?: boolean;
  
  /** Maximum execution time in milliseconds */
  executionTimeoutMs?: number;
  
  /** Maximum memory usage in megabytes */
  memoryLimitMB?: number;
  
  /** Minimum confidence threshold for reporting hallucinations */
  confidenceThreshold?: number;
  
  /** Whether to include low-severity hallucinations */
  includeLowSeverity?: boolean;
  
  /** Specific categories to focus on */
  focusCategories?: HallucinationType[];
  
  /** Whether to generate recommendations */
  generateRecommendations?: boolean;
  
  /** Additional context about the code */
  codeContext?: CodeContext;
}

/**
 * Additional context about the code being analyzed
 */
export interface CodeContext {
  /** Purpose or intent of the code */
  purpose?: string;
  
  /** Expected inputs and outputs */
  expectedBehavior?: string;
  
  /** Known constraints or requirements */
  constraints?: string[];
  
  /** Related code or dependencies */
  dependencies?: string[];
  
  /** User's experience level */
  userExperience?: 'beginner' | 'intermediate' | 'advanced';
  
  /** Target environment (e.g., 'production', 'development', 'testing') */
  environment?: string;
}

/**
 * Historical pattern data for statistical analysis
 */
export interface HistoricalPattern {
  /** Pattern identifier */
  patternId: string;
  
  /** Frequency of occurrence */
  frequency: number;
  
  /** Associated hallucination categories */
  categories: HallucinationType[];
  
  /** Success rate of this pattern */
  successRate: number;
  
  /** Last seen timestamp */
  lastSeen: string;
  
  /** Confidence in pattern reliability */
  reliability: number;
}



/**
 * Pattern match result for hallucination detection
 */
export interface PatternMatch {
  /** Pattern that was matched */
  pattern: string;
  
  /** Confidence in the match */
  confidence: number;
  
  /** Location of the match */
  location: {
    startLine: number;
    endLine: number;
    startColumn?: number;
    endColumn?: number;
  };
  
  /** Evidence supporting the match */
  evidence: string;
  
  /** Suggested category for this match */
  suggestedCategory: HallucinationCategory;
}

/**
 * Code structure analysis result
 */
export interface CodeStructure {
  /** Functions found in the code */
  functions: string[];
  
  /** Classes found in the code */
  classes: string[];
  
  /** Variables found in the code */
  variables: string[];
  
  /** Imports found in the code */
  imports: string[];
  
  /** Control flow structures */
  controlFlow: {
    loops: number;
    conditionals: number;
    tryBlocks: number;
  };
  
  /** Complexity metrics */
  complexity: {
    cyclomaticComplexity: number;
    linesOfCode: number;
    nestingDepth: number;
  };
}

/**
 * Error mapping for categorizing execution errors
 */
export const ERROR_CATEGORY_MAP: Record<string, { type: HallucinationType; subtype: HallucinationSubtype }> = {
  // Mapping Hallucinations
  'TypeError': { type: 'mapping', subtype: 'data_compliance' },
  'ValueError': { type: 'mapping', subtype: 'data_compliance' },
  'IndexError': { type: 'mapping', subtype: 'structure_access' },
  'KeyError': { type: 'mapping', subtype: 'structure_access' },
  'AttributeError': { type: 'mapping', subtype: 'structure_access' },
  
  // Naming Hallucinations
  'NameError': { type: 'naming', subtype: 'identity' },
  'UnboundLocalError': { type: 'naming', subtype: 'identity' },
  'ImportError': { type: 'naming', subtype: 'external_source' },
  'ModuleNotFoundError': { type: 'naming', subtype: 'external_source' },
  
  // Resource Hallucinations
  'MemoryError': { type: 'resource', subtype: 'physical_constraint' },
  'RecursionError': { type: 'resource', subtype: 'physical_constraint' },
  'OverflowError': { type: 'resource', subtype: 'computational_boundary' },
  'TimeoutError': { type: 'resource', subtype: 'computational_boundary' },
  
  // Logic Hallucinations (detected through execution analysis)
  'AssertionError': { type: 'logic', subtype: 'logic_deviation' },
  'SyntaxError': { type: 'logic', subtype: 'logic_breakdown' },
  'IndentationError': { type: 'logic', subtype: 'logic_breakdown' },
};

/**
 * Default business impact values by hallucination category
 */
export const DEFAULT_BUSINESS_IMPACT: Record<HallucinationType, BusinessImpact> = {
  mapping: {
    estimatedDevTimeWasted: 2.5,
    costMultiplier: 1.3,
    qualityImpact: 25,
    costOfHallucinations: 125.0,
  },
  naming: {
    estimatedDevTimeWasted: 1.8,
    costMultiplier: 1.2,
    qualityImpact: 20,
    costOfHallucinations: 90.0,
  },
  resource: {
    estimatedDevTimeWasted: 4.0,
    costMultiplier: 1.8,
    qualityImpact: 40,
    costOfHallucinations: 200.0,
  },
  logic: {
    estimatedDevTimeWasted: 3.2,
    costMultiplier: 1.5,
    qualityImpact: 35,
    costOfHallucinations: 160.0,
  },
};

/**
 * Default detection options
 */
export const DEFAULT_DETECTION_OPTIONS: Required<DetectionOptions> = {
  enableExecution: true,
  executionTimeoutMs: 5000,
  memoryLimitMB: 128,
  confidenceThreshold: 0.7,
  includeLowSeverity: true,
  focusCategories: ['mapping', 'naming', 'resource', 'logic'],
  generateRecommendations: true,
  codeContext: {},
};
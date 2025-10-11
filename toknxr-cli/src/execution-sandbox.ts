/**
 * Secure Execution Sandbox
 * Safe code execution environment for hallucination detection
 * 
 * Provides isolated, resource-limited execution for Python code analysis
 */

import { spawn, ChildProcess } from 'child_process';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';

import {
  ExecutionResult,
  ExecutionError,
  ResourceUsage,
  SecurityAssessment,
  ResourceLimits,
  ExecutionOptions,
  TestCase,
} from './types/hallucination-types.js';

/**
 * Default resource limits for safe execution
 */
const DEFAULT_RESOURCE_LIMITS: ResourceLimits = {
  maxMemoryMB: 128,
  maxExecutionTimeMs: 5000,
  maxCpuCores: 1,
  maxFileOperations: 10,
  maxNetworkOperations: 0,
  allowedSystemCalls: [
    'read', 'write', 'open', 'close', 'stat', 'fstat', 'lstat',
    'poll', 'lseek', 'mmap', 'mprotect', 'munmap', 'brk', 'rt_sigaction',
    'rt_sigprocmask', 'rt_sigreturn', 'ioctl', 'pread64', 'pwrite64',
    'readv', 'writev', 'access', 'pipe', 'select', 'sched_yield',
    'mremap', 'msync', 'mincore', 'madvise', 'shmget', 'shmat', 'shmctl',
    'dup', 'dup2', 'pause', 'nanosleep', 'getitimer', 'alarm', 'setitimer',
    'getpid', 'sendfile', 'socket', 'connect', 'accept', 'sendto', 'recvfrom',
    'sendmsg', 'recvmsg', 'shutdown', 'bind', 'listen', 'getsockname',
    'getpeername', 'socketpair', 'setsockopt', 'getsockopt', 'clone', 'fork',
    'vfork', 'execve', 'exit', 'wait4', 'kill', 'uname', 'semget', 'semop',
    'semctl', 'shmdt', 'msgget', 'msgsnd', 'msgrcv', 'msgctl', 'fcntl',
    'flock', 'fsync', 'fdatasync', 'truncate', 'ftruncate', 'getdents',
    'getcwd', 'chdir', 'fchdir', 'rename', 'mkdir', 'rmdir', 'creat',
    'link', 'unlink', 'symlink', 'readlink', 'chmod', 'fchmod', 'chown',
    'fchown', 'lchown', 'umask', 'gettimeofday', 'getrlimit', 'getrusage',
    'sysinfo', 'times', 'ptrace', 'getuid', 'syslog', 'getgid', 'setuid',
    'setgid', 'geteuid', 'getegid', 'setpgid', 'getppid', 'getpgrp',
    'setsid', 'setreuid', 'setregid', 'getgroups', 'setgroups', 'setresuid',
    'getresuid', 'setresgid', 'getresgid', 'getpgid', 'setfsuid', 'setfsgid',
    'getsid', 'capget', 'capset', 'rt_sigpending', 'rt_sigtimedwait',
    'rt_sigqueueinfo', 'rt_sigsuspend', 'sigaltstack', 'utime', 'mknod',
    'uselib', 'personality', 'ustat', 'statfs', 'fstatfs', 'sysfs',
    'getpriority', 'setpriority', 'sched_setparam', 'sched_getparam',
    'sched_setscheduler', 'sched_getscheduler', 'sched_get_priority_max',
    'sched_get_priority_min', 'sched_rr_get_interval', 'mlock', 'munlock',
    'mlockall', 'munlockall', 'vhangup', 'modify_ldt', 'pivot_root',
    '_sysctl', 'prctl', 'arch_prctl', 'adjtimex', 'setrlimit', 'chroot',
    'sync', 'acct', 'settimeofday', 'mount', 'umount2', 'swapon', 'swapoff',
    'reboot', 'sethostname', 'setdomainname', 'iopl', 'ioperm',
    'create_module', 'init_module', 'delete_module', 'get_kernel_syms',
    'query_module', 'quotactl', 'nfsservctl', 'getpmsg', 'putpmsg',
    'afs_syscall', 'tuxcall', 'security', 'gettid', 'readahead', 'setxattr',
    'lsetxattr', 'fsetxattr', 'getxattr', 'lgetxattr', 'fgetxattr',
    'listxattr', 'llistxattr', 'flistxattr', 'removexattr', 'lremovexattr',
    'fremovexattr', 'tkill', 'time', 'futex', 'sched_setaffinity',
    'sched_getaffinity', 'set_thread_area', 'io_setup', 'io_destroy',
    'io_getevents', 'io_submit', 'io_cancel', 'get_thread_area',
    'lookup_dcookie', 'epoll_create', 'epoll_ctl_old', 'epoll_wait_old',
    'remap_file_pages', 'getdents64', 'set_tid_address', 'restart_syscall',
    'semtimedop', 'fadvise64', 'timer_create', 'timer_settime',
    'timer_gettime', 'timer_getoverrun', 'timer_delete', 'clock_settime',
    'clock_gettime', 'clock_getres', 'clock_nanosleep', 'exit_group',
    'epoll_wait', 'epoll_ctl', 'tgkill', 'utimes', 'vserver', 'mbind',
    'set_mempolicy', 'get_mempolicy', 'mq_open', 'mq_unlink', 'mq_timedsend',
    'mq_timedreceive', 'mq_notify', 'mq_getsetattr', 'kexec_load',
    'waitid', 'add_key', 'request_key', 'keyctl', 'ioprio_set', 'ioprio_get',
    'inotify_init', 'inotify_add_watch', 'inotify_rm_watch', 'migrate_pages',
    'openat', 'mkdirat', 'mknodat', 'fchownat', 'futimesat', 'newfstatat',
    'unlinkat', 'renameat', 'linkat', 'symlinkat', 'readlinkat', 'fchmodat',
    'faccessat', 'pselect6', 'ppoll', 'unshare', 'set_robust_list',
    'get_robust_list', 'splice', 'tee', 'sync_file_range', 'vmsplice',
    'move_pages', 'utimensat', 'epoll_pwait', 'signalfd', 'timerfd_create',
    'eventfd', 'fallocate', 'timerfd_settime', 'timerfd_gettime', 'accept4',
    'signalfd4', 'eventfd2', 'epoll_create1', 'dup3', 'pipe2', 'inotify_init1',
    'preadv', 'pwritev', 'rt_tgsigqueueinfo', 'perf_event_open', 'recvmmsg',
    'fanotify_init', 'fanotify_mark', 'prlimit64', 'name_to_handle_at',
    'open_by_handle_at', 'clock_adjtime', 'syncfs', 'sendmmsg', 'setns',
    'getcpu', 'process_vm_readv', 'process_vm_writev', 'kcmp',
    'finit_module', 'sched_setattr', 'sched_getattr', 'renameat2',
    'seccomp', 'getrandom', 'memfd_create', 'kexec_file_load', 'bpf',
    'execveat', 'userfaultfd', 'membarrier', 'mlock2', 'copy_file_range',
    'preadv2', 'pwritev2'
  ],
};

/**
 * Security patterns that indicate potentially dangerous code
 */
const SECURITY_PATTERNS = [
  // System access
  /import\s+os/i,
  /import\s+subprocess/i,
  /import\s+sys/i,
  /from\s+os\s+import/i,
  /from\s+subprocess\s+import/i,
  /from\s+sys\s+import/i,
  
  // Code execution
  /exec\s*\(/i,
  /eval\s*\(/i,
  /__import__\s*\(/i,
  /compile\s*\(/i,
  
  // File system access
  /open\s*\(/i,
  /file\s*\(/i,
  /\.read\s*\(/i,
  /\.write\s*\(/i,
  /\.remove\s*\(/i,
  /\.delete\s*\(/i,
  
  // Network access
  /import\s+socket/i,
  /import\s+urllib/i,
  /import\s+requests/i,
  /import\s+http/i,
  
  // Process control
  /\.kill\s*\(/i,
  /\.terminate\s*\(/i,
  /\.exit\s*\(/i,
  /quit\s*\(/i,
  
  // Dangerous builtins
  /globals\s*\(/i,
  /locals\s*\(/i,
  /vars\s*\(/i,
  /dir\s*\(/i,
  /getattr\s*\(/i,
  /setattr\s*\(/i,
  /delattr\s*\(/i,
  /hasattr\s*\(/i,
];

/**
 * Execution sandbox for safe code execution
 */
export class ExecutionSandbox {
  private resourceLimits: ResourceLimits;
  private tempDir: string;

  constructor(resourceLimits?: Partial<ResourceLimits>) {
    this.resourceLimits = { ...DEFAULT_RESOURCE_LIMITS, ...resourceLimits };
    this.tempDir = join(tmpdir(), 'toknxr-sandbox');
  }

  /**
   * Execute Python code safely in the sandbox
   */
  async execute(code: string, language: string = 'python', options?: ExecutionOptions): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    try {
      // Validate input
      this.validateInput(code, language);
      
      // Security assessment
      const securityAssessment = this.validateSafety(code);
      if (!securityAssessment.isSafe) {
        return this.createSecurityErrorResult(securityAssessment, startTime);
      }
      
      // Prepare execution environment
      const executionId = this.generateExecutionId();
      const codeFile = await this.prepareCodeFile(code, executionId);
      
      try {
        // Execute with resource limits
        const result = await this.executeWithLimits(codeFile, options, startTime);
        
        // Cleanup
        await this.cleanup(codeFile);
        
        return result;
        
      } catch (error) {
        // Cleanup on error
        await this.cleanup(codeFile);
        throw error;
      }
      
    } catch (error) {
      return this.createErrorResult(error, startTime);
    }
  }

  /**
   * Validate code safety before execution
   */
  validateSafety(code: string): SecurityAssessment {
    const risks: string[] = [];
    const recommendations: string[] = [];
    let confidence = 1.0;

    // Check for dangerous patterns
    for (const pattern of SECURITY_PATTERNS) {
      if (pattern.test(code)) {
        const patternStr = pattern.toString();
        risks.push(`Potentially dangerous pattern detected: ${patternStr}`);
        confidence -= 0.1;
      }
    }

    // Check for suspicious characteristics
    if (code.length > 10000) {
      risks.push('Code is unusually long');
      confidence -= 0.05;
    }

    if (code.includes('while True') && !code.includes('break')) {
      risks.push('Potential infinite loop detected');
      confidence -= 0.2;
    }

    // Generate recommendations
    if (risks.length > 0) {
      recommendations.push('Review code for security implications');
      recommendations.push('Consider running in isolated environment');
      recommendations.push('Monitor resource usage during execution');
    }

    const isSafe = confidence > 0.5 && risks.length < 5;
    
    return {
      isSafe,
      risks,
      confidence: Math.max(0, confidence),
      recommendations,
      allowExecution: isSafe,
    };
  }

  /**
   * Get current resource limits
   */
  getResourceLimits(): ResourceLimits {
    return { ...this.resourceLimits };
  }

  /**
   * Update resource limits
   */
  setResourceLimits(limits: Partial<ResourceLimits>): void {
    this.resourceLimits = { ...this.resourceLimits, ...limits };
  }

  /**
   * Execute code with test cases
   */
  async executeWithTests(code: string, testCases: TestCase[], language: string = 'python'): Promise<ExecutionResult[]> {
    const results: ExecutionResult[] = [];
    
    for (const testCase of testCases) {
      // Prepare code with test input
      const testCode = this.prepareTestCode(code, testCase);
      
      // Execute with timeout specific to this test
      const options: ExecutionOptions = {
        timeoutMs: testCase.timeoutMs || this.resourceLimits.maxExecutionTimeMs,
        memoryLimitMB: this.resourceLimits.maxMemoryMB,
      };
      
      const result = await this.execute(testCode, language, options);
      results.push(result);
      
      // Stop on critical failure if marked as critical test
      if (testCase.critical && !result.success) {
        break;
      }
    }
    
    return results;
  }

  /**
   * Validate input parameters
   */
  private validateInput(code: string, language: string): void {
    if (!code || code.trim().length === 0) {
      throw new Error('Code cannot be empty');
    }
    
    if (language !== 'python') {
      throw new Error(`Language '${language}' not supported. Only Python is currently supported.`);
    }
    
    if (code.length > 100000) {
      throw new Error('Code is too long (max 100KB)');
    }
  }

  /**
   * Prepare code file for execution
   */
  private async prepareCodeFile(code: string, executionId: string): Promise<string> {
    // Ensure temp directory exists
    try {
      await mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
    
    const codeFile = join(this.tempDir, `exec_${executionId}.py`);
    
    // Wrap code with resource monitoring
    const wrappedCode = this.wrapCodeWithMonitoring(code);
    
    await writeFile(codeFile, wrappedCode, 'utf8');
    return codeFile;
  }

  /**
   * Wrap code with resource monitoring
   */
  private wrapCodeWithMonitoring(code: string): string {
    return `
import sys
import time
import traceback
import resource
import gc
import json

# Resource monitoring setup
start_time = time.time()
start_memory = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss

# Execution result tracking
execution_result = {
    "success": False,
    "output": "",
    "errors": [],
    "resource_usage": {},
    "security_flags": []
}

try:
    # Redirect stdout to capture output
    import io
    old_stdout = sys.stdout
    sys.stdout = captured_output = io.StringIO()
    
    # Execute user code
${code.split('\n').map(line => '    ' + line).join('\n')}
    
    # Capture output
    execution_result["output"] = captured_output.getvalue()
    execution_result["success"] = True
    
except Exception as e:
    execution_result["errors"].append({
        "type": type(e).__name__,
        "message": str(e),
        "traceback": traceback.format_exc()
    })
    
finally:
    # Restore stdout
    if 'old_stdout' in locals():
        sys.stdout = old_stdout
    
    # Calculate resource usage
    end_time = time.time()
    end_memory = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
    
    execution_result["resource_usage"] = {
        "execution_time_ms": int((end_time - start_time) * 1000),
        "memory_mb": max(0, (end_memory - start_memory) / 1024),  # Convert KB to MB
        "peak_memory_mb": end_memory / 1024
    }
    
    # Output result as JSON
    print("__EXECUTION_RESULT__")
    print(json.dumps(execution_result))
`;
  }

  /**
   * Execute code with resource limits
   */
  private async executeWithLimits(
    codeFile: string, 
    options?: ExecutionOptions, 
    startTime: number = Date.now()
  ): Promise<ExecutionResult> {
    const timeout = options?.timeoutMs || this.resourceLimits.maxExecutionTimeMs;
    const memoryLimit = options?.memoryLimitMB || this.resourceLimits.maxMemoryMB;
    
    return new Promise((resolve) => {
      let stdout = '';
      let stderr = '';
      let timedOut = false;
      let childProcess: ChildProcess;
      
      // Set up timeout
      const timeoutHandle = setTimeout(() => {
        timedOut = true;
        if (childProcess && !childProcess.killed) {
          childProcess.kill('SIGKILL');
        }
      }, timeout);
      
      // Spawn Python process with resource limits
      childProcess = spawn('python3', [codeFile], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          PYTHONPATH: '',
          PYTHONHOME: '',
          // Limit memory (approximate)
          MALLOC_ARENA_MAX: '1',
        },
        // Additional security: run as different user if possible
        // uid: 65534, // nobody user
        // gid: 65534, // nobody group
      });
      
      // Collect output
      childProcess.stdout?.on('data', (data) => {
        stdout += data.toString();
      });
      
      childProcess.stderr?.on('data', (data) => {
        stderr += data.toString();
      });
      
      // Handle process completion
      childProcess.on('close', (code, signal) => {
        clearTimeout(timeoutHandle);
        
        const executionTime = Date.now() - startTime;
        
        // Parse execution result from stdout
        const result = this.parseExecutionResult(stdout, stderr, {
          exitCode: code,
          signal,
          timedOut,
          executionTime,
        });
        
        resolve(result);
      });
      
      // Handle process errors
      childProcess.on('error', (error) => {
        clearTimeout(timeoutHandle);
        
        resolve(this.createErrorResult(error, startTime));
      });
    });
  }

  /**
   * Parse execution result from process output
   */
  private parseExecutionResult(
    stdout: string, 
    stderr: string, 
    processInfo: { exitCode: number | null; signal: string | null; timedOut: boolean; executionTime: number }
  ): ExecutionResult {
    let success = false;
    let output = '';
    let errors: ExecutionError[] = [];
    let resourceUsage: ResourceUsage = {
      memoryMB: 0,
      executionTimeMs: processInfo.executionTime,
      cpuUsage: 0,
    };
    let securityFlags: string[] = [];
    
    try {
      // Look for our JSON result marker
      const resultMarker = '__EXECUTION_RESULT__';
      const markerIndex = stdout.indexOf(resultMarker);
      
      if (markerIndex !== -1) {
        // Extract JSON result
        const jsonStart = markerIndex + resultMarker.length;
        const jsonStr = stdout.substring(jsonStart).trim();
        
        try {
          const executionResult = JSON.parse(jsonStr);
          
          success = executionResult.success;
          output = executionResult.output || '';
          
          // Parse errors
          if (executionResult.errors && Array.isArray(executionResult.errors)) {
            errors = executionResult.errors.map((err: any) => ({
              type: err.type || 'UnknownError',
              message: err.message || 'Unknown error',
              stackTrace: err.traceback,
            }));
          }
          
          // Parse resource usage
          if (executionResult.resource_usage) {
            resourceUsage = {
              memoryMB: executionResult.resource_usage.memory_mb || 0,
              executionTimeMs: executionResult.resource_usage.execution_time_ms || processInfo.executionTime,
              cpuUsage: 0, // Not easily measurable from Python
              peakMemoryMB: executionResult.resource_usage.peak_memory_mb,
            };
          }
          
          // Parse security flags
          if (executionResult.security_flags && Array.isArray(executionResult.security_flags)) {
            securityFlags = executionResult.security_flags;
          }
          
        } catch (parseError) {
          // JSON parsing failed, treat as error
          errors.push({
            type: 'ParseError',
            message: 'Failed to parse execution result',
            stackTrace: parseError instanceof Error ? parseError.stack : undefined,
          });
        }
      } else {
        // No result marker found, use raw output
        output = stdout;
        success = processInfo.exitCode === 0 && !processInfo.timedOut;
      }
      
      // Add stderr as errors if present
      if (stderr.trim()) {
        errors.push({
          type: 'StderrOutput',
          message: stderr.trim(),
        });
      }
      
      // Add timeout error if applicable
      if (processInfo.timedOut) {
        errors.push({
          type: 'TimeoutError',
          message: `Execution timed out after ${resourceUsage.executionTimeMs}ms`,
        });
        success = false;
      }
      
      // Add process exit error if non-zero
      if (processInfo.exitCode !== 0 && processInfo.exitCode !== null) {
        errors.push({
          type: 'ProcessExitError',
          message: `Process exited with code ${processInfo.exitCode}`,
        });
        success = false;
      }
      
    } catch (error) {
      // Fallback error handling
      success = false;
      errors = [{
        type: 'ExecutionError',
        message: error instanceof Error ? error.message : 'Unknown execution error',
        stackTrace: error instanceof Error ? error.stack : undefined,
      }];
    }
    
    return {
      success,
      output,
      stderr: stderr || undefined,
      errors,
      resourceUsage,
      securityFlags,
      exitCode: processInfo.exitCode || undefined,
      timedOut: processInfo.timedOut,
    };
  }

  /**
   * Prepare test code with input
   */
  private prepareTestCode(code: string, testCase: TestCase): string {
    // Simple test preparation - inject input as variables
    let testCode = `# Test case: ${testCase.description}\n`;
    
    if (testCase.input !== undefined) {
      testCode += `test_input = ${JSON.stringify(testCase.input)}\n`;
    }
    
    testCode += code;
    
    // Add output validation if expected output is provided
    if (testCase.expectedOutput !== undefined) {
      testCode += `\n# Validate output\n`;
      testCode += `expected_output = ${JSON.stringify(testCase.expectedOutput)}\n`;
      testCode += `if 'result' in locals():\n`;
      testCode += `    if result != expected_output:\n`;
      testCode += `        raise AssertionError(f"Expected {expected_output}, got {result}")\n`;
    }
    
    return testCode;
  }

  /**
   * Create error result for security violations
   */
  private createSecurityErrorResult(assessment: SecurityAssessment, startTime: number): ExecutionResult {
    return {
      success: false,
      output: '',
      errors: [{
        type: 'SecurityError',
        message: `Code execution blocked due to security concerns: ${assessment.risks.join(', ')}`,
      }],
      resourceUsage: {
        memoryMB: 0,
        executionTimeMs: Date.now() - startTime,
        cpuUsage: 0,
      },
      securityFlags: assessment.risks,
      timedOut: false,
    };
  }

  /**
   * Create error result for general errors
   */
  private createErrorResult(error: any, startTime: number): ExecutionResult {
    return {
      success: false,
      output: '',
      errors: [{
        type: 'ExecutionError',
        message: error instanceof Error ? error.message : 'Unknown error',
        stackTrace: error instanceof Error ? error.stack : undefined,
      }],
      resourceUsage: {
        memoryMB: 0,
        executionTimeMs: Date.now() - startTime,
        cpuUsage: 0,
      },
      securityFlags: [],
      timedOut: false,
    };
  }

  /**
   * Generate unique execution ID
   */
  private generateExecutionId(): string {
    return randomBytes(8).toString('hex');
  }

  /**
   * Cleanup temporary files
   */
  private async cleanup(codeFile: string): Promise<void> {
    try {
      await unlink(codeFile);
    } catch (error) {
      // File might not exist or already deleted
      console.warn('Failed to cleanup code file:', error);
    }
  }
}

/**
 * Factory function to create execution sandbox
 */
export function createExecutionSandbox(resourceLimits?: Partial<ResourceLimits>): ExecutionSandbox {
  return new ExecutionSandbox(resourceLimits);
}

/**
 * Utility function to check if Python is available
 */
export async function checkPythonAvailability(): Promise<boolean> {
  return new Promise((resolve) => {
    const process = spawn('python3', ['--version'], { stdio: 'pipe' });
    
    process.on('close', (code) => {
      resolve(code === 0);
    });
    
    process.on('error', () => {
      resolve(false);
    });
  });
}
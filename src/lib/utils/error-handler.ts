/**
 * Centralized error handling utilities
 */

import { logger } from './logger';
import type { AppError } from '@/types';

export class TokNxrError extends Error implements AppError {
  public readonly code?: string;
  public readonly statusCode?: number;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    code?: string,
    statusCode?: number,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'TokNxrError';
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TokNxrError);
    }
  }
}

export class ValidationError extends TokNxrError {
  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', 400, { field });
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends TokNxrError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends TokNxrError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends TokNxrError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404, { resource });
    this.name = 'NotFoundError';
  }
}

export class NetworkError extends TokNxrError {
  constructor(message: string = 'Network request failed') {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'NetworkError';
  }
}

/**
 * Global error handler for the application
 */
export class ErrorHandler {
  /**
   * Handle and log errors appropriately
   */
  static handle(error: unknown, context?: Record<string, any>): TokNxrError {
    let appError: TokNxrError;

    if (error instanceof TokNxrError) {
      appError = error;
    } else if (error instanceof Error) {
      appError = new TokNxrError(
        error.message,
        'UNKNOWN_ERROR',
        500,
        { originalError: error.name, ...context }
      );
    } else {
      appError = new TokNxrError(
        'An unknown error occurred',
        'UNKNOWN_ERROR',
        500,
        { originalError: String(error), ...context }
      );
    }

    // Log the error
    logger.error(appError.message, appError, {
      code: appError.code,
      statusCode: appError.statusCode,
      context: appError.context,
    });

    return appError;
  }

  /**
    * Handle Supabase errors and convert them to app errors
    */
   static handleSupabaseError(error: any): TokNxrError {
     const supabaseErrorMap: Record<string, { message: string; code: string; statusCode: number }> = {
       'invalid_credentials': {
         message: 'Invalid email or password',
         code: 'INVALID_CREDENTIALS',
         statusCode: 401,
       },
       'email_not_confirmed': {
         message: 'Please confirm your email address',
         code: 'EMAIL_NOT_CONFIRMED',
         statusCode: 401,
       },
       'signup_disabled': {
         message: 'New user registration is currently disabled',
         code: 'SIGNUP_DISABLED',
         statusCode: 403,
       },
       'user_already_registered': {
         message: 'An account with this email already exists',
         code: 'EMAIL_IN_USE',
         statusCode: 409,
       },
       'weak_password': {
         message: 'Password should be at least 6 characters',
         code: 'WEAK_PASSWORD',
         statusCode: 400,
       },
       'invalid_email': {
         message: 'Invalid email address',
         code: 'INVALID_EMAIL',
         statusCode: 400,
       },
       'too_many_requests': {
         message: 'Too many failed attempts. Please try again later',
         code: 'TOO_MANY_REQUESTS',
         statusCode: 429,
       },
       'PGRST116': {
         message: 'You do not have permission to perform this action',
         code: 'PERMISSION_DENIED',
         statusCode: 403,
       },
       'PGRST301': {
         message: 'The requested resource was not found',
         code: 'NOT_FOUND',
         statusCode: 404,
       },
     };

     const errorCode = error?.code || error?.message || 'unknown';
     const mappedError = supabaseErrorMap[errorCode];

     if (mappedError) {
       return new TokNxrError(
         mappedError.message,
         mappedError.code,
         mappedError.statusCode,
         { supabaseCode: errorCode }
       );
     }

     return new TokNxrError(
       error?.message || 'An error occurred with Supabase',
       'SUPABASE_ERROR',
       500,
       { supabaseCode: errorCode }
     );
   }

  /**
   * Handle API errors
   */
  static handleApiError(response: Response, context?: Record<string, any>): TokNxrError {
    const statusCode = response.status;
    let message = 'API request failed';

    switch (statusCode) {
      case 400:
        message = 'Bad request';
        break;
      case 401:
        message = 'Authentication required';
        break;
      case 403:
        message = 'Access forbidden';
        break;
      case 404:
        message = 'Resource not found';
        break;
      case 429:
        message = 'Too many requests';
        break;
      case 500:
        message = 'Internal server error';
        break;
      case 503:
        message = 'Service unavailable';
        break;
    }

    return new TokNxrError(
      message,
      'API_ERROR',
      statusCode,
      { url: response.url, ...context }
    );
  }

  /**
   * Get user-friendly error message
   */
  static getUserMessage(error: TokNxrError): string {
    // Return user-friendly messages for common errors
    const userMessages: Record<string, string> = {
      VALIDATION_ERROR: 'Please check your input and try again',
      AUTH_ERROR: 'Please sign in to continue',
      AUTHORIZATION_ERROR: 'You do not have permission to perform this action',
      NOT_FOUND: 'The requested item could not be found',
      NETWORK_ERROR: 'Please check your internet connection and try again',
      SERVICE_UNAVAILABLE: 'Service is temporarily unavailable. Please try again later',
    };

    return userMessages[error.code || ''] || 'An unexpected error occurred';
  }
}

/**
 * Utility function to safely execute async operations with error handling
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  context?: Record<string, any>
): Promise<[T | null, TokNxrError | null]> {
  try {
    const result = await operation();
    return [result, null];
  } catch (error) {
    const appError = ErrorHandler.handle(error, context);
    return [null, appError];
  }
}

/**
 * Utility function to safely execute sync operations with error handling
 */
export function safeSync<T>(
  operation: () => T,
  context?: Record<string, any>
): [T | null, TokNxrError | null] {
  try {
    const result = operation();
    return [result, null];
  } catch (error) {
    const appError = ErrorHandler.handle(error, context);
    return [null, appError];
  }
}
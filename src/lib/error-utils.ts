import { toast } from "@/components/ui/use-toast";

export enum ErrorType {
  VALIDATION = 'validation_error',
  AUTHENTICATION = 'authentication_error',
  AUTHORIZATION = 'authorization_error',
  NOT_FOUND = 'not_found',
  SERVICE_UNAVAILABLE = 'service_unavailable',
  RATE_LIMIT = 'rate_limit',
  UNKNOWN = 'unknown_error',
}

export enum ErrorCode {
  AUTHENTICATION = 'auth_error',
  AUTHORIZATION = 'permission_error',
  NOT_FOUND = 'not_found',
  VALIDATION = 'validation_error',
  SERVER_ERROR = 'server_error',
  NETWORK_ERROR = 'network_error',
  UNKNOWN = 'unknown_error'
}

export class ApplicationError extends Error {
  statusCode: number;
  errorType: ErrorType;
  
  constructor(
    message: string,
    statusCode = 500,
    errorType: ErrorType = ErrorType.UNKNOWN
  ) {
    super(message);
    this.name = 'ApplicationError';
    this.statusCode = statusCode;
    this.errorType = errorType;
  }
  
  public get isUserFacing(): boolean {
    return [
      ErrorType.VALIDATION,
      ErrorType.AUTHENTICATION,
      ErrorType.AUTHORIZATION,
      ErrorType.NOT_FOUND
    ].includes(this.errorType);
  }
  
  static fromApiError(error: unknown): ApplicationError {
    if (error instanceof ApplicationError) {
      return error;
    }
    
    if (error instanceof Error) {
      return new ApplicationError(error.message);
    }
    
    return new ApplicationError('An unknown error occurred');
  }
}

export function handleApiError(error: unknown): { message: string; status: number } {
  console.error('API error:', error);
  
  if (error instanceof ApplicationError) {
    return { 
      message: error.message,
      status: error.statusCode || 400
    };
  }
  
  return {
    message: error instanceof Error ? error.message : 'An unknown error occurred',
    status: 500
  };
}

export function showErrorToast(error: unknown) {
  const message = error instanceof Error ? error.message : 'An unknown error occurred';
  
  toast({ 
    title: "Error", 
    description: message,
    variant: "destructive"
  });
}

export function formatErrorMessage(error: unknown): string {
  const appError = ApplicationError.fromApiError(error);
  
  if (appError.isUserFacing) {
    return appError.message;
  }
  
  return 'Something went wrong. Please try again later.';
}
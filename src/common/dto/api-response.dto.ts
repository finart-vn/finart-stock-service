import { HttpStatus } from '@nestjs/common';

export class ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors: any[] | null;
  statusCode: HttpStatus;
  timestamp: string;

  constructor(
    success: boolean,
    message: string,
    data: T | null = null,
    errors: any[] | null = null,
    statusCode: number = 200,
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.errors = errors;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }

  static success<T>(
    data: T,
    message = 'Operation successful',
    statusCode = 200,
  ): ApiResponse<T> {
    return new ApiResponse<T>(true, message, data, null, statusCode);
  }

  static error<T>(
    message: string,
    errors: any[] | null = null,
    statusCode: HttpStatus = 500,
    data: T | null = null,
  ): ApiResponse<T> {
    return new ApiResponse<T>(false, message, data, errors, statusCode);
  }
}

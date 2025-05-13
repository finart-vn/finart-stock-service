import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../dto/api-response.dto';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        // If the data is already an ApiResponse, return it as is
        if (data && data.success !== undefined) {
          return data;
        }
        
        // Otherwise, wrap it in a success response
        return ApiResponse.success(data);
      }),
    );
  }
} 
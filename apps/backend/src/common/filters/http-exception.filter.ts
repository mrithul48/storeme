// apps/api/src/common/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '@launchcommerce/api-contracts';

@Catch()
export class CentralizedExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(CentralizedExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'object' && res !== null && 'message' in res
        ? (Array.isArray((res as any).message) ? (res as any).message.join(', ') : (res as any).message)
        : exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`Unhandled Exception: ${exception.message}`, exception.stack);
    } else {
      this.logger.error(`Unknown Exception: ${JSON.stringify(exception)}`);
    }

    const payload: ApiResponse<null> = {
      success: false,
      error: message,
      statusCode: status,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(payload);
  }
}


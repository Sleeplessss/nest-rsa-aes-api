import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Response } from 'express';
import { AppException, ErrorCode, fail } from './api-response';

/** Converts every error into { successful: false, error_code, data: null }. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();
    let status = 500;
    let code = ErrorCode.INTERNAL_ERROR;

    if (exception instanceof AppException) {
      status = exception.status;
      code = exception.errorCode;
    } else if (exception instanceof BadRequestException) {
      status = 400;
      code = ErrorCode.VALIDATION_ERROR; // class-validator errors + malformed JSON
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      code = status === 404 ? ErrorCode.NOT_FOUND : ErrorCode.INTERNAL_ERROR;
    } else {
      this.logger.error(exception);
    }
    res.status(status).json(fail(code));
  }
}

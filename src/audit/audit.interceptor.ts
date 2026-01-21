import { CallHandler, ExecutionContext, HttpException, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AuditInterceptor');

  constructor(private readonly auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const request = http.getRequest();
    const response = http.getResponse();
    const { method, url, user, body, ip } = request;
    const userAgent = request.get('user-agent');

    const hasUserId = Boolean(user?.userId);

    return next.handle().pipe(
      tap({
        next: (data) => this.logAction(user, method, url, request, response, data, ip, userAgent),
        error: (error) => {
          const status = error instanceof HttpException ? error.getStatus() : 500;
          this.logAction(user, method, url, request, { statusCode: status }, error.response || error.message, ip, userAgent);
        },
      }),
    );
  }

  private logAction(user: any, method: string, url: string, request: any, response: any, data: any, ip: string, userAgent: string) {
    if (!user?.userId) return;

    const sanitizedRequest = {
      method,
      path: url,
      params: request.params ?? {},
      query: request.query ?? {},
      body: (() => {
        const body = request.body;
        if (!body) return null;
        const copy = { ...body };
        delete copy.password;
        delete copy.token;
        return Object.keys(copy).length ? copy : null;
      })(),
    };

    const responsePreview =
      method === 'GET' && response?.statusCode < 400
        ? { statusCode: response?.statusCode ?? 0 }
        : { statusCode: response?.statusCode ?? 0, body: data };

    this.auditLogService
      .log(
        user.userId,
        `${method} ${url}`,
        { request: sanitizedRequest, response: responsePreview },
        { ip, userAgent },
      )
      .catch((err) => this.logger.error('Failed to save audit log', err));
  }
}

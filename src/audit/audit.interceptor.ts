import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
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
        next: (data) => {
          if (!hasUserId) {
            return;
          }

          const sanitizedRequest = {
            method,
            path: url,
            params: request.params ?? {},
            query: request.query ?? {},
            body: (() => {
              if (!body) return null;
              const copy = { ...body };
              delete copy.password;
              delete copy.token;
              return Object.keys(copy).length ? copy : null;
            })(),
          };

          const responsePreview =
            method === 'GET'
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
        },
      }),
    );
  }
}

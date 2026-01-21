import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AuditInterceptor');

  constructor(private readonly auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, body, ip } = request;
    const userAgent = request.get('user-agent');

    // Só logamos mutações (ignora GET)
    const isMutation = ['POST', 'PATCH', 'DELETE', 'PUT'].includes(method);

    return next.handle().pipe(
      tap({
        next: (data) => {
          if (isMutation && user?.userId) {
            // Sanitização básica: remove campos sensíveis do log
            const sanitizedBody = { ...body };
            delete sanitizedBody.password;
            delete sanitizedBody.token;

            this.auditLogService.log(
              user.userId,
              `${method} ${url}`,
              { request: sanitizedBody, response: data },
              { ip, userAgent }
            ).catch(err => this.logger.error('Failed to save audit log', err));
          }
        },
      }),
    );
  }
}
import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private initialized = false;

  private getFirebaseConfig() {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!projectId || !clientEmail || !privateKey) {
      this.logger.warn(
        '[NotificationService] Firebase credentials missing. Pushes will be simulated.',
      );
      return null;
    }
    return {
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    };
  }

  private ensureInitialized() {
    if (admin.apps.length) {
      this.initialized = true;
      return;
    }
    if (this.initialized) {
      return;
    }
    const credentials = this.getFirebaseConfig();
    if (!credentials) {
      return;
    }
    try {
      admin.initializeApp({
        credential: admin.credential.cert(credentials),
      });
      this.initialized = true;
      this.logger.log('[NotificationService] Firebase Admin initialized.');
    } catch (error: unknown) {
      this.logger.warn(
        `[NotificationService] Failed to initialize Firebase Admin: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      );
    }
  }

  async sendPush(targetToken: string, title: string, body: string) {
    if (!targetToken) {
      this.logger.warn('[NotificationService] Missing targetToken, skipping push.');
      return;
    }
    this.ensureInitialized();
    if (!admin.apps.length) {
      this.logger.warn('[NotificationService] Firebase Admin not ready, push skipped.');
      return;
    }

    try {
      await admin.messaging().send({
        token: targetToken,
        notification: {
          title,
          body,
        },
        android: {
          notification: {
            channelId: 'high-priority',
            priority: 'high',
            sound: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
            },
          },
        },
      });
      this.logger.log(`[NotificationService] Push sent to ${targetToken}`);
    } catch (error: unknown) {
      this.logger.error(
        `[NotificationService] Push error for ${targetToken}: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}

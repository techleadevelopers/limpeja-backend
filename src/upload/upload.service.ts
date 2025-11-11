import { Injectable, HttpException, Logger } from '@nestjs/common';
import { UTApi } from 'uploadthing/server';
import { Blob } from 'buffer';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly apiKey = (process.env.UPLOADTHING_TOKEN || process.env.UPLOADTHING_SECRET) as string;
  private readonly utapi = new UTApi({ token: (process.env.UPLOADTHING_TOKEN || process.env.UPLOADTHING_SECRET) as string });

  private ensureConfig() {
    if (!this.apiKey) {
      throw new HttpException('UploadThing não configurado (token ausente)', 500);
    }
  }

  async uploadFile(buffer: Buffer, filename: string, contentType: string) {
    this.ensureConfig();
    try {
      const blob = new Blob([buffer], { type: contentType || 'application/octet-stream' });
      this.logger.log(`[UploadThing] Enviando upload via UTApi (filename=${filename})`);
      const result: any = await this.utapi.uploadFiles(blob, { name: filename } as any);
      if (result?.error) {
        throw new Error(result.error?.message || 'UploadThing error');
      }
      const data: any = result?.data;
      const file: any = Array.isArray(data) ? data[0] : data;
      const url: string | undefined = file?.url || (file?.key ? `https://utfs.io/f/${file.key}` : undefined);
      if (!url) throw new Error('UploadThing não retornou URL pública');
      return { ok: true, url };
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('[UploadThing Error]', { message: error?.message || String(error) });
      throw new HttpException('Falha ao fazer upload no UploadThing', 500);
    }
  }
}

// src/verification/document-processing.service.ts
import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { File } from 'multer';
import { UploadService } from '../upload/upload.service';
import { CloudinaryUploadService } from '../upload/cloudinary-upload.service';
import { PremiumAvatarPipelineService } from './premium-avatar-pipeline.service';

export interface DocumentProcessingOptions {
  premiumAvatar?: boolean;
}

@Injectable()
export class DocumentProcessingService {
  private readonly logger = new Logger(DocumentProcessingService.name);

  constructor(
    private readonly uploadService: UploadService,
    private readonly premiumAvatarPipeline: PremiumAvatarPipelineService,
    private readonly cloudinaryUploadService: CloudinaryUploadService,
  ) {}

  async uploadImage(
    file: File,
    destinationPath: string,
    _slug?: string,
    options?: DocumentProcessingOptions,
  ): Promise<string> {
    try {
      const filename =
        destinationPath?.split('/')?.pop() || file.originalname || 'upload.jpg';
      let buffer = file.buffer;
      let mimeType = file.mimetype;

      if (options?.premiumAvatar) {
        try {
          const processed = await this.premiumAvatarPipeline.process(buffer, mimeType);
          buffer = processed.buffer;
          mimeType = processed.mimeType;
        } catch (processError) {
          this.logger.warn(
            'Pipeline Premium Showcase falhou. Usando imagem original.',
            processError,
          );
        }
      }

      if (this.cloudinaryUploadService.isConfigured()) {
        const folder =
          destinationPath
            ?.split('/')
            .slice(0, -1)
            .join('/') || undefined;
        const url = await this.cloudinaryUploadService.uploadBuffer(
          buffer,
          filename,
          folder,
        );
        return url;
      }

      const result = await this.uploadService.uploadFile(buffer, filename, mimeType);
      if (!result?.url) throw new Error('UploadThing não retornou URL pública');
      this.logger.log(`Upload via UploadThing concluído: ${result.url}`);
      return result.url;
    } catch (error: any) {
      this.logger.error(
        `Falha no upload via UploadThing: ${error?.message || error}`,
      );
      throw new InternalServerErrorException('Falha ao enviar arquivo.');
    }
  }

  async processDocumentOcr(_file: File): Promise<any> {
    // Vision removido: retorna mock simples
    this.logger.warn('OCR mockado: Google Vision removido.');
    return { extractedText: 'MOCK: Document text', confidence: 0.95 };
  }

  async compareFaces(
    _selfieFile: File,
    _documentImageUrl: string,
  ): Promise<boolean> {
    this.logger.warn('Comparação facial mockada: Google Vision removido.');
    return true;
  }

  async performLivenessCheck(_selfieFile: File): Promise<boolean> {
    this.logger.warn('Liveness mockado: Google Vision removido.');
    await new Promise((r) => setTimeout(r, 300));
    return true;
  }
}

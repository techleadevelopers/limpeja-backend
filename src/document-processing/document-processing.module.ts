// src/document-processing/document-processing.module.ts
import { Module } from '@nestjs/common';
import { UploadModule } from '../upload/upload.module';
import { DocumentProcessingService } from './document-processing.service';
import { PremiumAvatarPipelineService } from './premium-avatar-pipeline.service';

@Module({
  imports: [UploadModule],
  providers: [DocumentProcessingService, PremiumAvatarPipelineService],
  exports: [DocumentProcessingService],
})
export class DocumentProcessingModule {}

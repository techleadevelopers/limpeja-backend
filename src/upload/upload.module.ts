import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { CloudinaryUploadService } from './cloudinary-upload.service';
import { UploadController } from './upload.controller';

@Module({
  providers: [UploadService, CloudinaryUploadService],
  controllers: [UploadController],
  exports: [UploadService, CloudinaryUploadService],
})
export class UploadModule {}

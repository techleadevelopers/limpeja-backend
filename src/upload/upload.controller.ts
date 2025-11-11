import { Controller, Post, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import multer from 'multer';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async uploadAvatar(@UploadedFile() file: any) {
    if (!file) return { ok: false, message: 'Arquivo ausente' };
    return this.uploadService.uploadFile(file.buffer, file.originalname, file.mimetype);
  }

  @Post('document')
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async uploadDocument(@UploadedFile() file: any, @Query('type') _type?: string) {
    if (!file) return { ok: false, message: 'Arquivo ausente' };
    return this.uploadService.uploadFile(file.buffer, file.originalname, file.mimetype);
  }

  @Post('selfie')
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async uploadSelfie(@UploadedFile() file: any) {
    if (!file) return { ok: false, message: 'Arquivo ausente' };
    return this.uploadService.uploadFile(file.buffer, file.originalname, file.mimetype);
  }
}

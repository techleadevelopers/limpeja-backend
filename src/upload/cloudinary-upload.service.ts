import { HttpException, Injectable, Logger } from '@nestjs/common';
import { UploadApiOptions, v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryUploadService {
  private readonly logger = new Logger(CloudinaryUploadService.name);
  private readonly isReady: boolean;

  constructor() {
    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudinaryUrl || (cloudName && apiKey && apiSecret)) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        url: cloudinaryUrl,
      });
      this.isReady = true;
    } else {
      this.isReady = false;
    }
  }

  isConfigured(): boolean {
    return this.isReady;
  }

  async uploadBuffer(
    buffer: Buffer,
    filename: string,
    folder?: string,
    options?: UploadApiOptions,
  ): Promise<string> {
    if (!this.isReady) {
      throw new HttpException('Cloudinary não configurado', 500);
    }

    const publicId = filename.replace(/\.[^.]+$/, '');
    const uploadOptions: UploadApiOptions = {
      public_id: publicId,
      folder,
      resource_type: 'image',
      use_filename: true,
      unique_filename: false,
      overwrite: true,
      ...options,
    };

    return new Promise<string>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          const url = result?.secure_url || result?.url;
          if (!url) {
            reject(new Error('Cloudinary não retornou uma URL'));
            return;
          }
          this.logger.log(`[Cloudinary] Upload concluído: ${url}`);
          resolve(url);
        },
      );

      stream.end(buffer);
    });
  }
}

import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';

export interface PremiumAvatarPipelineResult {
  buffer: Buffer;
  mimeType: string;
}

@Injectable()
export class PremiumAvatarPipelineService {
  private readonly logger = new Logger(PremiumAvatarPipelineService.name);
  private readonly removeBgKey = process.env.REMOVE_BG_API_KEY;
  private readonly cloudinaryConfigured =
    !!process.env.CLOUDINARY_CLOUD_NAME &&
    !!process.env.CLOUDINARY_API_KEY &&
    !!process.env.CLOUDINARY_API_SECRET;

  constructor() {
    if (this.cloudinaryConfigured) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
        api_key: process.env.CLOUDINARY_API_KEY!,
        api_secret: process.env.CLOUDINARY_API_SECRET!,
      });
    }
  }

  async process(buffer: Buffer, mimetype: string): Promise<PremiumAvatarPipelineResult> {
    let workingBuffer = buffer;
    let workingMime = mimetype;

    if (this.removeBgKey) {
      try {
        workingBuffer = await this.removeBackground(workingBuffer, mimetype);
        workingMime = 'image/png';
      } catch (error) {
        this.logger.warn('Remove.bg background removal falhou, mantendo imagem original.', error);
      }
    }

    if (this.cloudinaryConfigured) {
      try {
        const result = await this.applyCloudinaryTransform(workingBuffer);
        workingBuffer = result.buffer;
        workingMime = result.mimeType;
      } catch (error) {
        this.logger.warn('Cloudinary Premium Showcase falhou, mantendo imagem atual.', error);
      }
    }

    return { buffer: workingBuffer, mimeType: workingMime };
  }

  private async removeBackground(buffer: Buffer, mimetype: string): Promise<Buffer> {
    if (!this.removeBgKey) return buffer;
    const form = new FormData();
    form.append('image_file', buffer, {
      filename: 'avatar.png',
      contentType: mimetype,
    });
    form.append('size', 'auto');

    const response = await axios.post('https://api.remove.bg/v1.0/removebg', form, {
      headers: {
        ...form.getHeaders(),
        'X-Api-Key': this.removeBgKey,
      },
      responseType: 'arraybuffer',
      timeout: 120000,
    });

    return Buffer.from(response.data);
  }

  private async applyCloudinaryTransform(buffer: Buffer): Promise<PremiumAvatarPipelineResult> {
    if (!this.cloudinaryConfigured) {
      return { buffer, mimeType: 'image/jpeg' };
    }

    const uploadResponse = (await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'premium-showcase',
          resource_type: 'image',
          transformation: [
            {
              width: 720,
              height: 720,
              crop: 'thumb',
              gravity: 'face',
              background: '#E4E8EF',
            },
            {
              effect: 'vibrance:30',
            },
            {
              effect: 'brightness:8',
            },
            {
              effect: 'colorize:15',
            },
          ],
          quality: 'auto:good',
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Cloudinary não retornou resultado.'));
          resolve(result);
        },
      );
      stream.end(buffer);
    })) as UploadApiResponse;

    const downloadUrl = uploadResponse.secure_url || uploadResponse.url;
    if (!downloadUrl) {
      throw new Error('Cloudinary não retornou URL pública para o avatar premium.');
    }

    const downloadResult = await axios.get(downloadUrl, {
      responseType: 'arraybuffer',
      timeout: 60000,
    });

    const mimeType = uploadResponse.format ? `image/${uploadResponse.format}` : 'image/jpeg';
    return { buffer: Buffer.from(downloadResult.data), mimeType };
  }
}

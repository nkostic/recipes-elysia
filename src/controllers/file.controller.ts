import { Context } from 'elysia';
import { ApiResponse, ApiError, FileUploadInfo } from '../types';
import path from 'path';
import fs from 'fs/promises';

export class FileController {
  private uploadDir = './files';

  async uploadHeroPhoto(context: Context): Promise<ApiResponse<FileUploadInfo>> {
    try {
      const { id: recipeId } = context.params as { id: string };
      const files = (context as any).files; // File upload handling would need proper typing

      if (!files || !files.photo) {
        throw new ApiError(400, 'No photo file provided');
      }

      const file = files.photo;

      // Validate file
      this.validateImageFile(file);

      // Ensure directory exists
      const recipeDir = path.join(this.uploadDir, recipeId);
      await fs.mkdir(recipeDir, { recursive: true });

      // Save file
      const filename = 'hero.jpg'; // Always name hero photos consistently
      const filePath = path.join(recipeDir, filename);

      await fs.writeFile(filePath, await file.arrayBuffer());

      const fileInfo: FileUploadInfo = {
        recipe_id: recipeId,
        type: 'hero',
        filename,
        path: filePath,
      };

      return {
        success: true,
        data: fileInfo,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('Error uploading hero photo:', error);
      throw new ApiError(500, 'Failed to upload hero photo');
    }
  }

  async uploadStepPhoto(context: Context): Promise<ApiResponse<FileUploadInfo>> {
    try {
      const { id: recipeId, stepNumber } = context.params as {
        id: string;
        stepNumber: string;
      };
      const files = (context as any).files;

      if (!files || !files.photo) {
        throw new ApiError(400, 'No photo file provided');
      }

      const file = files.photo;

      // Validate file
      this.validateImageFile(file);

      // Ensure directory exists
      const recipeDir = path.join(this.uploadDir, recipeId);
      await fs.mkdir(recipeDir, { recursive: true });

      // Save file
      const filename = `step-${stepNumber}.jpg`;
      const filePath = path.join(recipeDir, filename);

      await fs.writeFile(filePath, await file.arrayBuffer());

      const fileInfo: FileUploadInfo = {
        recipe_id: recipeId,
        type: 'step',
        step_number: parseInt(stepNumber),
        filename,
        path: filePath,
      };

      return {
        success: true,
        data: fileInfo,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('Error uploading step photo:', error);
      throw new ApiError(500, 'Failed to upload step photo');
    }
  }

  async serveFile(context: Context): Promise<void> {
    try {
      const { recipeId, filename } = context.params as {
        recipeId: string;
        filename: string;
      };

      const filePath = path.join(this.uploadDir, recipeId, filename);

      // Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        throw new ApiError(404, 'File not found');
      }

      // Set appropriate headers
      const ext = path.extname(filename).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
      };

      const mimeType = mimeTypes[ext] || 'application/octet-stream';
      context.set.headers['Content-Type'] = mimeType;
      context.set.headers['Cache-Control'] = 'public, max-age=31536000'; // 1 year cache

      // Read and return file
      const fileBuffer = await fs.readFile(filePath);
      return fileBuffer as any;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('Error serving file:', error);
      throw new ApiError(500, 'Failed to serve file');
    }
  }

  private validateImageFile(file: any): void {
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    if (!validImageTypes.includes(file.type)) {
      throw new ApiError(400, 'Invalid file type. Only JPEG, PNG, and WebP are allowed.');
    }

    if (file.size > maxFileSize) {
      throw new ApiError(400, 'File too large. Maximum size is 5MB.');
    }
  }
}

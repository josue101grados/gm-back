import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';
import { unlink } from 'fs';

@Injectable()
export class UploadsService {
  storage: Storage;
  bucket: string;
  constructor(private configService: ConfigService) {
    this.storage = new Storage();
    this.bucket = this.configService.get('GOOGLE_STORAGE_BUCKET');
  }
  async uploadToGoogle(
    filePath: string,
    fileDestination: string,
  ): Promise<string> {
    const [result] = await this.storage.bucket(this.bucket).upload(filePath, {
      destination: fileDestination,
    });
    return result.name;
  }
  async uploadToGoogleAndMakePublic(
    filePath: string,
    fileDestination: string,
  ): Promise<string> {
    const [resultFile] = await this.storage
      .bucket(this.bucket)
      .upload(filePath, {
        destination: fileDestination,
      });
    await resultFile.makePublic();
    return `https://storage.googleapis.com/${this.bucket}/${resultFile.name}`;
  }

  getFileNameFromUrl(url: string, additionalPath = ''): string {
    return url.replace(
      `https://storage.googleapis.com/${this.bucket}${additionalPath}`,
      '',
    );
  }

  async deleteFileByPublicUrl(url: string) {
    if (url.indexOf(`https://storage.googleapis.com/${this.bucket}/`) < 0) {
      // Some old files do not exist in google storage so avoid deleting them
      return;
    }
    const fileName = url.replace(
      `https://storage.googleapis.com/${this.bucket}/`,
      '',
    );
    await this.storage
      .bucket(this.bucket)
      .file(fileName)
      .delete();
  }
  async downloadFileFromGoogle(fileName: string, destination: string) {
    await this.storage
      .bucket(this.bucket)
      .file(fileName)
      .download({ destination });
  }

  /**
   * Uploads to GCP Storage Bucket
   * @param filePath File Path to Upload
   * @param fileDestination File Destination
   */
  async uploadAndGetPublicUrl(
    filePath: string,
    fileDestination: string,
  ): Promise<{ fileName: string; publicURL: string }> {
    // try {
    const [result] = await this.storage.bucket(this.bucket).upload(filePath, {
      destination: fileDestination,
    });
    const [url] = await this.storage
      .bucket(this.bucket)
      .file(result.name)
      .getSignedUrl({
        action: 'read',
        expires: Date.now() + 1000 * 60 * 60 * 24 * 120,
      });
    return { fileName: result.name, publicURL: url };
    // } catch (e) {
    //   return { fileName: '', publicURL: '' };
    // }
  }

  /**
   * Deletes Local File
   * @param filePath File Path to delete
   */
  async deleteFile(filePath) {
    await new Promise(resolve => {
      unlink(filePath, error => {
        if (error) {
          // tslint:disable-next-line:no-console
          console.error(
            `The file ${filePath} was not deleted. Memory probles might arrise.`,
          );
        }
        resolve();
      });
    });
  }
}

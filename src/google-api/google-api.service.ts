import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
const CLIENT_ID =
  '821968596288-8pkg48ecp5t7ka8lh46ll99d7pfbsqqg.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URL = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN =
  '1//04nvv_aJtd8lnCgYIARAAGAQSNwF-L9IrSp-xcx3YXXG3pNsFPtWLSpArq366jrThTGdoroA16DrNsmzxdSx0jWgx9l413pGN0u4';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL,
);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
const drive = google.drive({ version: 'v3', auth: oauth2Client });
@Injectable()
export class GoogleApiService {
  folderId = '1JjH11XzHZBFESA5yrd0kCSd6ZH1xg2gd';

  async uploadFile(file: Express.Multer.File) {
    console.log(file);
    try {
      const response = await drive.files.create({
        requestBody: {
          name: uuidv4() + file.originalname,
          mimeType: file.mimetype,
          parents: [this.folderId],
        },
        media: {
          mimeType: file.mimetype,
          body: new Readable({
            read() {
              this.push(file.buffer);
              this.push(null);
            },
          }),
        },
      });
      return response.data;
    } catch (error) {
      console.log(error.message);
      return null;
    }
  }

  async getFileById(fileId: string) {
    try {
      const result = await drive.files.get({
        fileId: fileId,
        fields: 'id, name, mimeType',
      });
      return result.data;
    } catch (error) {
      return null;
    }
  }

  async getFileByName(fileName: string) {
    try {
      const result = await drive.files.list({
        q: `'${this.folderId}' in parents and name ='${fileName}'`,
        fields: 'files(id, name, mimeType)',
      });
      return result.data.files[0];
    } catch (error) {
      return null;
    }
  }

  async deleteFileById(fileId: string) {
    try {
      await drive.files.delete({
        fileId,
      });
    } catch (error) {}
  }

  async deleteMultipleFiles(fileIds: string[]) {
    try {
      await drive.files.delete({ fileId: fileIds.join(',') });
    } catch (error) {}
  }
}

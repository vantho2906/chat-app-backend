import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import ChatAppConfig from '../etc/config';

const oauth2Client = new google.auth.OAuth2(
  ChatAppConfig.GOOGLE_CLIENT_ID,
  ChatAppConfig.GOOGLE_CLIENT_SECRET,
  ChatAppConfig.REDIRECT_URL,
);
oauth2Client.setCredentials({ refresh_token: ChatAppConfig.REFRESH_TOKEN });
const drive = google.drive({ version: 'v3', auth: oauth2Client });
@Injectable()
export class GoogleApiService {
  async uploadFile(file: Express.Multer.File) {
    console.log(file);
    try {
      const response = await drive.files.create({
        requestBody: {
          name: uuidv4() + file.originalname,
          mimeType: file.mimetype,
          parents: [ChatAppConfig.FOLDER_ID],
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
        q: `'${ChatAppConfig.FOLDER_ID}' in parents and name ='${fileName}'`,
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

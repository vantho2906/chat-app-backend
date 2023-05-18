import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Repository } from 'typeorm';
import { GoogleApiService } from 'google-api/google-api.service';
import { NetworkFile } from 'network-files/entities/networkFile.entity';
import { getGoogleDriveUrl } from 'etc/google-drive-url';
import { UpdateAccountInfoDto } from './dtos/update-account-info-dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,

    @InjectRepository(NetworkFile)
    private readonly networkFileRepository: Repository<NetworkFile>,

    private readonly googleApiService: GoogleApiService,
  ) {}

  async getByEmail(email: string) {
    return await this.accountRepository.findOne({
      where: { email, isActive: true },
    });
  }

  async getById(id: string) {
    return await this.accountRepository.findOne({
      relations: {
        avatar: true,
      },
      where: { id, isActive: true },
    });
  }

  async updateAvatar(account: Account, file: Express.Multer.File) {
    if (account.avatar.fileIdOnDrive) {
      this.googleApiService.deleteFileById(account.avatar.fileIdOnDrive);
    }
    const fileUpload = await this.googleApiService.uploadFile(file);
    if (!fileUpload) return [null, 'Error while uploading file'];
    account.avatar.filename = fileUpload.name;
    account.avatar.mimeType = fileUpload.mimeType;
    account.avatar.fileIdOnDrive = fileUpload.id;
    account.avatar.url = getGoogleDriveUrl(fileUpload.id);
    await this.accountRepository.save(account);
    return [account.avatar, null];
  }

  async updatePersonalInfo(self: Account, updateInfo: UpdateAccountInfoDto) {
    const { fname, lname, gender, dob } = updateInfo;
    if (fname && fname.trim() != self.fname) self.fname = fname.trim();
    if (lname && lname.trim() != self.lname) self.lname = lname.trim();
    if (gender && gender != self.gender) self.gender = gender;
    if (dob && dob != self.dob) self.dob = dob;
    const result = await this.accountRepository.save(self);
    return [result, null];
  }
}

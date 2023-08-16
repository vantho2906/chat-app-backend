import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { In, Repository } from 'typeorm';
import { GoogleApiService } from 'google-api/google-api.service';
import { NetworkFile } from 'network-files/entities/networkFile.entity';
import { getGoogleDriveFileID, getGoogleDriveUrl } from 'etc/google-drive-url';
import { UpdateAccountInfoDto } from './dtos/update-account-info-dto';
import { Friend } from 'friends/entities/friend.entity';
import { FriendRequestsService } from 'friend-requests/friend-requests.service';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,

    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,

    @InjectRepository(NetworkFile)
    private readonly networkFileRepository: Repository<NetworkFile>,

    private readonly googleApiService: GoogleApiService,

    @Inject(forwardRef(() => FriendRequestsService))
    private readonly friendRequestService: FriendRequestsService,
  ) {}

  async getByEmail(email: string) {
    return await this.accountRepository.findOne({
      where: { email: email.trim().toLowerCase(), isActive: true },
    });
  }

  async getById(id: string) {
    return await this.accountRepository.findOne({
      where: { id, isActive: true },
    });
  }

  async getListOfAccounts(idList: string[]) {
    const accounts = await this.accountRepository.find({
      where: { id: In(idList) },
      select: {
        id: true,
        fname: true,
        lname: true,
        isActive: true,
        avatarUrl: true,
      },
    });
    return accounts;
  }

  async getAll() {
    return await this.accountRepository.find();
  }

  async updateAvatar(account: Account, file: Express.Multer.File) {
    if (account.avatarUrl && getGoogleDriveFileID(account.avatarUrl)) {
      this.googleApiService.deleteFileById(
        getGoogleDriveFileID(account.avatarUrl),
      );
    }
    const fileUpload = await this.googleApiService.uploadFile(file);
    if (!fileUpload) return [null, 'Error while uploading file'];
    account.avatarUrl = getGoogleDriveUrl(fileUpload.id);
    await this.accountRepository.save(account);
    return [account, null];
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

  async searchByNameOrEmailAndReturnFriendStatus(
    selfId: string,
    keyword: string,
  ) {
    const emailReg = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (keyword.trim().match(emailReg)) {
      const account = await this.accountRepository.findOne({
        where: {
          email: keyword.trim().toLowerCase(),
        },
      });
      if (account) {
        const isFriend = await this.friendRequestService.isFriend(
          selfId,
          account.id,
        );
        return [{ ...account, isFriend }, null];
      }
      return [account, null];
    }
    keyword = '%' + keyword + '%';
    const accounts = await this.accountRepository
      .createQueryBuilder('account')
      .where(`LOWER(CONCAT(account.lname, ' ', account.fname)) LIKE :keyword`, {
        keyword: keyword,
      })
      .andWhere('account.isActive = :true', { true: true })
      .andWhere('account.id != :selfId', { selfId })
      .getMany();
    if (!accounts.length) return [accounts, null];
    const accountIDList = accounts.map((account) => {
      return account.id;
    });
    const friendList = await this.friendRepository.find({
      where: [
        {
          account1: { id: selfId },
          account2: { id: In(accountIDList) },
        },
        {
          account2: { id: selfId },
          account1: { id: In(accountIDList) },
        },
      ],
      relations: {
        account1: true,
        account2: true,
      },
    });
    const friendMap = new Map<string, boolean>();
    friendList.forEach((friend) => {
      friendMap[
        friend.account1.id != selfId ? friend.account1.id : friend.account2.id
      ] = true;
    });
    const accountsWithFriendStatus = accounts.map((account) => {
      return { ...account, isFriend: friendMap[account.id] || false };
    });
    return [accountsWithFriendStatus, null];
  }

  async searchByNameOrEmail(keyword: string) {
    const emailReg = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (keyword.trim().match(emailReg)) {
      const account = await this.accountRepository.findOne({
        where: {
          email: keyword.trim().toLowerCase(),
        },
      });
      return [account, null];
    }
    keyword = '%' + keyword + '%';
    const accounts = await this.accountRepository
      .createQueryBuilder('account')
      .where(`LOWER(CONCAT(account.lname, ' ', account.fname)) LIKE :keyword`, {
        keyword: keyword,
      })
      .andWhere('account.isActive = :true', { true: true })
      .getMany();

    return [accounts, null];
  }

  async updateTimeOffline(accountId) {
    const account = await this.getById(accountId);
    if (!account) return [null, 'Account not found'];
    account.offlineAt = new Date();
    this.accountRepository.save(account);
    return [account, null];
  }
}

export enum SignInWay {
  GOOGLE = 'Google',
  NORMAL = 'Normal',
}

export enum RoleEnum {
  ADMIN = 'Admin',
  USER = 'User',
}

export enum GenderEnum {
  MALE = 'Male',
  FEMALE = 'Female',
}

export enum ChatRoomTypeEnum {
  OWN = 'Own',
  ONE_ON_ONE = 'One On One',
  MULTIPLE_USERS = 'Multiple Users',
}

export enum MemberRoleEnum {
  USER = 'User',
  VICE = 'Vice',
  ADMIN = 'Admin',
}

export enum MessageTypeEnum {
  NORMAL = 'Normal',
  NOTIFICATION = 'Notification',
}

export enum FriendStatus {
  FRIEND = 'Friend',
  NOT_FRIEND = 'Not friend',
  SENT_FRIENT_REQUEST = 'Send friend request',
  RECEIVED_FRIEND_REQUEST = 'Received friend request',
}

export enum FileTypeAllowEnum {
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  JPG = 'image/jpg',
  SVG = 'image/svg',
  GIF = 'image/gif',
  MP4 = 'video/mp4',
  WEBMG = 'video/webmg',
  QUICKTIME = 'video/quicktime',
  X_MSVIDEO = 'video/x-msvideo',
  X_MATROSKA = 'video/x-matroska',
  X_FLX = 'video/x-flv',
  PDF = 'application/pdf',
  ZIP = 'application/zip',
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  DOCX2 = 'application/msword',
}

export enum FileTypeMediaEnum {
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  JPG = 'image/jpg',
  SVG = 'image/svg',
  GIF = 'image/gif',
  MP4 = 'video/mp4',
  WEBMG = 'video/webmg',
  QUICKTIME = 'video/quicktime',
  X_MSVIDEO = 'video/x-msvideo',
  X_MATROSKA = 'video/x-matroska',
  X_FLX = 'video/x-flv',
}

export enum FileTypeOtherEnum {
  PDF = 'application/pdf',
  ZIP = 'application/zip',
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  DOCX2 = 'application/msword',
}

export enum FileCategoryEnum {
  MEDIA = 'Media',
  OTHER = 'Other',
}

export enum NotificationTypeEnum {
  APPROVAL = 'Approval',
  MESSAGE = 'Message',
  FRIEND_REQUEST = 'Friend Request',
}

export enum HandleApprovalEnum {
  ACCEPT = 'Accept',
  DECLINE = 'Decline',
}

export enum TogglePinMessageEnum {
  PIN = 'Pin',
  UNPIN = 'Unpin',
}

import { MemberRoleEnum } from './enums';

export function convertMemberRoomRole(role: MemberRoleEnum) {
  if (role == MemberRoleEnum.ADMIN) return 2;
  if (role == MemberRoleEnum.VICE) return 1;
  if (role == MemberRoleEnum.USER) return 0;
}

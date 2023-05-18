import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from '../etc/enum';

const Roles = (...roles: RoleEnum[]) => SetMetadata('roles', roles);

export default Roles;

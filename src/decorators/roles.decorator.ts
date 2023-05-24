import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from '../etc/enums';

const Roles = (...roles: RoleEnum[]) => SetMetadata('roles', roles);

export default Roles;

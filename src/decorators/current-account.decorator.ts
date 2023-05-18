import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const CurrentAccount = createParamDecorator(
  (data: any, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);

export default CurrentAccount;

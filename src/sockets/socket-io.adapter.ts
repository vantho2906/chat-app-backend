import { Logger, INestApplicationContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AccountsModule } from 'accounts/accounts.module';
import { AccountsService } from 'accounts/accounts.service';
import ChatAppConfig from 'etc/config';
import { Server, ServerOptions, Socket } from 'socket.io';

export class SocketIoAdapter extends IoAdapter {
  private readonly logger = new Logger(SocketIoAdapter.name);
  constructor(private app: INestApplicationContext) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const clientPort = ChatAppConfig.CLIENT_PORT;
    const cors = {
      origin: [
        `http://localhost:${clientPort}`,
        new RegExp(`/^http:\/\/192\.168\.1\.([1-9]|[1-9]\d):${clientPort}$/`),
      ],
    };
    const optionsWithCORS: ServerOptions = {
      ...options,
      cors,
    };
    const jwtService = this.app.get(JwtService);
    const server: Server = super.createIOServer(port, optionsWithCORS);
    server.of('polls').use(this.getAccountFromToken(jwtService, this.logger));
    return server;
  }

  getAccountFromToken =
    (jwtService: JwtService, logger: Logger) =>
    async (socket: Socket, next) => {
      // for Postman testing support, fallback to token header
      const token =
        socket.handshake.auth.token || socket.handshake.headers['token'];
      logger.debug(`Validating auth token before connection: ${token}`);
      try {
        const payload = jwtService.verify(token);
        const accountId = payload.sub;
        const accountsService = this.app
          .select(AccountsModule)
          .get(AccountsService);
        this.logger.debug(`The account Id is ${accountId}`);
        const account = await accountsService.getById(accountId);
        if (!account) throw new Error('FORBIDDEN');
        socket.data.account = account;
        return next();
      } catch {
        next(new Error('FORBIDDEN'));
      }
    };
}

import { Controller } from '@nestjs/common';
import { ReactsService } from './reacts.service';

@Controller('reacts')
export class ReactsController {
  constructor(private readonly reactsService: ReactsService) {}
}

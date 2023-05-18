import { Controller } from '@nestjs/common';
import { NetworkFilesService } from './network-files.service';

@Controller('network-files')
export class NetworkFilesController {
  constructor(private readonly networkFilesService: NetworkFilesService) {}
}

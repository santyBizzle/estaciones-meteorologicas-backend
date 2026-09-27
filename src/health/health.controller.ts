import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/auth.guard';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor() {}

  @Get()
  @Public()
  @ApiResponse({ status: 200, description: 'The server is up!' })
  health() {
    return { status: 'OK' };
  }
}

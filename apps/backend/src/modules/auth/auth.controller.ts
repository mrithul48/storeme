// apps/api/src/modules/auth/auth.controller.ts
import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthRateLimitGuard } from './guards/auth-rate-limit.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  loginSchema,
  refreshTokenSchema,
  LoginInput,
  RefreshTokenInput,
} from '@launchcommerce/validation';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthRateLimitGuard)
  async login(@Body() body: unknown, @Req() req: any) {
    const input: LoginInput = loginSchema.parse(body);
    const ip =
      req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
      req.socket?.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return this.authService.login(input, ip, userAgent);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthRateLimitGuard)
  async refresh(@Body() body: unknown, @Req() req: any) {
    const input: RefreshTokenInput = refreshTokenSchema.parse(body);
    const ip =
      req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
      req.socket?.remoteAddress;

    return this.authService.refresh(input, ip);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: any, @Body() body?: { refreshToken?: string; deviceId?: string }) {
    return this.authService.logout(
      req.user.id,
      body?.refreshToken,
      body?.deviceId || req.user.deviceId,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    return this.authService.getMe(req.user.id);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  async getSessions(@Req() req: any) {
    return this.authService.getSessions(req.user.id);
  }

  @Delete('sessions/:id')
  @UseGuards(JwtAuthGuard)
  async revokeSession(@Req() req: any, @Param('id') sessionId: string) {
    return this.authService.revokeSession(req.user.id, sessionId);
  }
}


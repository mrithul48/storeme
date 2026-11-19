// apps/api/src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../../database/database.module';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { TokenRotationService } from './services/token-rotation.service';
import { GraceEncryptionService } from './services/grace-encryption.service';
import { AuthRepository } from './repositories/auth.repository';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthRateLimitGuard } from './guards/auth-rate-limit.guard';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    AuthRepository,
    AuthService,
    TokenRotationService,
    GraceEncryptionService,
    JwtAuthGuard,
    AuthRateLimitGuard,
  ],
  exports: [
    AuthRepository,
    AuthService,
    TokenRotationService,
    GraceEncryptionService,
    JwtAuthGuard,
    JwtModule,
  ],
})
export class AuthModule {}


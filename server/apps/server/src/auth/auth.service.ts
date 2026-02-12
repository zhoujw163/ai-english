import { RefreshTokenPayload, Token, TokenPayload } from '@en/common/user';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(payload: TokenPayload): Token {
    return {
      accessToken: this.jwtService.sign<RefreshTokenPayload>({
        ...payload,
        tokenType: 'access'
      }), // Default expiration from JwtModule config 10 seconds
      refreshToken: this.jwtService.sign<RefreshTokenPayload>(
        { ...payload, tokenType: 'refresh' },
        { expiresIn: '7d' }
      )
    };
  }
}

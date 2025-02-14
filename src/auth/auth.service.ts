import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthDto } from './dtos';

import { PrismaService } from '../prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: AuthDto) {
    // hash the password
    const hash = await argon.hash(dto.password);
    try {
      // save the user to db
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });

      // return saved user
      return this.signToken(user.id, user.email);
    } catch (error) {
      if (
        error instanceof
        PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(
            'Credentials taken',
          );
        }
      }
      throw error;
    }
    // return user;
  }
  async signin(dto: AuthDto) {
    //find user by unique (because email is unique) email
    const user =
      await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });
    //if no user throw exception
    if (!user)
      throw new ForbiddenException(
        'Credentials incorrect',
      );

    //compare password
    const pwMatches = await argon.verify(
      user.hash,
      dto.password,
    );

    if (!pwMatches)
      throw new ForbiddenException(
        'Credentials incorrect',
      );
    //if password is incorect throw an exception

    return this.signToken(user.id, user.email);
  }

  async signToken(
    id: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: id,
      email,
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(
      payload,
      {
        expiresIn: '15m',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        secret: secret,
      },
    );

    return { access_token: token };
  }
}

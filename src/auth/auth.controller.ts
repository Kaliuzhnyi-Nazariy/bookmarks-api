// eslint-disable-next-line prettier/prettier
import {
  Body,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dtos';

// we can add in (router way)

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  //the route will be .../auth/signup
  @Post('signup')
  //this way we can take body of request no matter the framework/libs is used
  signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto);
  }

  // The route will be ../auth/signin
  @HttpCode(200)
  @Post('signin')
  signin(@Body() dto: AuthDto) {
    return this.authService.signin(dto);
  }
}

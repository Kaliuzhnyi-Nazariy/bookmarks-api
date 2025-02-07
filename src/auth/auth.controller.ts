import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

// we can add in (router way)

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  //the route will be .../auth/signup
  @Post('signup')
  signup() {
    return 'I am signed up!';
  }

  // The route will be ../auth/signin
  @Post('signin')
  signin() {
    return 'I am signed in!';
  }
}

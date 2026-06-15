import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../../auth/auth.service';
import { AuthResponse } from '../models/auth.model';
import { UserProfile } from '../models/user.model';
import { RegisterInput, LoginInput, RefreshInput } from '../inputs/auth.input';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse)
  register(@Args('input') input: RegisterInput) {
    return this.authService.register(input.email, input.password, input.displayName);
  }

  @Mutation(() => AuthResponse)
  login(@Args('input') input: LoginInput) {
    return this.authService.login(input.email, input.password);
  }

  @Mutation(() => AuthResponse)
  refresh(@Args('input') input: RefreshInput) {
    return this.authService.refresh(input.refreshToken);
  }

  @Query(() => UserProfile)
  @UseGuards(AuthGuard('jwt'))
  me(@Context('req') req: any) {
    return this.authService.getUser(req.user.sub);
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { PrismaService, ResponseService } from '@libs/shared';
import type { RefreshTokenPayload, Token, UserLogin, UserRegister } from '@en/common/user';
import type { Prisma } from '@libs/shared/generated/prisma/client';
import { userSelect } from './user.select';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  @Inject()
  private readonly prismaService: PrismaService;

  @Inject()
  private readonly responseService: ResponseService;

  @Inject()
  private readonly authService: AuthService;

  @Inject()
  private readonly jwtService: JwtService;

  // 登录
  async login(createUserDto: UserLogin) {
    // 1. 校验手机号是否存在
    const user = await this.prismaService.user.findUnique({
      where: { phone: createUserDto.phone }
    });

    if (!user) {
      return this.responseService.error(null, '账号或密码错误');
    }

    // 2. 校验密码是否正确
    if (user.password !== createUserDto.password) {
      return this.responseService.error(null, '账号或密码错误');
    }

    // 3. 更新最后登录时间，返回用户信息（不包含密码）
    const updatedUser = await this.prismaService.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
      select: userSelect
    });

    // 4. 生成 token
    const token = this.authService.generateToken({
      userId: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email
    });

    return this.responseService.success({ ...updatedUser, token });
  }

  // 注册
  async register(registerDto: UserRegister) {
    const data: Prisma.UserCreateInput = {
      name: registerDto.name,
      phone: registerDto.phone,
      password: registerDto.password,
      lastLoginAt: new Date()
    };
    // name email? phone password
    // 1. 如果手机号已经存在则返回错误
    // findUnique 返回单个数据 也就是返回一个对象 findUnique 他只能查询数据是唯一的 并且返回单个数据
    const user = await this.prismaService.user.findUnique({
      where: { phone: registerDto.phone }
    });
    if (user) {
      return this.responseService.error(null, '手机号已存在');
    }
    // 2. 判断一下邮箱如果他传入了 并且存在了也不行的说明重复了
    if (registerDto.email) {
      const emailUser = await this.prismaService.user.findUnique({
        where: { email: registerDto.email }
      });
      if (emailUser) {
        return this.responseService.error(null, '邮箱已存在');
      }
      data.email = registerDto.email;
    }
    // 3. 创建用户 默认他是把所有的值全部返回包括密码 排除掉密码
    const newUser = await this.prismaService.user.create({
      data,
      select: userSelect
    });

    // 4. 生成 token
    const token = this.authService.generateToken({
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email
    });

    return this.responseService.success({ ...newUser, token });
  }

  // 刷新 token
  async refreshToken(createUserDto: Omit<Token, 'accessToken'>) {
    //1. 验证refreshToken是否有效 verify检查token是否有效 并且返回解码后的数据 sign生成token
    try {
      const decoded = this.jwtService.verify<RefreshTokenPayload>(
        createUserDto.refreshToken
      );
      //2.为什么增加这么一个判断 accessToken 冒充refreshToken 进行攻击
      if (decoded.tokenType !== 'refresh') {
        return this.responseService.error(null, 'refreshToken已过期或无效');
      }
      const user = await this.prismaService.user.findUnique({
        where: {
          id: decoded.userId //查询用户ID
        }
      });
      //3.如果查不出来说明userId是伪造的
      if (!user) {
        return this.responseService.error(null, '用户不存在');
      }
      const token = this.authService.generateToken({
        userId: user.id,
        name: user.name,
        email: user.email
      });
      return this.responseService.success(token);
    } catch (error) {
      return this.responseService.error(null, 'refreshToken已过期或无效');
    }
  }
}

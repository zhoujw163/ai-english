import { Inject, Injectable } from '@nestjs/common';
import { PrismaService, ResponseService } from '@libs/shared';
import type { UserLogin, UserRegister } from '@en/common/user';
import type { Prisma } from '@libs/shared/generated/prisma/client';

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  address: true,
  avatar: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
  wordNumber: true,
  dayNumber: true
};

@Injectable()
export class UserService {
  @Inject()
  private readonly prisma: PrismaService;

  @Inject()
  private readonly response: ResponseService;

  // 登录
  async login(createUserDto: UserLogin) {
    // 1. 校验手机号是否存在
    const user = await this.prisma.user.findUnique({
      where: { phone: createUserDto.phone }
    });

    if (!user) {
      return this.response.error(null, '账号或密码错误');
    }

    // 2. 校验密码是否正确
    if (user.password !== createUserDto.password) {
      return this.response.error(null, '账号或密码错误');
    }

    // 3. 更新最后登录时间，返回用户信息（不包含密码）
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
      select: userSelect
    });

    return this.response.success(updatedUser);
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
    const user = await this.prisma.user.findUnique({
      where: { phone: registerDto.phone }
    });
    if (user) {
      return this.response.error(null, '手机号已存在');
    }
    // 2. 判断一下邮箱如果他传入了 并且存在了也不行的说明重复了
    if (registerDto.email) {
      const emailUser = await this.prisma.user.findUnique({
        where: { email: registerDto.email }
      });
      if (emailUser) {
        return this.response.error(null, '邮箱已存在');
      }
      data.email = registerDto.email;
    }
    // 3. 创建用户 默认他是把所有的值全部返回包括密码 排除掉密码
    const newUser = await this.prisma.user.create({
      data,
      select: userSelect
    });
    return this.response.success(newUser);
  }
}

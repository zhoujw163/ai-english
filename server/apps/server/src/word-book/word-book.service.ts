import { PrismaService, ResponseService } from '@libs/shared';
import { Inject, Injectable } from '@nestjs/common';
import type { WordQuery } from '@en/common/word';
import { Prisma } from '@libs/shared/generated/prisma/client';

@Injectable()
export class WordBookService {
  @Inject()
  private readonly prismaService: PrismaService;

  @Inject()
  private readonly responseService: ResponseService;

  private toBoolean(value: string | boolean) {
    return value === 'true' ? true : undefined;
  }

  async findAll(query: WordQuery) {
    const { page = 1, pageSize = 12, word, ...rest } = query;

    const tags = Object.fromEntries(
      Object.entries(rest).map(([key, value]) => [key, this.toBoolean(value)])
    );
    const where: Prisma.WordBookWhereInput = {
      word: word ? { contains: word } : undefined,
      ...tags
    };

    const [total = 0, list = []] = await Promise.all([
      this.prismaService.wordBook.count({ where }),
      this.prismaService.wordBook.findMany({
        where,
        skip: (Number(page) - 1) * Number(pageSize),
        take: Number(pageSize),
        orderBy: {
          frq: 'desc'
        }
      })
    ]);

    return this.responseService.success({ total, list });
  }
}

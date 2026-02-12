import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { WordBookService } from './word-book.service';
import type { WordQuery } from '@en/common/word';
import { AuthGuard } from '@libs/shared/auth/auth.guard';

@Controller('word-book')
export class WordBookController {
  constructor(private readonly WordBookService: WordBookService) {}

  @Get()
  findAll(@Query() query: WordQuery) {
    return this.WordBookService.findAll(query);
  }
}

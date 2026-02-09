import { Controller, Get, Query } from '@nestjs/common';
import { WordBookService } from './word-book.service';
import type { WordQuery } from '@en/common/word';

@Controller('word-book')
export class WordBookController {
  constructor(private readonly WordBookService: WordBookService) {}

  @Get()
  findAll(@Query() query: WordQuery) {
    return this.WordBookService.findAll(query);
  }
}

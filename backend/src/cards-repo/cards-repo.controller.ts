import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { CardsRepoService } from './cards-repo.service';
import { User } from '@prisma/client';
import { CreateCollectionDto, UpdateCollectionDto } from './DTO';
import { GetCurrentUser } from '@common/decorators';

@Controller('collections')
export class CardsRepoController {
  constructor(private readonly cardsRepoService: CardsRepoService) {}

  @Post('create')
  async create(@Body() dto: CreateCollectionDto, @GetCurrentUser() user: User) {
    return this.cardsRepoService.createCollection(user.id, dto);
  }

  @Get(':id')
  async getCollection(@Param('id', ParseUUIDPipe) id: string) {
    return this.cardsRepoService.getCollection(id);
  }

  @Get('list')
  async getCollectionsList(@GetCurrentUser() user: User) {
    return this.cardsRepoService.getCollectionsList(user.id);
  }

  @Delete('delete/:id')
  async deleteCollection(@Param('id', ParseUUIDPipe) id: string) {
    return this.cardsRepoService.deleteCollection(id);
  }

  @Post('update/:id')
  async update(@Param('id', ParseUUIDPipe) collectionId: string, @Body() dto: UpdateCollectionDto) {
    return this.cardsRepoService.updateCollection(collectionId, dto);
  }
}

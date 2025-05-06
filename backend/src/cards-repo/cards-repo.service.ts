import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateCollectionDto, UpdateCollectionDto } from './DTO';

@Injectable()
export class CardsRepoService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async createCollection(userId: string, dto: CreateCollectionDto) {
    return this.prisma.$transaction(async (prisma) => {
      const collection = await prisma.collection.create({
        data: {
          userId,
          name: dto.name,
        },
      });

      if (dto.cards.length > 0) {
        await prisma.card.createMany({
          data: dto.cards.map((card) => ({
            collectionId: collection.id,
            word: card.word,
            translation: card.translation,
          })),
        });
      }
      return { id: collection.id, name: collection.name };
    });
  }

  async getCollection(collectionId: string) {
    const collection = await this.cacheManager.get(collectionId);
    if (!collection) {
      const collection = await this.prisma.collection.findUnique({
        where: {
          id: collectionId,
        },
        include: {
          cards: {
            select: {
              id: true,
              word: true,
              translation: true,
            },
          },
        },
      });
      await this.cacheManager.set(collectionId, collection);
      return collection;
    }
    return collection;
  }

  async getCollectionsList(userId: string) {
    return await this.prisma.collection.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        name: true,
      },
    });
  }

  async updateCollection(collectionId: string, updates: UpdateCollectionDto) {
    await this.cacheManager.del(collectionId);
    return await this.prisma.$transaction(async (prisma) => {
      // Изменение имени коллекции
      if (updates.newName) {
        await prisma.collection.update({
          where: {
            id: collectionId,
          },
          data: {
            name: updates.newName,
          },
        });
      }
      // Изменение существующих карточек
      if (updates.updatedCards?.length) {
        await Promise.all(
          updates.updatedCards.map((card) =>
            prisma.card.update({
              where: {
                id: card.id,
              },
              data: {
                word: card.word,
                translation: card.translation,
              },
            }),
          ),
        );
      }
      // Добавление новых карточек
      if (updates.newCards?.length) {
        await prisma.card.createMany({
          data: updates.newCards.map((card) => ({
            collectionId,
            word: card.word,
            translation: card.translation,
          })),
        });
      }
      // Удаление карточек
      if (updates.deletedCards?.length) {
        await prisma.card.deleteMany({
          where: {
            id: { in: updates.deletedCards },
            collectionId,
          },
        });
      }
      return { success: true };
    });
  }

  async deleteCollection(id: string) {
    await this.cacheManager.del(id);
    return await this.prisma.collection.delete({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });
  }
}

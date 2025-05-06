import { Module } from '@nestjs/common';
import { CardsRepoService } from './cards-repo.service';
import { CardsRepoController } from './cards-repo.controller';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [CacheModule.register()],
  controllers: [CardsRepoController],
  providers: [CardsRepoService],
})
export class CardsRepoModule {}

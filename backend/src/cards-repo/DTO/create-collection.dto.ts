import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { CreateCardDto } from './create-card.dto';
import { Type } from 'class-transformer';

export class CreateCollectionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @Type(() => CreateCardDto)
  @ValidateNested()
  cards: CreateCardDto[];
}

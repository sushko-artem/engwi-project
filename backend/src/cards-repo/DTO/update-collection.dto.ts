import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CardUpdateDto } from './update-card.dto';
import { Type } from 'class-transformer';

export class UpdateCollectionDto {
  @IsString()
  @IsOptional()
  newName?: string;

  @IsArray()
  @IsOptional()
  @Type(() => CardUpdateDto)
  @ValidateNested()
  updatedCards?: CardUpdateDto[];

  @IsArray()
  @IsOptional()
  newCards?: Array<{ word: string; translation: string }>;

  @IsArray()
  @IsOptional()
  deletedCards?: string[];
}

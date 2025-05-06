import { IsString } from 'class-validator';

export class CardUpdateDto {
  @IsString()
  id: string;

  @IsString()
  word: string;

  @IsString()
  translation: string;
}

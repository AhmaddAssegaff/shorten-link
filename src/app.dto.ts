import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLinkDto {
  @IsNotEmpty()
  @IsString()
  shortCode: string;

  @IsNotEmpty()
  @IsString()
  url: string;
}

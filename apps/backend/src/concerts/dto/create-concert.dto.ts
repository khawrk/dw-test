import { IsInt, IsString, Min, MinLength } from 'class-validator';

export class CreateConcertDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsInt()
  @Min(1)
  totalSeats: number;
}

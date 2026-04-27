import { IsUUID } from 'class-validator';

export class CreateReservationDto {
  @IsUUID()
  concertId: string;
}

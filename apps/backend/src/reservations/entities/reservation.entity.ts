import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Concert } from '../../concerts/entities/concert.entity';
import { ReservationStatus } from '../../common/enums/reservation-status.enum';

@Entity('reservations')
@Unique(['user', 'concert'])
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @ManyToOne((): typeof User => User, (user: User) => user.reservations, {
    eager: false,
  })
  user: User;

  @ManyToOne(
    (): typeof Concert => Concert,
    (concert: Concert) => concert.reservations,
    { eager: false },
  )
  concert: Concert;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.ACTIVE,
  })
  status: ReservationStatus;

  @CreateDateColumn()
  createdAt: Date;
}

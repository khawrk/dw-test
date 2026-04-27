import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Concert } from '../../concerts/entities/concert.entity';
import { ReservationStatus } from '../../common/enums/reservation-status.enum';

@Entity('reservations')
@Index('UQ_active_reservation_user_concert', ['user', 'concert'], {
  unique: true,
  where: `"status" = 'ACTIVE'`,
})
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

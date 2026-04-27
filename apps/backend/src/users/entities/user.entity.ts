import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../../common/enums/role.enum';
import { Reservation } from '../../reservations/entities/reservation.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @OneToMany(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    (): typeof Reservation => Reservation,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    (reservation: Reservation) => reservation.user,
  )
  reservations: Reservation[];
}

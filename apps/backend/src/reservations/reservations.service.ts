import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { Concert } from '../concerts/entities/concert.entity';
import { ReservationStatus } from '../common/enums/reservation-status.enum';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepo: Repository<Reservation>,
    private dataSource: DataSource,
  ) {}

  async reserve(
    userId: string,
    dto: CreateReservationDto,
  ): Promise<Reservation> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        // Lock the concert row to prevents race conditions on seat count
        const concert = await manager.findOne(Concert, {
          where: { id: dto.concertId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!concert) throw new NotFoundException('Concert not found');

        if (concert.reservedSeats >= concert.totalSeats) {
          throw new BadRequestException('Concert is fully booked');
        }

        const existing = await manager.findOne(Reservation, {
          where: {
            user: { id: userId },
            concert: { id: dto.concertId },
            status: ReservationStatus.ACTIVE,
          },
        });
        if (existing)
          throw new ConflictException(
            'You already have a reservation for this concert',
          );

        concert.reservedSeats += 1;
        await manager.save(Concert, concert);

        const reservation = manager.create(Reservation, {
          user: { id: userId },
          concert: { id: dto.concertId },
        });
        return manager.save(Reservation, reservation);
      });
    } catch (err) {
      // Partial unique index catches any race that slips past the app-level check
      if ((err as { code?: string })?.code === '23505') {
        throw new ConflictException(
          'You already have a reservation for this concert',
        );
      }
      throw err;
    }
  }

  async cancel(reservationId: string, userId: string): Promise<Reservation> {
    // Validate ownership before entering the transaction
    const reservation = await this.reservationRepo.findOne({
      where: { id: reservationId },
      relations: ['user', 'concert'],
    });

    if (!reservation) throw new NotFoundException('Reservation not found');
    if (reservation.user.id !== userId)
      throw new ForbiddenException('Not your reservation');

    return this.dataSource.transaction(async (manager) => {
      // Lock concert first (same order as reserve to avoid deadlocks)
      const concert = await manager.findOne(Concert, {
        where: { id: reservation.concert.id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!concert) throw new NotFoundException('Concert not found');

      // Re-read reservation with lock to guard against concurrent cancels
      const locked = await manager.findOne(Reservation, {
        where: { id: reservationId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!locked) throw new NotFoundException('Reservation not found');

      if (locked.status === ReservationStatus.CANCELLED) {
        throw new BadRequestException('Reservation already cancelled');
      }

      locked.status = ReservationStatus.CANCELLED;
      concert.reservedSeats = Math.max(0, concert.reservedSeats - 1);
      await manager.save(Concert, concert);
      return manager.save(Reservation, locked);
    });
  }

  findMyReservations(userId: string): Promise<Reservation[]> {
    return this.reservationRepo.find({
      where: { user: { id: userId } },
      relations: ['concert'],
      order: { createdAt: 'DESC' },
    });
  }

  findAll(): Promise<Reservation[]> {
    return this.reservationRepo.find({
      relations: ['user', 'concert'],
      order: { createdAt: 'DESC' },
    });
  }
}

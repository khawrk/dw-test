import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { DataSource } from 'typeorm';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ReservationStatus } from '../common/enums/reservation-status.enum';

// Mocks

const mockConcert = {
  id: 'concert-1',
  name: 'Test Concert',
  description: 'A test concert',
  totalSeats: 10,
  reservedSeats: 0,
};

const mockUser = {
  id: 'user-1',
  email: 'user@test.com',
};

const mockReservation = {
  id: 'reservation-1',
  user: mockUser,
  concert: mockConcert,
  status: ReservationStatus.ACTIVE,
  createdAt: new Date(),
};

// Mock EntityManager used inside transactions
const mockManager = {
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
};

// Mock DataSource — immediately calls the callback with mockManager
const mockDataSource = {
  transaction: jest.fn(
    (cb: (manager: typeof mockManager) => Promise<unknown>) => cb(mockManager),
  ),
};

const mockReservationRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
};

describe('ReservationsService', () => {
  let service: ReservationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockReservationRepo,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
  });

  // Reset all mocks between tests so they don't bleed into each other
  afterEach(() => {
    jest.clearAllMocks();
  });

  // reserve()

  describe('reserve()', () => {
    it('should successfully reserve a seat', async () => {
      mockManager.findOne
        .mockResolvedValueOnce({ ...mockConcert }) // concert found
        .mockResolvedValueOnce(null); // no existing reservation
      mockManager.create.mockReturnValue(mockReservation);
      mockManager.save
        .mockResolvedValueOnce({ ...mockConcert, reservedSeats: 1 }) // save concert
        .mockResolvedValueOnce(mockReservation); // save reservation

      const result = await service.reserve('user-1', {
        concertId: 'concert-1',
      });

      expect(result).toEqual(mockReservation);
      expect(mockManager.save).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException when concert does not exist', async () => {
      mockManager.findOne.mockResolvedValueOnce(null); // concert not found

      await expect(
        service.reserve('user-1', { concertId: 'invalid-id' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when concert is fully booked', async () => {
      mockManager.findOne.mockResolvedValueOnce({
        ...mockConcert,
        totalSeats: 10,
        reservedSeats: 10, // fully booked
      });

      await expect(
        service.reserve('user-1', { concertId: 'concert-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException when user already has a reservation', async () => {
      mockManager.findOne
        .mockResolvedValueOnce({ ...mockConcert }) // concert found
        .mockResolvedValueOnce(mockReservation); // existing reservation found

      await expect(
        service.reserve('user-1', { concertId: 'concert-1' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should increment reservedSeats by 1 on successful reservation', async () => {
      const concert = { ...mockConcert, reservedSeats: 5 };
      mockManager.findOne
        .mockResolvedValueOnce(concert)
        .mockResolvedValueOnce(null);
      mockManager.create.mockReturnValue(mockReservation);
      mockManager.save.mockResolvedValue({});

      await service.reserve('user-1', { concertId: 'concert-1' });

      // First save call should be concert with incremented seats
      expect(mockManager.save).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ reservedSeats: 6 }),
      );
    });
  });

  //cancel()

  describe('cancel()', () => {
    it('should successfully cancel a reservation', async () => {
      mockReservationRepo.findOne.mockResolvedValue({
        ...mockReservation,
        user: mockUser,
        concert: { ...mockConcert, reservedSeats: 1 },
      });
      mockManager.save.mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.CANCELLED,
      });

      const result = await service.cancel('reservation-1', 'user-1');

      expect(result.status).toBe(ReservationStatus.CANCELLED);
    });

    it('should throw NotFoundException when reservation does not exist', async () => {
      mockReservationRepo.findOne.mockResolvedValue(null);

      await expect(service.cancel('invalid-id', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when cancelling another users reservation', async () => {
      mockReservationRepo.findOne.mockResolvedValue({
        ...mockReservation,
        user: { id: 'different-user' },
      });

      await expect(service.cancel('reservation-1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException when reservation is already cancelled', async () => {
      mockReservationRepo.findOne.mockResolvedValue({
        ...mockReservation,
        user: mockUser,
        status: ReservationStatus.CANCELLED,
      });

      await expect(service.cancel('reservation-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should decrement reservedSeats by 1 on cancellation', async () => {
      mockReservationRepo.findOne.mockResolvedValue({
        ...mockReservation,
        user: mockUser,
        concert: { ...mockConcert, reservedSeats: 5 },
      });
      mockManager.save.mockResolvedValue({});

      await service.cancel('reservation-1', 'user-1');

      expect(mockManager.save).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ reservedSeats: 4 }),
      );
    });
  });

  // findMyReservations()

  describe('findMyReservations()', () => {
    it('should return reservations for the given user', async () => {
      mockReservationRepo.find.mockResolvedValue([mockReservation]);

      const result = await service.findMyReservations('user-1');

      expect(result).toEqual([mockReservation]);
      expect(mockReservationRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user: { id: 'user-1' } },
        }),
      );
    });

    it('should return empty array when user has no reservations', async () => {
      mockReservationRepo.find.mockResolvedValue([]);

      const result = await service.findMyReservations('user-1');

      expect(result).toEqual([]);
    });
  });

  // findAll()

  describe('findAll()', () => {
    it('should return all reservations', async () => {
      mockReservationRepo.find.mockResolvedValue([mockReservation]);

      const result = await service.findAll();

      expect(result).toEqual([mockReservation]);
    });
  });
});

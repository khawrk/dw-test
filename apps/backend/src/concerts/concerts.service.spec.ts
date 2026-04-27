import { Test, TestingModule } from '@nestjs/testing';
import { ConcertsService } from './concerts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Concert } from './entities/concert.entity';
import { NotFoundException } from '@nestjs/common';

const mockConcert: Concert = {
  id: 'concert-1',
  name: 'Test Concert',
  description: 'A test concert description',
  totalSeats: 100,
  reservedSeats: 0,
  reservations: [],
};

const mockConcertRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
};

describe('ConcertsService', () => {
  let service: ConcertsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConcertsService,
        {
          provide: getRepositoryToken(Concert),
          useValue: mockConcertRepo,
        },
      ],
    }).compile();

    service = module.get<ConcertsService>(ConcertsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // create()

  describe('create()', () => {
    it('should create a concert successfully', async () => {
      mockConcertRepo.create.mockReturnValue(mockConcert);
      mockConcertRepo.save.mockResolvedValue(mockConcert);

      const result = await service.create({
        name: 'Test Concert',
        description: 'A test concert description',
        totalSeats: 100,
      });

      expect(result).toEqual(mockConcert);
      expect(mockConcertRepo.create).toHaveBeenCalledWith({
        name: 'Test Concert',
        description: 'A test concert description',
        totalSeats: 100,
      });
      expect(mockConcertRepo.save).toHaveBeenCalledWith(mockConcert);
    });
  });

  // findAll()

  describe('findAll()', () => {
    it('should return all concerts', async () => {
      mockConcertRepo.find.mockResolvedValue([mockConcert]);

      const result = await service.findAll();

      expect(result).toEqual([mockConcert]);
      expect(mockConcertRepo.find).toHaveBeenCalledWith({
        order: { name: 'ASC' },
      });
    });

    it('should return empty array when no concerts exist', async () => {
      mockConcertRepo.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  // findOne()

  describe('findOne()', () => {
    it('should return a concert by id', async () => {
      mockConcertRepo.findOne.mockResolvedValue(mockConcert);

      const result = await service.findOne('concert-1');

      expect(result).toEqual(mockConcert);
      expect(mockConcertRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'concert-1' },
      });
    });

    it('should throw NotFoundException when concert does not exist', async () => {
      mockConcertRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // remove()

  describe('remove()', () => {
    it('should delete a concert successfully', async () => {
      mockConcertRepo.findOne.mockResolvedValue(mockConcert);
      mockConcertRepo.remove.mockResolvedValue(mockConcert);

      const result = await service.remove('concert-1');

      expect(result).toEqual({ message: 'Concert deleted successfully' });
      expect(mockConcertRepo.remove).toHaveBeenCalledWith(mockConcert);
    });

    it('should throw NotFoundException when concert does not exist', async () => {
      mockConcertRepo.findOne.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

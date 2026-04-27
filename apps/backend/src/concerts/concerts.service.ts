import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Concert } from './entities/concert.entity';
import { CreateConcertDto } from './dto/create-concert.dto';

@Injectable()
export class ConcertsService {
  constructor(
    @InjectRepository(Concert)
    private concertRepo: Repository<Concert>,
  ) {}

  create(dto: CreateConcertDto): Promise<Concert> {
    const concert = this.concertRepo.create(dto);
    return this.concertRepo.save(concert);
  }

  findAll(): Promise<Concert[]> {
    return this.concertRepo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Concert> {
    const concert = await this.concertRepo.findOne({ where: { id } });
    if (!concert) throw new NotFoundException(`Concert ${id} not found`);
    return concert;
  }

  async remove(id: string): Promise<{ message: string }> {
    const concert = await this.findOne(id);
    await this.concertRepo.remove(concert);
    return { message: 'Concert deleted successfully' };
  }
}

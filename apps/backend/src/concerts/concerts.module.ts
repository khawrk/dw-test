import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Concert } from './entities/concert.entity';
import { ConcertsService } from './concerts.service';
import { ConcertsController } from './concerts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Concert])],
  providers: [ConcertsService],
  controllers: [ConcertsController],
  exports: [ConcertsService],
})
export class ConcertsModule {}

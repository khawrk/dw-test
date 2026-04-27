import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

interface RequestUser {
  userId: string;
  email: string;
  role: string;
}

@Controller('reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservationsController {
  constructor(private reservationsService: ReservationsService) {}

  @Post()
  @Roles(Role.USER)
  reserve(@CurrentUser() user: RequestUser, @Body() dto: CreateReservationDto) {
    return this.reservationsService.reserve(user.userId, dto);
  }

  @Delete(':id')
  @Roles(Role.USER)
  cancel(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.reservationsService.cancel(id, user.userId);
  }

  @Get('my')
  @Roles(Role.USER)
  myReservations(@CurrentUser() user: RequestUser) {
    return this.reservationsService.findMyReservations(user.userId);
  }

  @Get('all')
  @Roles(Role.ADMIN)
  findAll() {
    return this.reservationsService.findAll();
  }
}

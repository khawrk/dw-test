import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveReservationUniqueConstraint1777300824213 implements MigrationInterface {
    name = 'RemoveReservationUniqueConstraint1777300824213'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservations" DROP CONSTRAINT "UQ_9506ab3963a25e70da33b61db88"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservations" ADD CONSTRAINT "UQ_9506ab3963a25e70da33b61db88" UNIQUE ("userId", "concertId")`);
    }

}

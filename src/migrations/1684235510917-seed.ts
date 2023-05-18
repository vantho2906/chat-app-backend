import { MigrationInterface, QueryRunner } from "typeorm";

export class Seed1684235510917 implements MigrationInterface {
    name = 'Seed1684235510917'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`network_file\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`network_file\` DROP COLUMN \`createdAt\``);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class Seed1683966929419 implements MigrationInterface {
    name = 'Seed1683966929419'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`chat_room\` CHANGE \`name\` \`name\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`chat_room\` CHANGE \`name\` \`name\` varchar(255) NOT NULL`);
    }

}

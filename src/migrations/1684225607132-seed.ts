import { MigrationInterface, QueryRunner } from "typeorm";

export class Seed1684225607132 implements MigrationInterface {
    name = 'Seed1684225607132'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`network_file\` ADD \`messageId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`network_file\` ADD CONSTRAINT \`FK_a49a70c553eb8b6c9458cfea177\` FOREIGN KEY (\`messageId\`) REFERENCES \`message\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`network_file\` DROP FOREIGN KEY \`FK_a49a70c553eb8b6c9458cfea177\``);
        await queryRunner.query(`ALTER TABLE \`network_file\` DROP COLUMN \`messageId\``);
    }

}

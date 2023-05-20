import { MigrationInterface, QueryRunner } from "typeorm";

export class Seed1684403934650 implements MigrationInterface {
    name = 'Seed1684403934650'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`approval\` DROP FOREIGN KEY \`FK_9a79b781e9078cb07eb017e2ff8\``);
        await queryRunner.query(`ALTER TABLE \`member\` DROP FOREIGN KEY \`FK_c1012c9a3cdedf2b00510cdd845\``);
        await queryRunner.query(`ALTER TABLE \`approval\` ADD CONSTRAINT \`FK_9a79b781e9078cb07eb017e2ff8\` FOREIGN KEY (\`roomId\`) REFERENCES \`chat_room\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`member\` ADD CONSTRAINT \`FK_c1012c9a3cdedf2b00510cdd845\` FOREIGN KEY (\`accountId\`) REFERENCES \`account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`member\` DROP FOREIGN KEY \`FK_c1012c9a3cdedf2b00510cdd845\``);
        await queryRunner.query(`ALTER TABLE \`approval\` DROP FOREIGN KEY \`FK_9a79b781e9078cb07eb017e2ff8\``);
        await queryRunner.query(`ALTER TABLE \`member\` ADD CONSTRAINT \`FK_c1012c9a3cdedf2b00510cdd845\` FOREIGN KEY (\`accountId\`) REFERENCES \`account\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`approval\` ADD CONSTRAINT \`FK_9a79b781e9078cb07eb017e2ff8\` FOREIGN KEY (\`roomId\`) REFERENCES \`chat_room\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}

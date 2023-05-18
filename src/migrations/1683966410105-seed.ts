import { MigrationInterface, QueryRunner } from "typeorm";

export class Seed1683966410105 implements MigrationInterface {
    name = 'Seed1683966410105'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`approval\` DROP FOREIGN KEY \`FK_9a79b781e9078cb07eb017e2ff8\``);
        await queryRunner.query(`ALTER TABLE \`chat_room\` DROP FOREIGN KEY \`FK_e3631e9ea9ee3fd6e8fa90928ba\``);
        await queryRunner.query(`ALTER TABLE \`member\` DROP FOREIGN KEY \`FK_65f2094390c40918283dba25ec8\``);
        await queryRunner.query(`DROP INDEX \`REL_e3631e9ea9ee3fd6e8fa90928b\` ON \`chat_room\``);
        await queryRunner.query(`ALTER TABLE \`chat_room\` DROP COLUMN \`avatarId\``);
        await queryRunner.query(`ALTER TABLE \`chat_room\` DROP COLUMN \`dob\``);
        await queryRunner.query(`ALTER TABLE \`chat_room\` CHANGE \`updatedAt\` \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`approval\` ADD CONSTRAINT \`FK_9a79b781e9078cb07eb017e2ff8\` FOREIGN KEY (\`roomId\`) REFERENCES \`chat_room\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`member\` ADD CONSTRAINT \`FK_65f2094390c40918283dba25ec8\` FOREIGN KEY (\`roomId\`) REFERENCES \`chat_room\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`member\` DROP FOREIGN KEY \`FK_65f2094390c40918283dba25ec8\``);
        await queryRunner.query(`ALTER TABLE \`approval\` DROP FOREIGN KEY \`FK_9a79b781e9078cb07eb017e2ff8\``);
        await queryRunner.query(`ALTER TABLE \`chat_room\` CHANGE \`updatedAt\` \`updatedAt\` datetime(0) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`chat_room\` ADD \`dob\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`chat_room\` ADD \`avatarId\` int NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_e3631e9ea9ee3fd6e8fa90928b\` ON \`chat_room\` (\`avatarId\`)`);
        await queryRunner.query(`ALTER TABLE \`member\` ADD CONSTRAINT \`FK_65f2094390c40918283dba25ec8\` FOREIGN KEY (\`roomId\`) REFERENCES \`chat_room\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chat_room\` ADD CONSTRAINT \`FK_e3631e9ea9ee3fd6e8fa90928ba\` FOREIGN KEY (\`avatarId\`) REFERENCES \`network_file\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`approval\` ADD CONSTRAINT \`FK_9a79b781e9078cb07eb017e2ff8\` FOREIGN KEY (\`roomId\`) REFERENCES \`chat_room\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

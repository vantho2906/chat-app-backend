import { MigrationInterface, QueryRunner } from "typeorm";

export class Seed1683803266366 implements MigrationInterface {
    name = 'Seed1683803266366'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`friend\` (\`id\` varchar(36) NOT NULL, \`account1Id\` varchar(36) NULL, \`account2Id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`friend\` ADD CONSTRAINT \`FK_5f81cc16d5c8374bfa53d5ab5bc\` FOREIGN KEY (\`account1Id\`) REFERENCES \`account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`friend\` ADD CONSTRAINT \`FK_9b3b2dda14bbca0071128435d08\` FOREIGN KEY (\`account2Id\`) REFERENCES \`account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`friend\` DROP FOREIGN KEY \`FK_9b3b2dda14bbca0071128435d08\``);
        await queryRunner.query(`ALTER TABLE \`friend\` DROP FOREIGN KEY \`FK_5f81cc16d5c8374bfa53d5ab5bc\``);
        await queryRunner.query(`DROP TABLE \`friend\``);
    }

}

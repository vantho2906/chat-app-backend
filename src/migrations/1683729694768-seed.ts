import { MigrationInterface, QueryRunner } from "typeorm";

export class Seed1683729694768 implements MigrationInterface {
    name = 'Seed1683729694768'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`member\` (\`id\` int NOT NULL AUTO_INCREMENT, \`role\` enum ('User', 'Vice', 'Admin') NOT NULL DEFAULT 'User', \`nickname\` varchar(255) NOT NULL, \`joinedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`accountId\` varchar(36) NULL, \`roomId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`react\` (\`id\` int NOT NULL AUTO_INCREMENT, \`icon\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`accountId\` varchar(36) NULL, \`messageId\` int NULL, \`roomId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`message\` (\`id\` int NOT NULL AUTO_INCREMENT, \`type\` enum ('Normal', 'Calling') NOT NULL DEFAULT 'Normal', \`text\` varchar(255) NULL, \`link\` varchar(255) NULL, \`isDeleted\` tinyint NOT NULL DEFAULT 0, \`isPin\` tinyint NOT NULL DEFAULT 0, \`editAt\` datetime NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`senderId\` varchar(36) NULL, \`roomId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`chat_room\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`type\` enum ('Own', 'One On One', 'Multiple Users') NOT NULL, \`dob\` datetime NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime NOT NULL, \`isLimited\` tinyint NOT NULL DEFAULT 0, \`avatarId\` int NULL, UNIQUE INDEX \`REL_e3631e9ea9ee3fd6e8fa90928b\` (\`avatarId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`network_file\` (\`id\` int NOT NULL AUTO_INCREMENT, \`filename\` varchar(255) NULL, \`mimeType\` varchar(255) NOT NULL, \`fileIdOnDrive\` varchar(255) NULL, \`url\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`friend_request\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`senderId\` varchar(36) NULL, \`receiverId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`notification\` (\`id\` int NOT NULL AUTO_INCREMENT, \`content\` varchar(255) NOT NULL, \`link\` varchar(255) NULL, \`isRead\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`actorId\` varchar(36) NULL, \`messageId\` int NULL, \`friendRequestId\` int NULL, UNIQUE INDEX \`REL_fbaf4820bc548b46e1d5aa4e4d\` (\`friendRequestId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`account\` (\`id\` varchar(36) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NULL, \`signInWay\` enum ('Google', 'Normal') NOT NULL, \`role\` enum ('Admin', 'User') NOT NULL DEFAULT 'User', \`fname\` varchar(255) NOT NULL, \`lname\` varchar(255) NOT NULL, \`gender\` enum ('Male', 'Female') NULL, \`dob\` datetime NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`offlineAt\` datetime NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`avatarId\` int NULL, UNIQUE INDEX \`IDX_4c8f96ccf523e9a3faefd5bdd4\` (\`email\`), UNIQUE INDEX \`REL_fc20c5df43e9d750e2f9dd7037\` (\`avatarId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`approval\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`accountId\` varchar(36) NULL, \`roomId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`media_file\` (\`id\` int NOT NULL AUTO_INCREMENT, \`icon\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`accountId\` varchar(36) NULL, \`messageId\` int NULL, \`fileId\` int NULL, UNIQUE INDEX \`REL_23816602c8c6b6c69891df242f\` (\`fileId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`other_file\` (\`id\` int NOT NULL AUTO_INCREMENT, \`icon\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`accountId\` varchar(36) NULL, \`messageId\` int NULL, \`fileId\` int NULL, UNIQUE INDEX \`REL_55bab2ca6ed85da4b765a9bb6f\` (\`fileId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`notification_receivers_account\` (\`notificationId\` int NOT NULL, \`accountId\` varchar(36) NOT NULL, INDEX \`IDX_86a75169fa3d3ed85d70ff678f\` (\`notificationId\`), INDEX \`IDX_1baf5c8256a9b53ced40ce7808\` (\`accountId\`), PRIMARY KEY (\`notificationId\`, \`accountId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`account_friends_account\` (\`accountId_1\` varchar(36) NOT NULL, \`accountId_2\` varchar(36) NOT NULL, INDEX \`IDX_9336fd5bb513e307305e533394\` (\`accountId_1\`), INDEX \`IDX_b358c2e8454029eff950222cab\` (\`accountId_2\`), PRIMARY KEY (\`accountId_1\`, \`accountId_2\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`member\` ADD CONSTRAINT \`FK_c1012c9a3cdedf2b00510cdd845\` FOREIGN KEY (\`accountId\`) REFERENCES \`account\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`member\` ADD CONSTRAINT \`FK_65f2094390c40918283dba25ec8\` FOREIGN KEY (\`roomId\`) REFERENCES \`chat_room\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`react\` ADD CONSTRAINT \`FK_73a622d4aa8b3000477ac2de453\` FOREIGN KEY (\`accountId\`) REFERENCES \`account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`react\` ADD CONSTRAINT \`FK_80d5f9ae5a742ae0fed8c53486f\` FOREIGN KEY (\`messageId\`) REFERENCES \`message\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`react\` ADD CONSTRAINT \`FK_88f822f3f34113d827009d4e673\` FOREIGN KEY (\`roomId\`) REFERENCES \`chat_room\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`message\` ADD CONSTRAINT \`FK_bc096b4e18b1f9508197cd98066\` FOREIGN KEY (\`senderId\`) REFERENCES \`account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`message\` ADD CONSTRAINT \`FK_fdfe54a21d1542c564384b74d5c\` FOREIGN KEY (\`roomId\`) REFERENCES \`chat_room\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chat_room\` ADD CONSTRAINT \`FK_e3631e9ea9ee3fd6e8fa90928ba\` FOREIGN KEY (\`avatarId\`) REFERENCES \`network_file\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`friend_request\` ADD CONSTRAINT \`FK_9509b72f50f495668bae3c0171c\` FOREIGN KEY (\`senderId\`) REFERENCES \`account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`friend_request\` ADD CONSTRAINT \`FK_470e723fdad9d6f4981ab2481eb\` FOREIGN KEY (\`receiverId\`) REFERENCES \`account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`notification\` ADD CONSTRAINT \`FK_c5133a026bd1b3d9feccac1a234\` FOREIGN KEY (\`actorId\`) REFERENCES \`account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`notification\` ADD CONSTRAINT \`FK_e77398d5c03520ca87c7c03ca9f\` FOREIGN KEY (\`messageId\`) REFERENCES \`message\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`notification\` ADD CONSTRAINT \`FK_fbaf4820bc548b46e1d5aa4e4d2\` FOREIGN KEY (\`friendRequestId\`) REFERENCES \`friend_request\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`account\` ADD CONSTRAINT \`FK_fc20c5df43e9d750e2f9dd7037b\` FOREIGN KEY (\`avatarId\`) REFERENCES \`network_file\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`approval\` ADD CONSTRAINT \`FK_6ceccf2d2a4fddb1c8c2e03aaf7\` FOREIGN KEY (\`accountId\`) REFERENCES \`account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`approval\` ADD CONSTRAINT \`FK_9a79b781e9078cb07eb017e2ff8\` FOREIGN KEY (\`roomId\`) REFERENCES \`chat_room\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`media_file\` ADD CONSTRAINT \`FK_dc9cdeed262120f1478ebb4262b\` FOREIGN KEY (\`accountId\`) REFERENCES \`account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`media_file\` ADD CONSTRAINT \`FK_111959e7efe1e113a14c7608470\` FOREIGN KEY (\`messageId\`) REFERENCES \`message\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`media_file\` ADD CONSTRAINT \`FK_23816602c8c6b6c69891df242fe\` FOREIGN KEY (\`fileId\`) REFERENCES \`network_file\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`other_file\` ADD CONSTRAINT \`FK_958cca0bb33cd2a14a8c1f29a99\` FOREIGN KEY (\`accountId\`) REFERENCES \`account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`other_file\` ADD CONSTRAINT \`FK_b8399a090b8a1a42af56857f041\` FOREIGN KEY (\`messageId\`) REFERENCES \`message\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`other_file\` ADD CONSTRAINT \`FK_55bab2ca6ed85da4b765a9bb6f1\` FOREIGN KEY (\`fileId\`) REFERENCES \`network_file\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`notification_receivers_account\` ADD CONSTRAINT \`FK_86a75169fa3d3ed85d70ff678f1\` FOREIGN KEY (\`notificationId\`) REFERENCES \`notification\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`notification_receivers_account\` ADD CONSTRAINT \`FK_1baf5c8256a9b53ced40ce78087\` FOREIGN KEY (\`accountId\`) REFERENCES \`account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`account_friends_account\` ADD CONSTRAINT \`FK_9336fd5bb513e307305e533394a\` FOREIGN KEY (\`accountId_1\`) REFERENCES \`account\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`account_friends_account\` ADD CONSTRAINT \`FK_b358c2e8454029eff950222cab6\` FOREIGN KEY (\`accountId_2\`) REFERENCES \`account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`account_friends_account\` DROP FOREIGN KEY \`FK_b358c2e8454029eff950222cab6\``);
        await queryRunner.query(`ALTER TABLE \`account_friends_account\` DROP FOREIGN KEY \`FK_9336fd5bb513e307305e533394a\``);
        await queryRunner.query(`ALTER TABLE \`notification_receivers_account\` DROP FOREIGN KEY \`FK_1baf5c8256a9b53ced40ce78087\``);
        await queryRunner.query(`ALTER TABLE \`notification_receivers_account\` DROP FOREIGN KEY \`FK_86a75169fa3d3ed85d70ff678f1\``);
        await queryRunner.query(`ALTER TABLE \`other_file\` DROP FOREIGN KEY \`FK_55bab2ca6ed85da4b765a9bb6f1\``);
        await queryRunner.query(`ALTER TABLE \`other_file\` DROP FOREIGN KEY \`FK_b8399a090b8a1a42af56857f041\``);
        await queryRunner.query(`ALTER TABLE \`other_file\` DROP FOREIGN KEY \`FK_958cca0bb33cd2a14a8c1f29a99\``);
        await queryRunner.query(`ALTER TABLE \`media_file\` DROP FOREIGN KEY \`FK_23816602c8c6b6c69891df242fe\``);
        await queryRunner.query(`ALTER TABLE \`media_file\` DROP FOREIGN KEY \`FK_111959e7efe1e113a14c7608470\``);
        await queryRunner.query(`ALTER TABLE \`media_file\` DROP FOREIGN KEY \`FK_dc9cdeed262120f1478ebb4262b\``);
        await queryRunner.query(`ALTER TABLE \`approval\` DROP FOREIGN KEY \`FK_9a79b781e9078cb07eb017e2ff8\``);
        await queryRunner.query(`ALTER TABLE \`approval\` DROP FOREIGN KEY \`FK_6ceccf2d2a4fddb1c8c2e03aaf7\``);
        await queryRunner.query(`ALTER TABLE \`account\` DROP FOREIGN KEY \`FK_fc20c5df43e9d750e2f9dd7037b\``);
        await queryRunner.query(`ALTER TABLE \`notification\` DROP FOREIGN KEY \`FK_fbaf4820bc548b46e1d5aa4e4d2\``);
        await queryRunner.query(`ALTER TABLE \`notification\` DROP FOREIGN KEY \`FK_e77398d5c03520ca87c7c03ca9f\``);
        await queryRunner.query(`ALTER TABLE \`notification\` DROP FOREIGN KEY \`FK_c5133a026bd1b3d9feccac1a234\``);
        await queryRunner.query(`ALTER TABLE \`friend_request\` DROP FOREIGN KEY \`FK_470e723fdad9d6f4981ab2481eb\``);
        await queryRunner.query(`ALTER TABLE \`friend_request\` DROP FOREIGN KEY \`FK_9509b72f50f495668bae3c0171c\``);
        await queryRunner.query(`ALTER TABLE \`chat_room\` DROP FOREIGN KEY \`FK_e3631e9ea9ee3fd6e8fa90928ba\``);
        await queryRunner.query(`ALTER TABLE \`message\` DROP FOREIGN KEY \`FK_fdfe54a21d1542c564384b74d5c\``);
        await queryRunner.query(`ALTER TABLE \`message\` DROP FOREIGN KEY \`FK_bc096b4e18b1f9508197cd98066\``);
        await queryRunner.query(`ALTER TABLE \`react\` DROP FOREIGN KEY \`FK_88f822f3f34113d827009d4e673\``);
        await queryRunner.query(`ALTER TABLE \`react\` DROP FOREIGN KEY \`FK_80d5f9ae5a742ae0fed8c53486f\``);
        await queryRunner.query(`ALTER TABLE \`react\` DROP FOREIGN KEY \`FK_73a622d4aa8b3000477ac2de453\``);
        await queryRunner.query(`ALTER TABLE \`member\` DROP FOREIGN KEY \`FK_65f2094390c40918283dba25ec8\``);
        await queryRunner.query(`ALTER TABLE \`member\` DROP FOREIGN KEY \`FK_c1012c9a3cdedf2b00510cdd845\``);
        await queryRunner.query(`DROP INDEX \`IDX_b358c2e8454029eff950222cab\` ON \`account_friends_account\``);
        await queryRunner.query(`DROP INDEX \`IDX_9336fd5bb513e307305e533394\` ON \`account_friends_account\``);
        await queryRunner.query(`DROP TABLE \`account_friends_account\``);
        await queryRunner.query(`DROP INDEX \`IDX_1baf5c8256a9b53ced40ce7808\` ON \`notification_receivers_account\``);
        await queryRunner.query(`DROP INDEX \`IDX_86a75169fa3d3ed85d70ff678f\` ON \`notification_receivers_account\``);
        await queryRunner.query(`DROP TABLE \`notification_receivers_account\``);
        await queryRunner.query(`DROP INDEX \`REL_55bab2ca6ed85da4b765a9bb6f\` ON \`other_file\``);
        await queryRunner.query(`DROP TABLE \`other_file\``);
        await queryRunner.query(`DROP INDEX \`REL_23816602c8c6b6c69891df242f\` ON \`media_file\``);
        await queryRunner.query(`DROP TABLE \`media_file\``);
        await queryRunner.query(`DROP TABLE \`approval\``);
        await queryRunner.query(`DROP INDEX \`REL_fc20c5df43e9d750e2f9dd7037\` ON \`account\``);
        await queryRunner.query(`DROP INDEX \`IDX_4c8f96ccf523e9a3faefd5bdd4\` ON \`account\``);
        await queryRunner.query(`DROP TABLE \`account\``);
        await queryRunner.query(`DROP INDEX \`REL_fbaf4820bc548b46e1d5aa4e4d\` ON \`notification\``);
        await queryRunner.query(`DROP TABLE \`notification\``);
        await queryRunner.query(`DROP TABLE \`friend_request\``);
        await queryRunner.query(`DROP TABLE \`network_file\``);
        await queryRunner.query(`DROP INDEX \`REL_e3631e9ea9ee3fd6e8fa90928b\` ON \`chat_room\``);
        await queryRunner.query(`DROP TABLE \`chat_room\``);
        await queryRunner.query(`DROP TABLE \`message\``);
        await queryRunner.query(`DROP TABLE \`react\``);
        await queryRunner.query(`DROP TABLE \`member\``);
    }

}

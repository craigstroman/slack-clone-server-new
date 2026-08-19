import { MigrationInterface, QueryRunner } from 'typeorm';
import path from 'path';
import argon2 from 'argon2';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export class user1758653539437 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const passwordText = process.env.TEST_PASSWORD || '';
    const passwordHash = await argon2.hash(passwordText);

    await queryRunner.query(
      `
                CREATE TABLE IF NOT EXISTS public."user"
                (
                    id integer NOT NULL DEFAULT nextval('user_id_seq'::regclass),
                    createdAt timestamp without time zone NOT NULL DEFAULT now(),
                    updatedAt timestamp without time zone NOT NULL DEFAULT now(),
                    first_name character varying COLLATE pg_catalog."default" NOT NULL,
                    last_name character varying COLLATE pg_catalog."default" NOT NULL,
                    email character varying COLLATE pg_catalog."default" NOT NULL,
                    username character varying COLLATE pg_catalog."default" NOT NULL,
                    password character varying COLLATE pg_catalog."default" NOT NULL,
                    CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id),
                    CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE (username),
                    CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE (email)
                ); 
            `,
    );

    await queryRunner.query(
      `
        insert into public."user" (id, first_name, last_name, email, username, password, "createdAt", "updatedAt")
        values (1, 'Craig','Stroman','cstroman@gmail.com','craig3030', '${passwordHash}', '2026-03-09 19:46:52.484862','2026-03-09 19:46:52.484862')
      `,
    );

    await queryRunner.query(
      `
        insert into public."user" (id, first_name, last_name, email, username, password, "createdAt", "updatedAt")
        values (2, 'Paul', 'Wilson', 'pwilson123@temp-mail.org', 'pwilson4040', '${passwordHash}', '2026-03-09 19:46:52.484862', '2026-03-09 19:46:52.484862')
      `,
    );

    await queryRunner.query(
      `
        insert into public."user" (id, first_name, last_name, email, username, password, "createdAt", "updatedAt")
        values (3, 'Sean', 'Smith', 's-smith123@temp-mail.org', 'ssmith5050', '${passwordHash}', '2026-03-09 19:46:52.484862', '2026-03-09 19:46:52.484862')
      `,
    );

    await queryRunner.query(
      `
        insert into public."user" (id, first_name, last_name, email, username, password, "createdAt", "updatedAt")
        values (4, 'Jeff', 'Buckley', 'j-buckley123@temp-mail.org', 'jbuckley123', '${passwordHash}', '2026-03-09 19:46:52.484862', '2026-03-09 19:46:52.484862')
      `,
    );
  }
}

import { MigrationInterface, QueryRunner } from "typeorm";

export class ChatMessage1787169340920 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
            await queryRunner.query(
      `
                CREATE TABLE IF NOT EXISTS public."chatMessage"
                (
                    id integer NOT NULL DEFAULT nextval('user_id_seq'::regclass),
                    createdAt timestamp without time zone NOT NULL DEFAULT now(),
                    updatedAt timestamp without time zone NOT NULL DEFAULT now(),
                    text character varying COLLATE pg_catalog."default" NOT NULL,
                    user_id integer COLLATE pg_catalog."default" NOT NULL,
                ); 
            `,
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}

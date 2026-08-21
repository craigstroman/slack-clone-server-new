import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChatRoom1787169331603 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
                CREATE TABLE IF NOT EXISTS public."chatroom"
                (
                    id integer NOT NULL DEFAULT nextval('user_id_seq'::regclass),
                    createdAt timestamp without time zone NOT NULL DEFAULT now(),
                    updatedAt timestamp without time zone NOT NULL DEFAULT now(),
                    name character varying COLLATE pg_catalog."default" NOT NULL,
                    user_id integer COLLATE pg_catalog."default" NOT NULL,
                    CONSTRAINT "FK_fd6b77bfdf9eae6691170bc9cb5" FOREIGN KEY ("roomId")
                        REFERENCES public.chatmessage (id) MATCH SIMPLE
                        ON UPDATE NO ACTION
                        ON DELETE NO ACTION
                ); 
            `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}

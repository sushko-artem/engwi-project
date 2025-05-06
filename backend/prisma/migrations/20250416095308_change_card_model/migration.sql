/*
  Warnings:

  - The primary key for the `cards` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `word` on the `cards` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `translation` on the `cards` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- AlterTable
ALTER TABLE "cards" DROP CONSTRAINT "cards_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "word" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "translation" SET DATA TYPE VARCHAR(255),
ADD CONSTRAINT "cards_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "cards_id_seq";

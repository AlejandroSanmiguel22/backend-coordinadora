/*
  Warnings:

  - Added the required column `userName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `userName` VARCHAR(191) NOT NULL,
    MODIFY `role` VARCHAR(191) NULL DEFAULT 'user';

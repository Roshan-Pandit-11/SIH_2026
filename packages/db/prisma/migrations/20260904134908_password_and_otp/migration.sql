/*
  Warnings:

  - Added the required column `purpose` to the `EmailOtp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('EMAIL_VERIFY', 'PASSWORD_RESET');

-- DropIndex
DROP INDEX "EmailOtp_email_idx";

-- AlterTable
ALTER TABLE "EmailOtp" ADD COLUMN     "purpose" "OtpPurpose" NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "EmailOtp_email_purpose_idx" ON "EmailOtp"("email", "purpose");

/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `EmailOtp` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EmailOtp_email_key" ON "EmailOtp"("email");

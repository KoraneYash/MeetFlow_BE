/*
  Warnings:

  - A unique constraint covering the columns `[meetingId,guestEmail]` on the table `Participant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Participant_meetingId_guestEmail_key" ON "Participant"("meetingId", "guestEmail");

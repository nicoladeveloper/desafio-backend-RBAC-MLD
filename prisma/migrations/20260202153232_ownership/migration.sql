-- AlterTable
ALTER TABLE "funcionarios" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "updatedByUserId" TEXT;

-- AddForeignKey
ALTER TABLE "funcionarios" ADD CONSTRAINT "funcionarios_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "funcionarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

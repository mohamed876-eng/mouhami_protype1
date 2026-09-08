-- AlterTable
ALTER TABLE "cases" ADD COLUMN     "caseTypeId" UUID;

-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "checklistItemId" UUID;

-- CreateTable
CREATE TABLE "case_types" (
    "id" UUID NOT NULL,
    "nameAr" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "case_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_type_documents" (
    "id" UUID NOT NULL,
    "nameAr" TEXT NOT NULL,
    "description" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "caseTypeId" UUID NOT NULL,

    CONSTRAINT "case_type_documents_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_caseTypeId_fkey" FOREIGN KEY ("caseTypeId") REFERENCES "case_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_type_documents" ADD CONSTRAINT "case_type_documents_caseTypeId_fkey" FOREIGN KEY ("caseTypeId") REFERENCES "case_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_checklistItemId_fkey" FOREIGN KEY ("checklistItemId") REFERENCES "case_checklist_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

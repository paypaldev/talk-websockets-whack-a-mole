-- CreateTable
CREATE TABLE "disqualified_names" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "reason" VARCHAR(200),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "disqualified_names_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: case-insensitive uniqueness enforced at the DB level
CREATE UNIQUE INDEX "disqualified_names_name_lower_key" ON "disqualified_names"(lower("name"));

-- CreateIndex
CREATE INDEX "disqualified_names_createdAt_idx" ON "disqualified_names"("createdAt");

-- Enable RLS — this table is admin-only; no public role should read or write it.
ALTER TABLE public.disqualified_names ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.disqualified_names FROM anon, authenticated;

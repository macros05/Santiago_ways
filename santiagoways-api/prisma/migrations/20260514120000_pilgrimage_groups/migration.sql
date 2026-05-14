-- PilgrimageGroup
CREATE TABLE "PilgrimageGroup" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "routeId" TEXT NOT NULL,
  "year" INTEGER NOT NULL,
  "ownerId" TEXT NOT NULL,
  "isPublic" BOOLEAN NOT NULL DEFAULT true,
  "coverImage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PilgrimageGroup_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PilgrimageGroup_routeId_year_idx" ON "PilgrimageGroup"("routeId", "year");
CREATE INDEX "PilgrimageGroup_ownerId_idx" ON "PilgrimageGroup"("ownerId");
CREATE INDEX "PilgrimageGroup_isPublic_year_idx" ON "PilgrimageGroup"("isPublic", "year");
ALTER TABLE "PilgrimageGroup" ADD CONSTRAINT "PilgrimageGroup_routeId_fkey"
  FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PilgrimageGroup" ADD CONSTRAINT "PilgrimageGroup_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- PilgrimageGroupMember
CREATE TABLE "PilgrimageGroupMember" (
  "groupId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'member',
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PilgrimageGroupMember_pkey" PRIMARY KEY ("groupId", "userId")
);
CREATE INDEX "PilgrimageGroupMember_userId_idx" ON "PilgrimageGroupMember"("userId");
ALTER TABLE "PilgrimageGroupMember" ADD CONSTRAINT "PilgrimageGroupMember_groupId_fkey"
  FOREIGN KEY ("groupId") REFERENCES "PilgrimageGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PilgrimageGroupMember" ADD CONSTRAINT "PilgrimageGroupMember_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

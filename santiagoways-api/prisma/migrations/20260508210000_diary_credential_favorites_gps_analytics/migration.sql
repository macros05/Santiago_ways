-- DiaryEntry
CREATE TABLE "DiaryEntry" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "stageId" TEXT,
  "pilgrimageId" TEXT,
  "date" TIMESTAMP(3) NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "images" TEXT[],
  "mood" TEXT,
  "weather" TEXT,
  "isPrivate" BOOLEAN NOT NULL DEFAULT true,
  "shareToken" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DiaryEntry_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "DiaryEntry_shareToken_key" ON "DiaryEntry"("shareToken");
CREATE INDEX "DiaryEntry_userId_date_idx" ON "DiaryEntry"("userId", "date");
CREATE INDEX "DiaryEntry_pilgrimageId_idx" ON "DiaryEntry"("pilgrimageId");
CREATE INDEX "DiaryEntry_stageId_idx" ON "DiaryEntry"("stageId");
ALTER TABLE "DiaryEntry" ADD CONSTRAINT "DiaryEntry_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CredentialStamp
CREATE TABLE "CredentialStamp" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "pilgrimageId" TEXT,
  "placeSlug" TEXT NOT NULL,
  "placeName" TEXT NOT NULL,
  "city" TEXT,
  "lat" DOUBLE PRECISION NOT NULL,
  "lng" DOUBLE PRECISION NOT NULL,
  "method" TEXT NOT NULL,
  "stampedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CredentialStamp_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CredentialStamp_userId_pilgrimageId_placeSlug_key"
  ON "CredentialStamp"("userId", "pilgrimageId", "placeSlug");
CREATE INDEX "CredentialStamp_userId_idx" ON "CredentialStamp"("userId");
CREATE INDEX "CredentialStamp_pilgrimageId_idx" ON "CredentialStamp"("pilgrimageId");
ALTER TABLE "CredentialStamp" ADD CONSTRAINT "CredentialStamp_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlbergueFavorite
CREATE TABLE "AlbergueFavorite" (
  "userId" TEXT NOT NULL,
  "albergueId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AlbergueFavorite_pkey" PRIMARY KEY ("userId", "albergueId")
);
CREATE INDEX "AlbergueFavorite_albergueId_idx" ON "AlbergueFavorite"("albergueId");
ALTER TABLE "AlbergueFavorite" ADD CONSTRAINT "AlbergueFavorite_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- GpsPoint
CREATE TABLE "GpsPoint" (
  "id" TEXT NOT NULL,
  "pilgrimageId" TEXT NOT NULL,
  "recordedAt" TIMESTAMP(3) NOT NULL,
  "lat" DOUBLE PRECISION NOT NULL,
  "lng" DOUBLE PRECISION NOT NULL,
  "altitude" DOUBLE PRECISION,
  "speed" DOUBLE PRECISION,
  "accuracy" DOUBLE PRECISION,
  CONSTRAINT "GpsPoint_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "GpsPoint_pilgrimageId_recordedAt_idx" ON "GpsPoint"("pilgrimageId", "recordedAt");

-- AnalyticsEvent
CREATE TABLE "AnalyticsEvent" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "name" TEXT NOT NULL,
  "props" JSONB,
  "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AnalyticsEvent_name_ts_idx" ON "AnalyticsEvent"("name", "ts");
CREATE INDEX "AnalyticsEvent_userId_ts_idx" ON "AnalyticsEvent"("userId", "ts");
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

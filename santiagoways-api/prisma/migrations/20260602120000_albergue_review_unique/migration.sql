-- Enforce one review per user per albergue (prevents rating manipulation / spam).
-- Deduplicate any pre-existing pairs first, keeping the most recent row, so the
-- unique index can be created safely on databases that already hold duplicates.
DELETE FROM "AlbergueReview" a
USING "AlbergueReview" b
WHERE a."userId" = b."userId"
  AND a."albergueId" = b."albergueId"
  AND (a."createdAt" < b."createdAt"
       OR (a."createdAt" = b."createdAt" AND a."id" < b."id"));

CREATE UNIQUE INDEX "AlbergueReview_userId_albergueId_key"
  ON "AlbergueReview"("userId", "albergueId");

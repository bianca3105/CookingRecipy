-- DropIndex
DROP INDEX "MenuEntry_weekId_dayIndex_mealType_key";

-- CreateIndex
CREATE INDEX "MenuEntry_weekId_dayIndex_mealType_idx" ON "MenuEntry"("weekId", "dayIndex", "mealType");

-- CreateIndex
CREATE UNIQUE INDEX "MenuEntry_weekId_dayIndex_mealType_recipeId_key" ON "MenuEntry"("weekId", "dayIndex", "mealType", "recipeId");


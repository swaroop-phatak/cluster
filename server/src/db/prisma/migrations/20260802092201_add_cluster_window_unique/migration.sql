/*
  Warnings:

  - A unique constraint covering the columns `[company_id,window_start,window_end]` on the table `clusters` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "clusters_company_id_window_start_window_end_key" ON "clusters"("company_id", "window_start", "window_end");

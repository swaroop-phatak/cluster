-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "ClusterStatus" AS ENUM ('active', 'superseded');

-- CreateEnum
CREATE TYPE "Channel" AS ENUM ('email');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('pending', 'sent', 'failed');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'user',
    "refresh_token_version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "cik" TEXT NOT NULL,
    "ticker" TEXT,
    "name" TEXT NOT NULL,
    "sector" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insiders" (
    "id" TEXT NOT NULL,
    "cik" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insiders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insider_roles" (
    "id" TEXT NOT NULL,
    "insider_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "is_officer" BOOLEAN NOT NULL,
    "is_director" BOOLEAN NOT NULL,
    "is_ten_percent_owner" BOOLEAN NOT NULL,
    "effective_date" TIMESTAMP(3),

    CONSTRAINT "insider_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "filings" (
    "id" TEXT NOT NULL,
    "form_type" TEXT NOT NULL DEFAULT '4',
    "filing_date" TIMESTAMP(3) NOT NULL,
    "period_of_report" TIMESTAMP(3) NOT NULL,
    "raw_url" TEXT NOT NULL,
    "raw_payload" JSONB NOT NULL,
    "accession_number" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "insider_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parsed_at" TIMESTAMP(3),

    CONSTRAINT "filings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "filing_id" TEXT NOT NULL,
    "transaction_code" TEXT NOT NULL,
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "shares" DECIMAL(65,30) NOT NULL,
    "price_per_share" DECIMAL(65,30),
    "shares_owned_after" DECIMAL(65,30) NOT NULL,
    "total_value" DECIMAL(65,30),
    "is_derivative" BOOLEAN NOT NULL,
    "is_10b5_1" BOOLEAN NOT NULL DEFAULT false,
    "direct_or_indirect" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clusters" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "window_start" TIMESTAMP(3) NOT NULL,
    "window_end" TIMESTAMP(3) NOT NULL,
    "insider_count" INTEGER NOT NULL,
    "total_value" DECIMAL(65,30) NOT NULL,
    "score" DECIMAL(65,30) NOT NULL,
    "status" "ClusterStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clusters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cluster_transactions" (
    "cluster_id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,

    CONSTRAINT "cluster_transactions_pkey" PRIMARY KEY ("cluster_id","transaction_id")
);

-- CreateTable
CREATE TABLE "watchlists" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "watchlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "cluster_id" TEXT NOT NULL,
    "channel" "Channel" NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'pending',
    "sent_at" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "companies_cik_key" ON "companies"("cik");

-- CreateIndex
CREATE INDEX "companies_ticker_idx" ON "companies"("ticker");

-- CreateIndex
CREATE UNIQUE INDEX "insiders_cik_key" ON "insiders"("cik");

-- CreateIndex
CREATE UNIQUE INDEX "insider_roles_insider_id_company_id_key" ON "insider_roles"("insider_id", "company_id");

-- CreateIndex
CREATE UNIQUE INDEX "filings_accession_number_key" ON "filings"("accession_number");

-- CreateIndex
CREATE INDEX "filings_company_id_filing_date_idx" ON "filings"("company_id", "filing_date");

-- CreateIndex
CREATE INDEX "transactions_filing_id_idx" ON "transactions"("filing_id");

-- CreateIndex
CREATE INDEX "transactions_transaction_code_idx" ON "transactions"("transaction_code");

-- CreateIndex
CREATE INDEX "transactions_transaction_date_idx" ON "transactions"("transaction_date");

-- CreateIndex
CREATE INDEX "transactions_transaction_code_is_10b5_1_transaction_date_idx" ON "transactions"("transaction_code", "is_10b5_1", "transaction_date");

-- CreateIndex
CREATE INDEX "clusters_company_id_window_start_idx" ON "clusters"("company_id", "window_start");

-- CreateIndex
CREATE INDEX "clusters_score_idx" ON "clusters"("score");

-- CreateIndex
CREATE UNIQUE INDEX "watchlists_user_id_company_id_key" ON "watchlists"("user_id", "company_id");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_user_id_cluster_id_channel_key" ON "notifications"("user_id", "cluster_id", "channel");

-- AddForeignKey
ALTER TABLE "insider_roles" ADD CONSTRAINT "insider_roles_insider_id_fkey" FOREIGN KEY ("insider_id") REFERENCES "insiders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insider_roles" ADD CONSTRAINT "insider_roles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filings" ADD CONSTRAINT "filings_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filings" ADD CONSTRAINT "filings_insider_id_fkey" FOREIGN KEY ("insider_id") REFERENCES "insiders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_filing_id_fkey" FOREIGN KEY ("filing_id") REFERENCES "filings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clusters" ADD CONSTRAINT "clusters_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cluster_transactions" ADD CONSTRAINT "cluster_transactions_cluster_id_fkey" FOREIGN KEY ("cluster_id") REFERENCES "clusters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cluster_transactions" ADD CONSTRAINT "cluster_transactions_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlists" ADD CONSTRAINT "watchlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlists" ADD CONSTRAINT "watchlists_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_cluster_id_fkey" FOREIGN KEY ("cluster_id") REFERENCES "clusters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

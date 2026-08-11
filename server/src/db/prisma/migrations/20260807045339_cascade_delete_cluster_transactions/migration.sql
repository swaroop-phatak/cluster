-- DropForeignKey
ALTER TABLE "cluster_transactions" DROP CONSTRAINT "cluster_transactions_cluster_id_fkey";

-- DropForeignKey
ALTER TABLE "cluster_transactions" DROP CONSTRAINT "cluster_transactions_transaction_id_fkey";

-- AddForeignKey
ALTER TABLE "cluster_transactions" ADD CONSTRAINT "cluster_transactions_cluster_id_fkey" FOREIGN KEY ("cluster_id") REFERENCES "clusters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cluster_transactions" ADD CONSTRAINT "cluster_transactions_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

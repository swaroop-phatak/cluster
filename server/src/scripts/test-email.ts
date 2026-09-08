import "dotenv/config";
import { sendAlertEmail } from "../external/email.client";

async function main() {
  const to = process.env.SMTP_USER;

  if (!to) {
    throw new Error("SMTP_USER is missing from .env");
  }

  await sendAlertEmail(
    to,
    "Cluster Alert Test",
    "This is a test email from the Cluster application.",
  );

  console.log("Email test complete.");
}

main()
  .catch(console.error)
  .finally(() => process.exit());
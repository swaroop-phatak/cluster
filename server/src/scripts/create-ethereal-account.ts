import nodemailer from "nodemailer";

async function main() {
  const testAccount = await nodemailer.createTestAccount();

  console.log("SMTP_HOST=", testAccount.smtp.host);
  console.log("SMTP_PORT=", testAccount.smtp.port);
  console.log("SMTP_SECURE=", testAccount.smtp.secure);
  console.log("SMTP_USER=", testAccount.user);
  console.log("SMTP_PASSWORD=", testAccount.pass);
}

main().catch(console.error);
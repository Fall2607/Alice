const nodemailer = require("nodemailer");
require("dotenv").config({ path: "c:/Next/Alice/.env.local" });

async function run() {
    console.log("Config:", {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true",
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true", 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    try {
        await transporter.sendMail({
            from: `"Test IT" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER, // send to self
            subject: "Test email",
            text: "This is a test email"
        });
        console.log("Mail sent successfully!");
    } catch (e) {
        console.log("Error sending mail:", e);
    }
    process.exit(0);
}
run();

import { injectable } from "inversify";
import { IEmailService, EmailData } from "../../application/ports/external/IEmailService";

/**
 * Console Email Service (for development)
 * Replace with real SMTP service in production
 */
@injectable()
export class ConsoleEmailService implements IEmailService {
    async send(data: EmailData): Promise<void> {
        console.log("=".repeat(60));
        console.log("[EMAIL] Sending email...");
        console.log(`To: ${data.to}`);
        console.log(`Subject: ${data.subject}`);
        console.log(`Body:\n${data.body}`);
        console.log("=".repeat(60));

        // TODO: Replace with real email service
        // Example: using Nodemailer
        // const transporter = nodemailer.createTransport({...});
        // await transporter.sendMail({from, to: data.to, subject: data.subject, text: data.body});
    }
}

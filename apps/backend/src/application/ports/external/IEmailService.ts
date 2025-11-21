export interface EmailData {
    to: string;
    subject: string;
    body: string;
    html?: string;
}

export interface IEmailService {
    send(data: EmailData): Promise<void>;
}

export const IEmailService = Symbol.for("IEmailService");

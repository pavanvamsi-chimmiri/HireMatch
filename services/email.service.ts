import { Resend } from "resend";
import { serverEnv } from "@/lib/env";

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!serverEnv.RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY environment variable");
  }

  if (!resendClient) {
    resendClient = new Resend(serverEnv.RESEND_API_KEY);
  }

  return resendClient;
}

export type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const resend = getResendClient();
  const from =
    serverEnv.RESEND_FROM_EMAIL ?? "HireMatch AI <noreply@hirematch.ai>";

  return resend.emails.send({
    from,
    to,
    subject,
    html,
    text,
  });
}

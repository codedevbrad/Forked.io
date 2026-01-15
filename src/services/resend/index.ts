"use server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendEmail({
  from,
  to,
  subject,
  html,
}: {
  from?: string;
  to?: string | string[];
  subject: string;
  html: string;
}) {
  try {

    const toDefault = "bradlumber.dev@gmail.com"
    const fromDefault = "onboarding@resend.dev"

    console.log("sending email to:", toDefault , "from:", fromDefault );

    const response = await resend.emails.send({
      from: fromDefault,
      to: toDefault,
      subject,
      html,
    });

    console.log("Resend email sent successfully");

    return {
      ok: true,
      response,
    };
  } catch (error) {
    console.error("Resend error:", error);

    return {
      ok: false,
      error,
    };
  }
}

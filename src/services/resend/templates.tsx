export function ProspectSavedEmailTemplate({
  prospectName,
  website,
  description,
  customMessage,
  savedBy,
}: {
  prospectName: string;
  website: string;
  description?: string;
  customMessage?: string;
  savedBy?: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Prospect Saved</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: #2563eb; margin-top: 0;">New Prospect Saved</h1>
          <p style="margin-bottom: 0;">A new prospect has been saved to your CRM system.</p>
        </div>

        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937; margin-top: 0;">${prospectName}</h2>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #4b5563;">Website:</strong>
            <a href="${website}" style="color: #2563eb; text-decoration: none; margin-left: 8px;">${website}</a>
          </div>

          ${description ? `
            <div style="margin-bottom: 15px;">
              <strong style="color: #4b5563;">Description:</strong>
              <p style="margin-top: 5px; color: #6b7280;">${description}</p>
            </div>
          ` : ''}

          ${customMessage ? `
            <div style="margin-bottom: 15px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
              <strong style="color: #92400e;">Custom Message:</strong>
              <p style="margin-top: 5px; color: #78350f;">${customMessage}</p>
            </div>
          ` : ''}

          ${savedBy ? `
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">Saved by: ${savedBy}</p>
            </div>
          ` : ''}
        </div>

        <div style="margin-top: 20px; padding: 15px; background-color: #f0f9ff; border-radius: 8px;">
          <p style="margin: 0; color: #1e40af; font-size: 14px;">
            You can view and manage this prospect in your CRM dashboard.
          </p>
        </div>
      </body>
    </html>
  `;
}

export function LeadSavedEmailTemplate({
  leadName,
  company,
  email,
  phone,
  service,
  amount,
  source,
  status,
  notes,
  type,
  customMessage,
  savedBy,
}: {
  leadName: string;
  company?: string;
  email?: string;
  phone?: string;
  service?: string;
  amount?: string | number;
  source?: string;
  status?: string;
  notes?: string;
  type?: string;
  customMessage?: string;
  savedBy?: string;
}) {
  const formatAmount = (amt: string | number | undefined) => {
    if (!amt) return "N/A";
    const num = typeof amt === "string" ? parseInt(amt, 10) : amt;
    return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(num);
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Lead Saved</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: #2563eb; margin-top: 0;">New Lead Saved</h1>
          <p style="margin-bottom: 0;">A new lead has been saved to your CRM system.</p>
        </div>

        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937; margin-top: 0;">${leadName}</h2>
          
          ${company ? `
            <div style="margin-bottom: 15px;">
              <strong style="color: #4b5563;">Company:</strong>
              <span style="margin-left: 8px; color: #6b7280;">${company}</span>
            </div>
          ` : ''}

          <div style="margin-bottom: 15px; display: flex; flex-wrap: wrap; gap: 15px;">
            ${email ? `
              <div>
                <strong style="color: #4b5563;">Email:</strong>
                <a href="mailto:${email}" style="color: #2563eb; text-decoration: none; margin-left: 8px;">${email}</a>
              </div>
            ` : ''}
            ${phone ? `
              <div>
                <strong style="color: #4b5563;">Phone:</strong>
                <a href="tel:${phone}" style="color: #2563eb; text-decoration: none; margin-left: 8px;">${phone}</a>
              </div>
            ` : ''}
          </div>

          <div style="margin-bottom: 15px; display: flex; flex-wrap: wrap; gap: 15px;">
            ${service ? `
              <div>
                <strong style="color: #4b5563;">Service:</strong>
                <span style="margin-left: 8px; color: #6b7280;">${service}</span>
              </div>
            ` : ''}
            ${amount ? `
              <div>
                <strong style="color: #4b5563;">Amount:</strong>
                <span style="margin-left: 8px; color: #6b7280;">${formatAmount(amount)}</span>
              </div>
            ` : ''}
          </div>

          <div style="margin-bottom: 15px; display: flex; flex-wrap: wrap; gap: 15px;">
            ${source ? `
              <div>
                <strong style="color: #4b5563;">Source:</strong>
                <span style="margin-left: 8px; color: #6b7280;">${source}</span>
              </div>
            ` : ''}
            ${status ? `
              <div>
                <strong style="color: #4b5563;">Status:</strong>
                <span style="margin-left: 8px; color: #6b7280; text-transform: capitalize;">${status.toLowerCase().replace("_", " ")}</span>
              </div>
            ` : ''}
            ${type ? `
              <div>
                <strong style="color: #4b5563;">Type:</strong>
                <span style="margin-left: 8px; color: #6b7280;">${type}</span>
              </div>
            ` : ''}
          </div>

          ${notes ? `
            <div style="margin-bottom: 15px;">
              <strong style="color: #4b5563;">Notes:</strong>
              <p style="margin-top: 5px; color: #6b7280;">${notes}</p>
            </div>
          ` : ''}

          ${customMessage ? `
            <div style="margin-bottom: 15px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
              <strong style="color: #92400e;">Custom Message:</strong>
              <p style="margin-top: 5px; color: #78350f;">${customMessage}</p>
            </div>
          ` : ''}

          ${savedBy ? `
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">Saved by: ${savedBy}</p>
            </div>
          ` : ''}
        </div>

        <div style="margin-top: 20px; padding: 15px; background-color: #f0f9ff; border-radius: 8px;">
          <p style="margin: 0; color: #1e40af; font-size: 14px;">
            You can view and manage this lead in your CRM dashboard.
          </p>
        </div>
      </body>
    </html>
  `;
}


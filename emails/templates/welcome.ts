export function welcomeEmailHtml(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Welcome to HireMatch AI</title>
      </head>
      <body style="font-family: sans-serif; line-height: 1.6; color: #1a1a2e;">
        <h1>Welcome to HireMatch AI, ${name}!</h1>
        <p>We're excited to have you on board. Start matching top talent with the right roles today.</p>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}"
             style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px;">
            Get Started
          </a>
        </p>
      </body>
    </html>
  `;
}

export function welcomeEmailText(name: string): string {
  return `Welcome to HireMatch AI, ${name}!\n\nWe're excited to have you on board. Visit ${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"} to get started.`;
}

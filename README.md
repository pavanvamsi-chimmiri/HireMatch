# HireMatch AI

AI-powered recruitment platform built with Next.js 15, React 19, and modern tooling.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19, Tailwind CSS 4, Shadcn UI, Framer Motion
- **Database:** PostgreSQL with Prisma ORM
- **Auth (planned):** Supabase
- **AI:** OpenAI API
- **Email:** Resend API

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Generate Prisma client
npm run db:generate

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
├── app/              # Next.js App Router pages and layouts
├── components/       # React components (ui, layout, landing)
├── lib/              # Core utilities, env, database clients
├── services/         # External service integrations
├── hooks/            # Custom React hooks
├── actions/          # Server actions
├── prisma/           # Database schema and migrations
├── types/            # TypeScript type definitions
├── utils/            # Helper functions
├── ai/               # OpenAI client and prompts
├── emails/           # Email templates
└── middleware.ts     # Next.js middleware
```

## Environment Variables

See `.env.example` for all required variables:

| Variable                        | Description                  |
| ------------------------------- | ---------------------------- |
| `DATABASE_URL`                  | PostgreSQL connection string |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key       |
| `OPENAI_API_KEY`                | OpenAI API key               |
| `RESEND_API_KEY`                | Resend email API key         |

## Scripts

| Command               | Description               |
| --------------------- | ------------------------- |
| `npm run dev`         | Start development server  |
| `npm run build`       | Build for production      |
| `npm run lint`        | Run ESLint                |
| `npm run format`      | Format code with Prettier |
| `npm run db:generate` | Generate Prisma client    |
| `npm run db:migrate`  | Run database migrations   |
| `npm run db:studio`   | Open Prisma Studio        |

## License

Private — All rights reserved.

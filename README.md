# HireMatch AI

AI-powered recruitment platform built with Next.js 15, React 19, and modern tooling.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19, Tailwind CSS 4, Shadcn UI, Framer Motion
- **Database:** PostgreSQL (Supabase) with Prisma ORM
- **Auth:** Supabase Authentication
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

# Run migrations
npm run db:migrate

# Seed sample data
npm run db:seed

# Start development server
npm run dev
```

See [`prisma/SCHEMA.md`](prisma/SCHEMA.md) for the full database schema and relationships.

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

## Authentication

HireMatch AI uses **Supabase Authentication** with role-based access control.

### Roles

| Role        | Dashboard              | Description                    |
| ----------- | ---------------------- | ------------------------------ |
| `HR`        | `/dashboard/hr`        | Recruiters and hiring managers |
| `CANDIDATE` | `/dashboard/candidate` | Job seekers                    |

User roles are stored in both Supabase `user_metadata` and the Prisma `User` table.

### Auth Flow

1. **Register** at `/register` — select HR or Candidate role
2. **Profile setup** at `/profile` — required on first login
3. **Dashboard redirect** — HR → `/dashboard/hr`, Candidate → `/dashboard/candidate`

### Supabase Setup

1. Create a Supabase project and add credentials to `.env`
2. In **Authentication → URL Configuration**, set:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`
3. Enable Email provider under **Authentication → Providers**
4. Push the database schema:

```bash
npm run db:push
```

### Protected Routes

Middleware protects:

- `/dashboard/*` — requires authentication and matching role
- `/profile` — requires authentication

| Command               | Description               |
| --------------------- | ------------------------- |
| `npm run dev`         | Start development server  |
| `npm run build`       | Build for production      |
| `npm run lint`        | Run ESLint                |
| `npm run format`      | Format code with Prettier |
| `npm run db:generate` | Generate Prisma client    |
| `npm run db:migrate`  | Run database migrations   |
| `npm run db:seed`     | Seed sample data          |
| `npm run db:reset`    | Reset DB and re-seed      |
| `npm run db:studio`   | Open Prisma Studio        |

## License

Private — All rights reserved.

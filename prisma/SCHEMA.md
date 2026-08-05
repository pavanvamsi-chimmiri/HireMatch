# HireMatch AI — Database Schema

PostgreSQL database managed via **Prisma ORM** and hosted on **Supabase**.

## Tables

| Table                | Model              | Description                         |
| -------------------- | ------------------ | ----------------------------------- |
| `users`              | `User`             | Core auth entity linked to Supabase |
| `candidate_profiles` | `CandidateProfile` | Extended profile for candidates     |
| `hr_profiles`        | `HRProfile`        | Extended profile for HR users       |
| `companies`          | `Company`          | Organizations posting jobs          |
| `jobs`               | `Job`              | Job listings                        |
| `applications`       | `Application`      | Candidate applications to jobs      |
| `resumes`            | `Resume`           | Uploaded candidate resumes          |
| `resume_analyses`    | `ResumeAnalysis`   | AI analysis results                 |
| `notifications`      | `Notification`     | In-app user notifications           |
| `emails`             | `Email`            | Email delivery log                  |
| `candidate_rankings` | `CandidateRanking` | AI-ranked candidates per job        |
| `settings`           | `Setting`          | User and system settings            |

## Entity Relationships

```mermaid
erDiagram
    User ||--o| CandidateProfile : has
    User ||--o| HRProfile : has
    User ||--o{ Application : submits
    User ||--o{ Resume : uploads
    User ||--o{ Job : posts
    User ||--o{ Notification : receives
    User ||--o{ Email : receives
    User ||--o{ Setting : configures
    User ||--o{ CandidateRanking : ranked_as

    Company ||--o{ HRProfile : employs
    Company ||--o{ Job : publishes

    HRProfile }o--|| User : belongs_to
    HRProfile }o--o| Company : works_at

    CandidateProfile }o--|| User : belongs_to

    Job }o--|| Company : at
    Job }o--|| User : posted_by
    Job ||--o{ Application : receives
    Job ||--o{ CandidateRanking : ranks_for
    Job ||--o{ ResumeAnalysis : analyzed_for

    Application }o--|| Job : for
    Application }o--|| User : by
    Application }o--o| Resume : includes
    Application ||--o| CandidateRanking : has
    Application ||--o{ ResumeAnalysis : analyzed_in

    Resume }o--|| User : owned_by
    Resume ||--o{ ResumeAnalysis : analyzed

    ResumeAnalysis }o--|| Resume : of
    ResumeAnalysis }o--o| Application : for
    ResumeAnalysis }o--o| Job : against

    CandidateRanking }o--|| Job : for
    CandidateRanking }o--|| User : candidate
    CandidateRanking }o--o| Application : from

    Notification }o--|| User : to
    Email }o--o| User : to
    Setting }o--o| User : for
```

## Key Relationships

### Users → Profiles (1:1)

- Every **Candidate** user has one `CandidateProfile`
- Every **HR** user has one `HRProfile`
- Profiles are auto-created on registration

### Company → Jobs → Applications

```
Company ──< Job ──< Application >── User (Candidate)
```

### Resume → Analysis Pipeline

```
User ──< Resume ──< ResumeAnalysis
                      ↑
              Application / Job
```

### AI Ranking Flow

```
Job ──< CandidateRanking >── User (Candidate)
         ↑
    Application
```

## Commands

```bash
# Apply migrations to Supabase/PostgreSQL
npm run db:migrate

# Push schema without migration (dev)
npm run db:push

# Seed sample data
npm run db:seed

# Reset database and re-seed
npm run db:reset

# Open Prisma Studio
npm run db:studio
```

## Migrations

| Migration                                 | Description                                |
| ----------------------------------------- | ------------------------------------------ |
| `20250805130800_complete_database_schema` | Initial complete schema with all 12 tables |

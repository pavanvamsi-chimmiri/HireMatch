import type { Prisma } from "@prisma/client";

export type UserWithCompany = Prisma.UserGetPayload<{
  include: { company: true };
}>;

export type JobWithRelations = Prisma.JobGetPayload<{
  include: {
    company: true;
    recruiter: true;
    applications: true;
  };
}>;

export type ApplicationWithRelations = Prisma.ApplicationGetPayload<{
  include: {
    job: true;
    user: true;
  };
}>;

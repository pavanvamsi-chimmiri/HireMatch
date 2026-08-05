"use client";

import {
  BarChart3,
  Brain,
  Clock,
  FileSearch,
  Shield,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Feature } from "@/types";

const features: Feature[] = [
  {
    icon: "brain",
    title: "AI Candidate Matching",
    description:
      "Our AI analyzes resumes and job requirements to score candidate fit with 95% accuracy.",
  },
  {
    icon: "file-search",
    title: "Smart Resume Screening",
    description:
      "Automatically parse, rank, and summarize candidate profiles in seconds — not hours.",
  },
  {
    icon: "clock",
    title: "10x Faster Hiring",
    description:
      "Reduce time-to-hire with automated workflows, intelligent scheduling, and bulk actions.",
  },
  {
    icon: "bar-chart",
    title: "Analytics Dashboard",
    description:
      "Track pipeline health, conversion rates, and hiring metrics with real-time insights.",
  },
  {
    icon: "users",
    title: "Team Collaboration",
    description:
      "Share feedback, score candidates collaboratively, and keep your entire team aligned.",
  },
  {
    icon: "shield",
    title: "Bias-Free Hiring",
    description:
      "Structured evaluation criteria and blind screening help you build diverse, talented teams.",
  },
];

const iconMap = {
  brain: Brain,
  "file-search": FileSearch,
  clock: Clock,
  "bar-chart": BarChart3,
  users: Users,
  shield: Shield,
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function Features() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to hire better
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Powerful AI tools designed for modern recruiting teams who want to
            move fast without sacrificing quality.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => {
            const Icon = iconMap[feature.icon as keyof typeof iconMap];
            return (
              <motion.div key={feature.title} variants={item}>
                <Card className="group border-border/50 bg-card/50 h-full transition-all hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5">
                  <CardHeader>
                    <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/10 to-indigo-600/10 text-violet-600 transition-colors group-hover:from-violet-600 group-hover:to-indigo-600 group-hover:text-white dark:text-violet-400">
                      <Icon className="size-5" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight, Bot, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const stats = [
  { value: "10x", label: "Faster screening" },
  { value: "95%", label: "Match accuracy" },
  { value: "500+", label: "Companies trust us" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-violet-600/20 via-indigo-600/10 to-transparent blur-3xl" />
        <div className="absolute top-40 -left-40 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute top-20 -right-40 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          <Badge
            variant="secondary"
            className="mb-6 gap-1.5 border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-violet-700 dark:text-violet-300"
          >
            <Bot className="size-3.5" />
            AI-Powered Recruitment Platform
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Hire smarter with{" "}
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              AI-matched talent
            </span>
          </h1>

          <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl">
            HireMatch AI transforms your recruitment pipeline with intelligent
            candidate matching, automated screening, and data-driven hiring
            decisions — so you find the perfect fit, every time.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              asChild
              className="h-12 gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 px-8 text-base text-white shadow-xl shadow-violet-500/25 hover:from-violet-500 hover:to-indigo-500"
            >
              <Link href="/register">
                Start Free Trial
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-12 px-8 text-base"
            >
              <Link href="#features">
                <Zap className="mr-2 size-4" />
                See How It Works
              </Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-20 grid max-w-3xl grid-cols-3 gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              className="text-center"
            >
              <div className="text-foreground text-3xl font-bold sm:text-4xl">
                {stat.value}
              </div>
              <div className="text-muted-foreground mt-1 text-sm">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative mx-auto mt-20 max-w-5xl"
        >
          <div className="border-border/50 bg-card/50 overflow-hidden rounded-2xl border shadow-2xl shadow-violet-500/10 backdrop-blur-sm">
            <div className="border-border/50 bg-muted/50 flex items-center gap-2 border-b px-4 py-3">
              <div className="size-3 rounded-full bg-red-400" />
              <div className="size-3 rounded-full bg-yellow-400" />
              <div className="size-3 rounded-full bg-green-400" />
              <span className="text-muted-foreground ml-2 text-xs">
                HireMatch AI Dashboard
              </span>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
              {[
                { label: "Active Jobs", value: "24", change: "+3 this week" },
                {
                  label: "Candidates Matched",
                  value: "1,847",
                  change: "92% fit rate",
                },
                {
                  label: "Avg. Time to Hire",
                  value: "12 days",
                  change: "-40% vs avg",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="border-border/50 bg-background/80 rounded-xl border p-4"
                >
                  <p className="text-muted-foreground text-sm">{item.label}</p>
                  <p className="mt-1 text-2xl font-bold">{item.value}</p>
                  <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                    {item.change}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

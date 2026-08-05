"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FaqItem } from "@/types";

const faqs: FaqItem[] = [
  {
    question: "How does AI candidate matching work?",
    answer:
      "HireMatch AI analyzes job descriptions and candidate resumes using advanced language models. It scores each candidate on skills, experience, and cultural fit, providing a ranked shortlist with detailed match summaries.",
  },
  {
    question: "Is my candidate data secure?",
    answer:
      "Absolutely. We use enterprise-grade encryption, SOC 2 compliant infrastructure, and never train our AI models on your proprietary data. All data is stored securely with role-based access controls.",
  },
  {
    question: "Can I integrate with my existing ATS?",
    answer:
      "Yes! Professional and Enterprise plans include integrations with popular ATS platforms like Greenhouse, Lever, and Workday. We also offer a REST API for custom integrations.",
  },
  {
    question: "What's included in the free trial?",
    answer:
      "The 14-day free trial includes full access to the Professional plan — unlimited job postings, AI screening, analytics, and up to 10 team members. No credit card required to start.",
  },
  {
    question: "How accurate is the AI matching?",
    answer:
      "Our AI matching achieves 95% accuracy compared to human recruiter assessments, based on internal benchmarks. The model continuously improves as you provide feedback on candidate matches.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes, you can cancel your subscription at any time with no cancellation fees. Your data remains accessible for 30 days after cancellation, and you can export everything before your account closes.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Everything you need to know about HireMatch AI.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-12"
        >
          <Accordion className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.question} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-base font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}

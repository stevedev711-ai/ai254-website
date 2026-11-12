import { z } from "zod";

const trimmed = (max: number) => z.string().trim().max(max, `Must be ${max} characters or fewer`);
const optionalText = (max: number) =>
  trimmed(max).optional().transform((v) => (v ? v : undefined));

import { INTEREST_AREAS, ORGANISATION_TYPES, TIME_SLOTS } from "./form-options";
export { INTEREST_AREAS, ORGANISATION_TYPES, TIME_SLOTS };

const email = z.string().trim().min(1, "Email address is required").max(200).email("Enter a valid email address, e.g. name@university.ac.ke");

export const demoRequestSchema = z.object({
  fullName: trimmed(120).min(2, "Full name is required"),
  email,
  phone: optionalText(40).refine((v) => !v || /^[+()\d\s-]{7,40}$/.test(v), "Enter a valid phone number, e.g. +254 7XX XXX XXX"),
  organisation: trimmed(200).min(2, "University / organisation name is required"),
  jobTitle: optionalText(120),
  country: optionalText(80),
  organisationType: z.enum(ORGANISATION_TYPES, { errorMap: () => ({ message: "Select an organisation type" }) }).optional().or(z.literal("").transform(() => undefined)),
  areaOfInterest: z.enum(INTEREST_AREAS, { errorMap: () => ({ message: "Select an area of interest" }) }).optional().or(z.literal("").transform(() => undefined)),
  preferredDate: z
    .string()
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "Enter a valid date")
    .refine((v) => {
      if (!v) return true;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(`${v}T00:00:00`) >= today;
    }, "The preferred date cannot be in the past"),
  preferredTime: z.enum(TIME_SLOTS).optional().or(z.literal("").transform(() => undefined)),
  expectedAttendees: z
    .union([z.number(), z.string()])
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : Number(v)))
    .refine((v) => v === undefined || (Number.isInteger(v) && v >= 1 && v <= 5000), "Enter a whole number between 1 and 5000"),
  message: optionalText(4000),
  consent: z.literal(true, { errorMap: () => ({ message: "Please confirm that we may contact you about this request" }) }),
  idempotencyKey: z.string().uuid("Invalid form token. Please reload the page."),
});

export const contactSchema = z.object({
  name: trimmed(120).min(2, "Name is required"),
  email,
  subject: trimmed(200).min(2, "Subject is required"),
  message: trimmed(4000).min(10, "Message should be at least 10 characters"),
  idempotencyKey: z.string().uuid("Invalid form token. Please reload the page."),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required").max(200),
});

export const admissionSchema = z
  .string()
  .trim()
  .toUpperCase()
  .min(3, "Enter your admission number")
  .max(40)
  .regex(/^[A-Z0-9/\-. ]+$/, "Admission numbers may contain letters, numbers, / and -");

import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .email("Enter a valid email address.");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .regex(/[a-z]/, "Password must include a lowercase letter.")
  .regex(/[A-Z]/, "Password must include an uppercase letter.")
  .regex(/[0-9]|[^A-Za-z0-9]/, "Password must include a number or special character.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Full name must be at least 2 characters long."),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const verifyOtpSchema = z.object({
  email: emailSchema,
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code."),
});

export const requestOtpSchema = z.object({
  email: emailSchema,
});

export const updateMeSchema = z
  .object({
    name: z.string().trim().min(2, "Full name must be at least 2 characters long.").optional(),
    email: emailSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update.",
  });

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export function getFieldErrors(error) {
  return error.flatten().fieldErrors;
}

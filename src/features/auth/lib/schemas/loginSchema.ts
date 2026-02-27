import { z } from "zod/v4"

export const loginSchema = z.object({
  email: z.email({ error: 'Incorrect email address' }),
  password: z
    .string()
    .min(1, { error: 'Password is required' })
    .min(3, { error: 'Password must be at least 3 characters long' }),
  rememberMe: z.boolean().optional(),
  captcha: z.string().min(1, { error: 'The captcha is too short' }).max(10, {error: 'The captcha is long'}).optional(),
})

export type LoginInputs = z.infer<typeof loginSchema>

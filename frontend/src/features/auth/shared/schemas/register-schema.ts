import { z } from "zod";

export const FormSchema = z
  .object({
    name: z.string().min(2, {
      message: "Имя должно содержать минимум 2 символа",
    }),
    email: z.string().email({
      message: "Неверный формат email-адреса",
    }),
    password: z.string().min(6, {
      message: "Пароль должен содержать минимум 6 символов",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают!",
    path: ["confirmPassword"],
  });

export type FormSchema = z.infer<typeof FormSchema>;

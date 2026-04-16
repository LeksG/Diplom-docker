import { z } from 'zod';

export const RegisterSchema = z.object({
  firstName: z
    .string()
    .min(3, { message: "Ім'я має містити мінімум 3 літери" })
    .max(16, { message: "Ім'я занадто довге (макс 16)" })
    .regex(/^[a-zA-Zа-яА-ЯіїєґІЇЄҐ\s]+$/, { message: "Ім'я може містити лише літери" }),

  email: z
    .string()
    .min(1, { message: "Введіть email" })
    .email({ message: "Некоректний формат email (приклад: user@mail.com)" }),

  password: z
    .string()
    .min(8, { message: "Пароль має бути не менше 8 символів" })
    .regex(/[A-Z]/, { message: "Пароль має містити хоча б одну велику літеру" })
    .regex(/[0-9]/, { message: "Пароль має містити хоча б одну цифру" })
    .regex(/[!@#$%^&*]/, { message: "Пароль має містити хоча б один спеціальний символ" })
});
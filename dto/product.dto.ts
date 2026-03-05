import { z } from 'zod';

export const CreateProductSchema = z.object({
  title: z.string().min(2, "Назва товару є обов'язковою"),
  description: z.string().optional().nullable(),
  price: z.number().positive("Ціна має бути більшою за 0"),
  oldPrice: z.number().positive().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  categoryId: z.number().int().positive("ID категорії є обов'язковим"),
  
  // Додаткові поля 
  stock: z.number().int().nonnegative().optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  
  // Масив варіантів 
  variants: z.array(z.object({
    size: z.string(),
    color: z.string(),
    stock: z.number().int().nonnegative()
  })).optional(),
  
  // Масив додаткових фотографій
  images: z.array(z.object({
    url: z.string().url("Некоректне посилання на фото"),
    color: z.string().nullable().optional()
  })).optional()
});


export type CreateProductDTO = z.infer<typeof CreateProductSchema>;
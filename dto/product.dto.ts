export interface CreateProductDto {
  title: string;
  description: string;
  price: string | number;
  oldPrice?: string | number;
  categoryId: string | number;
  images?: { url: string; color?: string }[];
  variants?: { size: string; color: string; stock: string | number }[];
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}
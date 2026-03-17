export interface CheckoutItemDTO {
  product: {
    title: string;
    price: number;
    imageUrl?: string;
  };
  quantity: number;
}

export interface CheckoutRequestDTO {
  items: CheckoutItemDTO[];
  email: string;
}
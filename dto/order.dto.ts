export interface CartItemDto {
  title: string;
  price: number;
  quantity?: number;
  size?: string;
  color?: string;
}

export interface CreateOrderDto {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerEmail?: string; 
  shippingMethod: string;
  paymentMethod: string;
  totalPrice: number;
  cartItems: CartItemDto[];
}

export interface UpdateOrderDto {
  status?: string; // 'NEW' | 'PROCESSING' | 'SHIPPED' | 'ARRIVED' | 'COMPLETED' | 'CANCELED'
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
}
export interface CreateReviewDto {
  email: string;
  productId: string | number;
  rating: string | number;
  comment: string;
  parentId?: string | number | null; // Для відповідей на відгуки
}

export interface UpdateReviewDto {
  rating?: string | number;
  comment?: string;
}
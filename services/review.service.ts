import { ReviewRepository } from '@/repositories/review.repository';
import { UserRepository } from '@/repositories/user.repository';
import { CreateReviewDto, UpdateReviewDto } from '@/dto/review.dto';

export class ReviewService {
  private repository = new ReviewRepository();
  private userRepo = new UserRepository();

  async addReview(body: CreateReviewDto) {
    const user = await this.userRepo.findByEmail(body.email);
    if (!user) throw new Error('USER_NOT_FOUND');

    // Якщо це головний відгук (не відповідь), перевіряємо чи він вже є
    if (!body.parentId) {
      const existing = await this.repository.findExisting(user.id, Number(body.productId));
      if (existing) throw new Error('ALREADY_REVIEWED');
    }

    return await this.repository.create({
      rating: Number(body.rating),
      comment: body.comment,
      userId: user.id,
      productId: Number(body.productId),
      parentId: body.parentId ? Number(body.parentId) : null,
    });
  }

  async checkAccessAndAction(
    id: number, 
    email: string, 
    action: 'update' | 'delete', 
    data?: UpdateReviewDto
  ) {
    const user = await this.userRepo.findByEmail(email);
    const review = await this.repository.findById(id);

    if (!user) throw new Error('UNAUTHORIZED');
    if (!review) throw new Error('NOT_FOUND');

    // Перевірка прав
    const isAuthor = review.userId === user.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isAuthor && !isAdmin) throw new Error('FORBIDDEN');


    if (action === 'update' && data) {
      
      const updateData: any = {};
      if (data.rating !== undefined) updateData.rating = Number(data.rating);
      if (data.comment !== undefined) updateData.comment = data.comment;
      
      return await this.repository.update(id, updateData);
    }
    
    if (action === 'delete') {
      return await this.repository.delete(id);
    }
  }
}
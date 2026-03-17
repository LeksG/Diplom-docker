import { CategoryRepository } from '@/repositories/category.repository';
import { CategoryResponseDTO } from '@/dto/category.dto';

export class CategoryService {
  private repository = new CategoryRepository();

  async getCategories(): Promise<CategoryResponseDTO[]> {
    const categories = await this.repository.getAll();
    
  
    return categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug
    }));
  }
}
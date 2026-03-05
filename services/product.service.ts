import { productRepository } from '../dal/product.repository';
import { CreateProductDTO } from '../dto/product.dto';

export class ProductService {
  
  // Метод для маппінгу Entity -> DTO (Тепер він повертає ВСІ потрібні дані для фронтенду)
  private mapToDTO(product: any) {
    // Збираємо унікальні кольори
    const uniqueColors = product.variants 
      ? Array.from(new Set(product.variants.map((v: any) => v.color))) 
      : [];

    return {
      id: product.id,
      title: product.title,
      description: product.description,
      price: Number(product.price),
      oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
      imageUrl: product.imageUrl,
      stock: product.stock,
      isAvailable: product.stock > 0, // Бізнес-логіка наявності
      categoryName: product.category?.name || 'Без категорії',
      categoryId: product.categoryId,
      sizes: product.sizes || [],
      colors: uniqueColors.length > 0 ? uniqueColors : (product.colors || []),
      images: product.images || [],
      variants: product.variants || []
    };
  }

  async getAllProducts() {
    const products = await productRepository.findAll();
    return products.map(p => this.mapToDTO(p));
  }

  async getProductById(id: number) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error('ProductNotFound'); // Викидаємо помилку для контролера
    }
    return this.mapToDTO(product);
  }

  async createProduct(dto: CreateProductDTO) {
    // Ваша крута бізнес-логіка для варіантів та залишків!
    let allSizes: string[] = dto.sizes || [];
    let allColors: string[] = dto.colors || [];
    let totalStock = dto.stock || 0;
    
    if (dto.variants && dto.variants.length > 0) {
      totalStock = dto.variants.reduce((acc, v) => acc + Number(v.stock || 0), 0);
      allSizes = [...new Set(dto.variants.map(v => v.size))].filter(Boolean) as string[];
      allColors = [...new Set(dto.variants.map(v => v.color))].filter(Boolean) as string[];
    }

    // Підготовка даних для репозиторію
    const productData = {
      title: dto.title,
      description: dto.description || '',
      price: dto.price,
      oldPrice: dto.oldPrice || null,
      imageUrl: dto.imageUrl || '',
      stock: totalStock,
      sizes: allSizes,
      colors: allColors,
      availableSizes: allSizes,
      category: {
        connect: { id: dto.categoryId }
      },
      variants: dto.variants?.length ? { create: dto.variants } : undefined,
      images: dto.images?.length ? { create: dto.images } : undefined
    };

    // Зберігаємо в БД
    const newProduct = await productRepository.create(productData);
    
    // Повертаємо красиво відформатований DTO
    return this.mapToDTO(newProduct);
  }
  
  async deleteProduct(id: number): Promise<void> {
    const product = await productRepository.findById(id);
    if (!product) throw new Error('ProductNotFound');
    await productRepository.delete(id);
  }
}

export const productService = new ProductService();
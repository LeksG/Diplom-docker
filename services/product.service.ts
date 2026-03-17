import { ProductRepository } from '@/repositories/product.repository';
import { CreateProductDto, UpdateProductDto } from '@/dto/product.dto';

export class ProductService {
  private repository = new ProductRepository();

 
   
   
  private prepareProductData(body: CreateProductDto | UpdateProductDto, isUpdate = false) {
    const { variants, images, categoryId, price, oldPrice, ...rest } = body;
    
    let totalStock = 0;
    let allSizes: string[] = [];
    let allColors: string[] = [];

    // Розрахунок залишків та атрибутів на основі варіантів
    if (variants && Array.isArray(variants)) {
      totalStock = variants.reduce((acc, v) => acc + Number(v.stock || 0), 0);
      allSizes = [...new Set(variants.map(v => v.size))].filter(Boolean) as string[];
      allColors = [...new Set(variants.map(v => v.color))].filter(Boolean) as string[];
    }

    const data: any = {
      ...rest,
      price: price !== undefined ? Number(price) : undefined,
      oldPrice: oldPrice !== undefined ? (oldPrice ? Number(oldPrice) : null) : undefined,
      stock: variants ? totalStock : undefined,
      sizes: variants ? allSizes : undefined,
      colors: variants ? allColors : undefined,
      availableSizes: variants ? allSizes : undefined,
      
     
      category: categoryId ? { connect: { id: Number(categoryId) } } : undefined,
      
      variants: variants ? { 
        ...(isUpdate ? { deleteMany: {} } : {}),
        create: variants.map(v => ({ 
          size: v.size, 
          color: v.color, 
          stock: Number(v.stock) 
        })) 
      } : undefined,
      
  
      images: images ? { 
        ...(isUpdate ? { deleteMany: {} } : {}),
        create: images.map(img => ({ 
          url: img.url, 
          color: img.color || null 
        })) 
      } : undefined
    };

  
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);
    
    return data;
  }

  async getAll() {
    return await this.repository.findAll();
  }

  async getOne(id: number) {
    return await this.repository.findById(id);
  }

  async createProduct(body: CreateProductDto) {
    const data = this.prepareProductData(body);
    return await this.repository.create(data);
  }

  async updateProduct(id: number, body: UpdateProductDto) {
    const data = this.prepareProductData(body, true);
    return await this.repository.update(id, data);
  }

  async removeProduct(id: number) {
    return await this.repository.delete(id);
  }

  async searchProducts(query: string | null) {
    if (!query || query.length < 2) return [];
    return await this.repository.search(query);
  }
}
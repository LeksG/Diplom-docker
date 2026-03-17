import { createClient } from '@supabase/supabase-js';

export class StorageService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  private bucketName = 'products';

  async getAllImages(): Promise<string[]> {
    const { data: files, error } = await this.supabase.storage
      .from(this.bucketName)
      .list();

    if (error) throw new Error('SUPABASE_ERROR');

    return files
      .filter(file => file.name && file.name !== '.emptyFolderPlaceholder')
    
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map(file => {
        const { data: { publicUrl } } = this.supabase.storage
          .from(this.bucketName)
          .getPublicUrl(file.name);
        return publicUrl;
      });
  }
}
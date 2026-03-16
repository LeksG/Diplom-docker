import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const bucketName = 'products'; 

    const { data: files, error } = await supabase.storage.from(bucketName).list();

    if (error) {
      console.error("Помилка отримання списку файлів:", error);
      return NextResponse.json({ error: 'Помилка Supabase' }, { status: 500 });
    }

 
    const imageUrls = files
      .filter(file => file.name && file.name !== '.emptyFolderPlaceholder')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map(file => {
        const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(file.name);
        return publicUrl;
      });

    return NextResponse.json(imageUrls);

  } catch (error) {
    console.error("🔥 Системна помилка медіабібліотеки:", error);
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 });
  }
}
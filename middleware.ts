import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function middleware(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    return NextResponse.json({}, { headers: corsHeaders });
  }

  const { pathname } = req.nextUrl;
  const secretKey = process.env.JWT_SECRET || 'super-secret-key';
  const SECRET = new TextEncoder().encode(secretKey);

  //ЗАХИСТ СТОРІНОК 
  const isAdminPage = pathname.startsWith('/admin');
  const isProfilePage = pathname.startsWith('/profile');

  if (isAdminPage || isProfilePage) {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/?auth=true', req.url));
    }

    try {
      const { payload } = await jwtVerify(token, SECRET);

      if (isAdminPage && payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/?auth=true', req.url));
      }

      return NextResponse.next();
    } catch (err) {
      const res = NextResponse.redirect(new URL('/?auth=true', req.url));
      res.cookies.delete('token');
      return res;
    }
  }

  //  ЗАХИСТ API
  if (pathname.startsWith('/api/')) {
    if (pathname === '/api/auth/login' || pathname === '/api/auth/register') {
        return NextResponse.next();
    }

    const isApiUser = pathname.startsWith('/api/user') || pathname.startsWith('/api/order') && req.method !== 'POST';
    const isApiAdmin = pathname.startsWith('/api/admin') || 
                  (pathname.startsWith('/api/products') && ['POST', 'DELETE', 'PUT', 'PATCH'].includes(req.method)) ||
                  (pathname.startsWith('/api/orders') && ['DELETE', 'PATCH'].includes(req.method));

    if (!isApiUser && !isApiAdmin) {
      const res = NextResponse.next();
      Object.entries(corsHeaders).forEach(([key, value]) => res.headers.set(key, value));
      return res;
    }

    const authHeader = req.headers.get('authorization');
    let token = authHeader?.split(' ')[1];

    if (!token) {
      token = req.cookies.get('token')?.value;
    }

    if (!token) {
      return NextResponse.json({ message: '401 Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    try {
      const { payload } = await jwtVerify(token, SECRET);
      if (isApiAdmin && payload.role !== 'ADMIN') {
        return NextResponse.json({ message: '403 Forbidden' }, { status: 403, headers: corsHeaders });
      }

      
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('user-data', JSON.stringify(payload));

     
      const res = NextResponse.next({
        request: { headers: requestHeaders },
      });
      

      Object.entries(corsHeaders).forEach(([key, value]) => res.headers.set(key, value));
      return res;
    } catch (err) {
      return NextResponse.json({ message: '401 Unauthorized' }, { status: 401, headers: corsHeaders });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*', 
    '/admin',         
    '/admin/:path*',  
    '/profile',       
    '/profile/:path*' 
  ],
};
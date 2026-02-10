'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const password = formData.get('password') as string;
  const envPassword = process.env.AUTH_PASSWORD;

  if (password === envPassword) {
    const cookieStore = await cookies();
    // Set a cookie that expires in 1 week
    cookieStore.set('auth_token', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    
    redirect('/');
  } else {
    // Return an error state (handled in component)
    return { error: 'Invalid password' };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  redirect('/login');
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { BlogPostForm } from '@/components/blog/BlogPostForm';

export default function NewBlogPostPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    // `user` populates via a separate async getMe() even after
    // isAuthenticated flips true — wait for it rather than treating a
    // still-loading null as "not admin" and redirecting prematurely.
    if (!user) return;
    if (user.role !== 'admin') {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <AdminLayout>
      <div className="container-app max-w-3xl py-stack-lg">
        <h1 className="headline-md mb-stack-lg text-primary">New post</h1>
        <BlogPostForm
          onSubmit={async (input) => {
            await api.createBlogPost(input);
            router.push('/admin/blog');
          }}
        />
      </div>
    </AdminLayout>
  );
}

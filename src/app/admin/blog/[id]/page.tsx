'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, ApiClientError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PageLoader } from '@/components/ui/PageLoader';
import { BlogPostForm } from '@/components/blog/BlogPostForm';
import type { AdminBlogPost } from '@/types/blog';

export default function EditBlogPostPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [post, setPost] = useState<AdminBlogPost | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      return;
    }
    api
      .getBlogPostAdmin(params.id)
      .then((res) => setPost(res.post))
      .catch((err) => setError(err instanceof ApiClientError ? err.message : 'Could not load this post.'));
  }, [isLoading, isAuthenticated, user, router, params.id]);

  return (
    <AdminLayout>
      <div className="container-app max-w-3xl py-stack-lg">
        <h1 className="headline-md mb-stack-lg text-primary">Edit post</h1>

        {error && <p className="body-md text-error">{error}</p>}
        {!post && !error && <PageLoader label="Loading post…" />}

        {post && (
          <BlogPostForm
            initial={post}
            onSubmit={async (input) => {
              await api.updateBlogPost(post._id, input);
              router.push('/admin/blog');
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}

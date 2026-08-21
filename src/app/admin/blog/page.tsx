'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, ApiClientError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PageLoader } from '@/components/ui/PageLoader';
import type { AdminBlogPost } from '@/types/blog';

const STATUS_CLASS: Record<AdminBlogPost['status'], string> = {
  published: 'badge-verified',
  draft: 'badge-pending',
};

export default function AdminBlogListPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [posts, setPosts] = useState<AdminBlogPost[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      .listAllBlogPosts()
      .then((res) => setPosts(res.posts))
      .catch((err) => setError(err instanceof ApiClientError ? err.message : 'Could not load posts.'));
  }, [isLoading, isAuthenticated, user, router]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this post permanently?')) return;
    setDeletingId(id);
    try {
      await api.deleteBlogPost(id);
      setPosts((prev) => prev?.filter((p) => p._id !== id) ?? prev);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not delete the post.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AdminLayout>
      <div className="container-app py-stack-lg">
        <div className="mb-stack-lg flex items-center justify-between">
          <h1 className="headline-md text-primary">Blog posts</h1>
          <Link href="/admin/blog/new" className="btn-primary">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Post
          </Link>
        </div>

        {error && <p className="body-md mb-stack-md text-error">{error}</p>}
        {posts === null && !error && <PageLoader label="Loading posts…" />}

        {posts?.length === 0 && (
          <div className="elevation-1 rounded-lg border-dashed p-10 text-center">
            <p className="body-md text-on-surface-variant">No posts yet.</p>
          </div>
        )}

        {posts && posts.length > 0 && (
          <div className="flex flex-col gap-stack-sm">
            {posts.map((post) => (
              <div
                key={post._id}
                className="elevation-1 flex items-center justify-between gap-4 rounded-lg p-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className={STATUS_CLASS[post.status]}>{post.status}</span>
                    <p className="label-md truncate font-semibold text-on-surface">{post.title}</p>
                  </div>
                  <p className="label-sm mt-1 text-on-surface-variant">
                    /blog/{post.slug} · updated {new Date(post.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link href={`/admin/blog/${post._id}`} className="btn-tertiary">
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(post._id)}
                    disabled={deletingId === post._id}
                    className="label-md rounded px-3 py-2 text-error transition-colors hover:bg-error/10 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

'use client';

import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { ChevronRight, Calendar, User, ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useNavigationStore } from '@/stores';
import { formatDate } from '@/lib/helpers';
import type { BlogPost } from '@/lib/types';

export default function BlogPage() {
  const currentView = useNavigationStore((s) => s.currentView);
  const selectedBlogSlug = useNavigationStore((s) => s.selectedBlogSlug);
  const navigate = useNavigationStore();

  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ['blog-posts'],
    queryFn: () => fetch('/api/blog').then((r) => r.json()),
    enabled: currentView === 'blog',
  });

  const { data: blogPost, isLoading: postLoading } = useQuery<BlogPost>({
    queryKey: ['blog-post', selectedBlogSlug],
    queryFn: () => fetch(`/api/blog/${selectedBlogSlug}`).then((r) => r.json()),
    enabled: currentView === 'blog-detail' && !!selectedBlogSlug,
  });

  // Blog Detail
  if (currentView === 'blog-detail' && selectedBlogSlug) {
    if (postLoading) {
      return (
        <div className="mx-auto max-w-3xl px-4 py-6">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="mt-6 h-12 w-full" />
          <Skeleton className="mt-4 h-[300px] w-full rounded-xl" />
          <div className="mt-6 space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      );
    }

    if (!blogPost) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center">
          <h2 className="text-xl font-bold text-stone-900">Artikel tidak ditemukan</h2>
          <Button
            className="mt-4 bg-rose-600 text-white hover:bg-rose-700"
            onClick={() => { navigate.navigate('blog'); window.scrollTo(0, 0); }}
          >
            Kembali ke Blog
          </Button>
        </div>
      );
    }

    return (
      <article className="mx-auto max-w-3xl px-4 py-6">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-stone-500">
          <button onClick={() => { navigate.navigate('home'); window.scrollTo(0, 0); }} className="hover:text-rose-600">
            Home
          </button>
          <ChevronRight className="h-4 w-4" />
          <button onClick={() => { navigate.navigate('blog'); window.scrollTo(0, 0); }} className="hover:text-rose-600">
            Blog
          </button>
          <ChevronRight className="h-4 w-4" />
          <span className="text-stone-900 truncate max-w-[200px]">{blogPost.title}</span>
        </nav>

        <button
          onClick={() => { navigate.navigate('blog'); window.scrollTo(0, 0); }}
          className="mb-4 flex items-center gap-1 text-sm text-stone-500 hover:text-rose-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </button>

        <h1 className="text-2xl font-bold tracking-tight text-stone-900 md:text-3xl">
          {blogPost.title}
        </h1>

        <div className="mt-4 flex items-center gap-4 text-sm text-stone-500">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {blogPost.author}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDate(blogPost.createdAt)}
          </div>
        </div>

        {blogPost.coverImage && (
          <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-xl">
            <Image
              src={blogPost.coverImage}
              alt={blogPost.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="prose prose-stone mt-8 max-w-none prose-headings:font-bold prose-p:text-stone-600 prose-a:text-rose-600 prose-strong:text-stone-900">
          <ReactMarkdown>{blogPost.content}</ReactMarkdown>
        </div>
      </article>
    );
  }

  // Blog Listing
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-stone-500">
        <button onClick={() => { navigate.navigate('home'); window.scrollTo(0, 0); }} className="hover:text-rose-600">
          Home
        </button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-stone-900">Blog</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 md:text-3xl">Blog</h1>
        <p className="mt-1 text-sm text-stone-500">
          Tips fashion, tren terbaru, dan inspirasi gaya
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[16/10] rounded-xl" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="group cursor-pointer overflow-hidden border-stone-200 transition-all hover:shadow-lg"
              onClick={() => {
                navigate.navigate('blog-detail', undefined, post.slug);
                window.scrollTo(0, 0);
              }}
            >
              <CardContent className="p-0">
                {post.coverImage && (
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <Badge className="absolute left-3 top-3 bg-rose-600 text-white hover:bg-rose-700">
                      Blog
                    </Badge>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-stone-900 transition-colors group-hover:text-rose-600">
                    {post.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-3 text-xs text-stone-400">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(post.createdAt)}
                    </div>
                  </div>
                  {post.excerpt && (
                    <p className="mt-2 line-clamp-2 text-sm text-stone-500">{post.excerpt}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

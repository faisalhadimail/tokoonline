'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  FileText,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate, slugify, truncate } from '@/lib/helpers';
import type { BlogPost } from '@/lib/types';
import { toast } from 'sonner';

interface BlogFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  author: string;
  isPublished: boolean;
}

const defaultFormData: BlogFormData = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  coverImage: '',
  author: 'Admin',
  isPublished: false,
};

export default function BlogManager() {
  const queryClient = useQueryClient();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<BlogFormData>(defaultFormData);

  // Fetch blog posts
  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ['admin-blog-posts'],
    queryFn: () => fetch('/api/blog?admin=true&limit=100').then((r) => r.json()),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: BlogFormData) =>
      fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      setAddDialogOpen(false);
      setFormData(defaultFormData);
      toast.success('Blog post created successfully');
    },
    onError: () => toast.error('Failed to create blog post'),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BlogFormData> }) =>
      fetch(`/api/blog?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      setEditDialogOpen(false);
      setSelectedPost(null);
      setFormData(defaultFormData);
      toast.success('Blog post updated successfully');
    },
    onError: () => toast.error('Failed to update blog post'),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/blog?id=${id}`, { method: 'DELETE' }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      setDeleteDialogOpen(false);
      setSelectedPost(null);
      toast.success('Blog post deleted successfully');
    },
    onError: () => toast.error('Failed to delete blog post'),
  });

  // Toggle published
  const togglePublishMutation = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      fetch(`/api/blog?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      toast.success('Publication status updated');
    },
    onError: () => toast.error('Failed to update publication status'),
  });

  const handleEdit = (post: BlogPost) => {
    setSelectedPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || '',
      coverImage: post.coverImage || '',
      author: post.author,
      isPublished: post.isPublished,
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (post: BlogPost) => {
    setSelectedPost(post);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Blog Posts</h3>
          <p className="text-sm text-gray-500">
            {posts?.length || 0} posts total
          </p>
        </div>
        <Button
          className="bg-rose-500 hover:bg-rose-600 text-white"
          onClick={() => {
            setFormData(defaultFormData);
            setAddDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Post
        </Button>
      </div>

      {/* Blog Posts Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden sm:table-cell">Author</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-12 w-16 rounded-lg" />
                            <div>
                              <Skeleton className="h-4 w-40 mb-1" />
                              <Skeleton className="h-3 w-28" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-16 mx-auto rounded-full" />
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-8 w-8 mx-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  : posts && posts.length > 0 ? (
                      posts.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                {post.coverImage ? (
                                  <img
                                    src={post.coverImage}
                                    alt={post.title}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <FileText className="h-5 w-5 text-gray-300 m-auto mt-[16px]" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate max-w-[240px]">
                                  {post.title}
                                </p>
                                <p className="text-xs text-gray-400 font-mono truncate">
                                  /{post.slug}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <span className="text-sm text-gray-600">{post.author}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Switch
                                checked={post.isPublished}
                                onCheckedChange={(checked) =>
                                  togglePublishMutation.mutate({
                                    id: post.id,
                                    isPublished: checked,
                                  })
                                }
                                disabled={togglePublishMutation.isPending}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <span className="text-xs text-gray-500">
                              {formatDate(post.createdAt)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(post)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    togglePublishMutation.mutate({
                                      id: post.id,
                                      isPublished: !post.isPublished,
                                    })
                                  }
                                >
                                  {post.isPublished ? (
                                    <>
                                      <EyeOff className="h-4 w-4 mr-2" />
                                      Unpublish
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Publish
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(post)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12">
                          <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 font-medium">No blog posts found</p>
                          <p className="text-gray-400 text-sm">Create your first blog post</p>
                        </TableCell>
                      </TableRow>
                    )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Blog Post Dialog */}
      <BlogFormDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        formData={formData}
        setFormData={setFormData}
        onSubmit={() => createMutation.mutate(formData)}
        loading={createMutation.isPending}
        title="Add New Blog Post"
      />

      {/* Edit Blog Post Dialog */}
      <BlogFormDialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setSelectedPost(null);
        }}
        formData={formData}
        setFormData={setFormData}
        onSubmit={() => {
          if (selectedPost) {
            updateMutation.mutate({ id: selectedPost.id, data: formData });
          }
        }}
        loading={updateMutation.isPending}
        title="Edit Blog Post"
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold text-gray-900">
                {selectedPost?.title}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedPost(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                if (selectedPost) deleteMutation.mutate(selectedPost.id);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface BlogFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: BlogFormData;
  setFormData: (data: BlogFormData) => void;
  onSubmit: () => void;
  loading: boolean;
  title: string;
}

function BlogFormDialog({
  open,
  onOpenChange,
  formData,
  setFormData,
  onSubmit,
  loading,
  title,
}: BlogFormDialogProps) {
  const updateField = <K extends keyof BlogFormData>(
    field: K,
    value: BlogFormData[K]
  ) => {
    if (field === 'title') {
      setFormData({
        ...formData,
        title: value,
        slug: slugify(value as string),
      });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Write your blog post details below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="blog-title">Title *</Label>
            <Input
              id="blog-title"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Enter blog post title..."
            />
          </div>

          {/* Slug */}
          <div className="grid gap-2">
            <Label htmlFor="blog-slug">Slug</Label>
            <Input
              id="blog-slug"
              value={formData.slug}
              onChange={(e) => updateField('slug', e.target.value)}
              placeholder="auto-generated-slug"
              className="font-mono"
            />
            <p className="text-xs text-gray-400">
              Auto-generated from title. You can customize it.
            </p>
          </div>

          {/* Cover Image */}
          <div className="grid gap-2">
            <Label htmlFor="blog-cover">Cover Image URL</Label>
            <Input
              id="blog-cover"
              value={formData.coverImage}
              onChange={(e) => updateField('coverImage', e.target.value)}
              placeholder="https://example.com/cover.jpg"
            />
            {formData.coverImage && (
              <div className="h-32 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={formData.coverImage}
                  alt="Cover preview"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Excerpt */}
          <div className="grid gap-2">
            <Label htmlFor="blog-excerpt">Excerpt</Label>
            <Textarea
              id="blog-excerpt"
              value={formData.excerpt}
              onChange={(e) => updateField('excerpt', e.target.value)}
              placeholder="Brief summary of the blog post..."
              rows={2}
            />
          </div>

          {/* Content */}
          <div className="grid gap-2">
            <Label htmlFor="blog-content">Content *</Label>
            <Textarea
              id="blog-content"
              value={formData.content}
              onChange={(e) => updateField('content', e.target.value)}
              placeholder="Write your blog post content here... (Markdown supported)"
              rows={10}
              className="min-h-[200px]"
            />
          </div>

          {/* Author */}
          <div className="grid gap-2">
            <Label htmlFor="blog-author">Author</Label>
            <Input
              id="blog-author"
              value={formData.author}
              onChange={(e) => updateField('author', e.target.value)}
              placeholder="Author name"
            />
          </div>

          {/* Published */}
          <div className="flex items-center justify-between">
            <Label htmlFor="blog-published">Published</Label>
            <Switch
              id="blog-published"
              checked={formData.isPublished}
              onCheckedChange={(checked) => updateField('isPublished', checked)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-rose-500 hover:bg-rose-600 text-white"
            onClick={onSubmit}
            disabled={loading || !formData.title || !formData.content}
          >
            {loading ? 'Saving...' : title.includes('Add') ? 'Create Post' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

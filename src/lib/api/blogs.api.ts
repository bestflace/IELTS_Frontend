import { api } from "./client";
import type { Blog, PublishStatus, QueryParams } from "@/types";

export type CreateBlogInput = {
  title: string;
  excerpt?: string | null;
  contentMarkdown: string;
  coverImageUrl?: string | null;
  tagIds?: string[];
  status?: PublishStatus;
};

export type UpdateBlogInput = Partial<{
  title: string;
  excerpt: string | null;
  contentMarkdown: string;
  coverImageUrl: string | null;
  tagIds: string[];
  status: PublishStatus;
}>;

export const getBlogs = (params?: QueryParams) =>
  api.getWithMeta<Blog[]>("/blogs", { params });

export const getBlogBySlug = (slug: string) => api.get<Blog>(`/blogs/${slug}`);

export const getAdminBlogs = (params?: QueryParams) =>
  api.getWithMeta<Blog[]>("/admin/blogs", { params });

export const createBlog = (data: CreateBlogInput) =>
  api.post<Blog>("/admin/blogs", data);

export const getAdminBlog = (id: string) => api.get<Blog>(`/admin/blogs/${id}`);

export const updateBlog = (id: string, data: UpdateBlogInput) =>
  api.patch<Blog>(`/admin/blogs/${id}`, data);

export const deleteBlog = (id: string) => api.delete(`/admin/blogs/${id}`);

export const publishBlog = (id: string) =>
  api.post<Blog>(`/admin/blogs/${id}/publish`);

export const unpublishBlog = (id: string) =>
  api.post<Blog>(`/admin/blogs/${id}/unpublish`);

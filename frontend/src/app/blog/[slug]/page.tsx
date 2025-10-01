// frontend/src/app/blog/[slug]/page.tsx
import React from "react";
import Image from "next/image";
import api from "@/lib/axios";
import ReactMarkdown from "react-markdown";

interface Blog {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  image?: string;
  category?: string;
  tags?: string[];
  author?: string;
  createdAt?: string;
}

interface PageProps {
  params: { slug: string };
}

// Optional: fetch blog data server-side
async function fetchBlog(slug: string): Promise<Blog | null> {
  try {
    const res = await api.get(`/blogs/${slug}`);
    return res.data.data || null;
  } catch (err) {
    console.error("Failed to fetch blog:", err);
    return null;
  }
}

export default async function BlogPage({ params }: PageProps) {
  const { slug } = params;
  const blog = await fetchBlog(slug);

  if (!blog) {
    return (
      <div className="text-center py-20 text-gray-600">
        Blog not found
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto p-6">
      {/* Title */}
      <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>

      {/* Featured Image */}
      {blog.image && (
        <div className="relative w-full h-64 sm:h-80 md:h-96 mb-6 rounded-lg overflow-hidden">
          <Image
            src={blog.image}
            alt={blog.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 800px"
          />
        </div>
      )}

      {/* Excerpt */}
      {blog.excerpt && (
        <p className="text-gray-600 mb-6 text-lg">{blog.excerpt}</p>
      )}

      {/* Content */}
      <div className="prose prose-lg max-w-none mb-8">
        <ReactMarkdown>{blog.content}</ReactMarkdown>
      </div>

      {/* Tags */}
      {blog.tags && blog.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {blog.tags.map((tag) => (
            <span
              key={tag}
              className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Meta Info */}
      <div className="mt-6 text-sm text-gray-400">
        <span>Category: {blog.category}</span> •{" "}
        <span>Author: {blog.author}</span> •{" "}
        <span>
          Published:{" "}
          {blog.createdAt
            ? new Date(blog.createdAt).toLocaleDateString()
            : "N/A"}
        </span>
      </div>
    </article>
  );
}

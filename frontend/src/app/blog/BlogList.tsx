"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

type BlogPost = {
  _id?: string; // backend MongoDB ID
  id?: string;  // fallback
  slug: string;
  title: string;
  excerpt?: string;
  image?: string;
  views?: number;
  category?: string;
  author?: string;
};

interface BlogListProps {
  blogs: BlogPost[];
}

export default function BlogList({ blogs }: BlogListProps) {
  return (
    <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {blogs.map((blog, idx) => (
        <motion.article
          key={blog._id ?? blog.id ?? blog.slug}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: idx * 0.15 }}
          className="bg-white rounded-2xl shadow hover:shadow-lg overflow-hidden flex flex-col"
        >
          {blog.image && (
            <div className="relative w-full h-48">
              <Image
                src={blog.image}
                alt={blog.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          )}

          <div className="p-6 flex flex-col flex-1">
            {/* Removed date for public view */}
            <h2 className="text-xl font-semibold mt-2 line-clamp-2">{blog.title}</h2>
            <p className="text-gray-600 mt-2 flex-1 line-clamp-3">
              {blog.excerpt ?? "Read more about this topic..."}
            </p>
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              {blog.category && <span className="font-medium">{blog.category}</span>}
              {typeof blog.views === "number" && <span>{blog.views} views</span>}
            </div>
            <Link
              href={`/blog/${blog.slug}`}
              className="mt-4 inline-block text-emerald-600 font-medium hover:underline"
            >
              Read More →
            </Link>
          </div>
        </motion.article>
      ))}
    </section>
  );
}

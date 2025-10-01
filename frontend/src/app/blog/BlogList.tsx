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
  showViews?: boolean; // optional flag to show or hide views
}

export default function BlogList({ blogs, showViews = true }: BlogListProps) {
  return (
    <section
      className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      aria-label="Blog posts"
    >
      {blogs.map((blog, idx) => (
        <motion.article
          key={blog._id ?? blog.id ?? blog.slug}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: idx * 0.15 }}
          className="bg-white rounded-2xl shadow-md hover:shadow-xl overflow-hidden flex flex-col group"
        >
          {/* Image section */}
          <Link
            href={`/blog/${blog.slug}`}
            className="block relative w-full h-48 overflow-hidden"
          >
            <Image
              src={blog.image || "/placeholder.jpg"} // fallback if no image
              alt={blog.title}
              fill
              priority={idx < 3} // prioritize first row images for LCP
              loading={idx < 3 ? "eager" : "lazy"}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </Link>

          {/* Content section */}
          <div className="p-6 flex flex-col flex-1">
            <h2 className="text-xl font-semibold mt-2 line-clamp-2">
              <Link
                href={`/blog/${blog.slug}`}
                className="hover:text-emerald-600 transition-colors"
              >
                {blog.title}
              </Link>
            </h2>

            <p className="text-gray-600 mt-2 flex-1 line-clamp-3">
              {blog.excerpt ?? "Read more about this topic..."}
            </p>

            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              {blog.category && <span className="font-medium">{blog.category}</span>}
              {showViews && typeof blog.views === "number" && (
                <span>{blog.views} views</span>
              )}
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

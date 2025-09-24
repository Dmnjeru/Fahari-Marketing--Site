// frontend/src/app/blog/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import BlogList from "./BlogList";

export const metadata: Metadata = {
  title: "Blog — Fahari Yoghurt",
  description:
    "Read the latest news, recipes, and stories about Fahari Yoghurt and healthy living.",
  openGraph: {
    title: "Fahari Yoghurt Blog",
    description:
      "Stay up-to-date with Fahari Yoghurt's news, tips, and stories from the farm to your table.",
    url: "https://faharidairies.co.ke/blog",
  },
};

export const revalidate = 60; // seconds - ISR

type BlogItem = {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  excerpt?: string;
  image?: string;
  category?: string;
  tags?: string[];
  author?: string;
  views?: number;
};

type ApiResponse = {
  success: boolean;
  count?: number;
  total?: number;
  currentPage?: number;
  totalPages?: number;
  data?: BlogItem[];
  message?: string;
};

const DEFAULT_LIMIT = 9;

/** Build API URL (uses NEXT_PUBLIC_API_URL when provided or falls back to relative path) */
function buildApiUrl(page = 1, limit = DEFAULT_LIMIT) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "";
  const prefix = base.replace(/\/$/, "");
  // If prefix is empty string, return relative path
  return `${prefix || ""}/api/blogs?page=${page}&limit=${limit}`;
}

/**
 * Server component page — MUST await searchParams before using it.
 *
 * Note: searchParams is awaited due to Next.js App Router semantics.
 */
export default async function BlogPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined> | undefined>;
}) {
  // Await the searchParams proxy (required by Next.js)
  const params = (await searchParams) ?? {};
  // normalize page param (handle string | string[] | undefined)
  const rawPage = Array.isArray(params.page) ? params.page[0] : (params.page as string | undefined);
  const page = Math.max(1, Number(rawPage ?? "1") || 1);
  const limit = DEFAULT_LIMIT;

  const url = buildApiUrl(page, limit);

  let api: ApiResponse | null = null;
  let fetchError: string | null = null;

  try {
    const res = await fetch(url, { next: { revalidate } });

    if (!res.ok) {
      fetchError = `Failed to load blogs: ${res.status} ${res.statusText}`;
    } else {
      api = (await res.json()) as ApiResponse;
      if (!api || !Array.isArray(api.data)) {
        fetchError = "Unexpected API response";
      }
    }
  } catch (err) {
    fetchError = err instanceof Error ? err.message : String(err);
  }

  const blogs = api?.data ?? [];

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <header className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
          Fahari Yoghurt Blog
        </h1>
        <p className="text-gray-600 text-lg">
          Stay up-to-date with our latest news, healthy tips, and delicious recipes.
        </p>
      </header>

      <section className="max-w-7xl mx-auto">
        {fetchError ? (
          <div className="rounded-md bg-red-50 border border-red-200 p-4 text-red-800">
            <strong className="block font-medium">Error loading blogs</strong>
            <p className="mt-1 text-sm">{fetchError}</p>
            <p className="mt-2 text-xs text-gray-600">
              If this continues, check your backend or environment variable <code>NEXT_PUBLIC_API_URL</code>.
            </p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12 text-gray-600">No blog posts found.</div>
        ) : (
          <>
            {/* BlogList is a client component; it will handle rendering cards and images */}
            <BlogList blogs={blogs} />

            {/* Pagination (server-rendered links) */}
            <div className="mt-8 flex items-center justify-center">
              <Pagination
                currentPage={api?.currentPage ?? page}
                totalPages={api?.totalPages ?? Math.ceil((api?.total ?? blogs.length) / limit)}
                basePath="/blog"
              />
            </div>
          </>
        )}
      </section>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*                             Pagination component                            */
/* -------------------------------------------------------------------------- */
function Pagination({
  currentPage,
  totalPages,
  basePath,
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
}) {
  const page = Math.max(1, currentPage || 1);
  const total = Math.max(1, totalPages || 1);
  const showPrev = page > 1;
  const showNext = page < total;

  const pageNumbers = getPageNumbers(page, total);

  return (
    <nav aria-label="Blog pagination" className="mt-8 flex items-center justify-center">
      <ul className="inline-flex items-center gap-2">
        <li>
          {showPrev ? (
            <Link href={`${basePath}?page=${page - 1}`} className="px-3 py-2 rounded-md bg-white border text-gray-700 hover:bg-gray-50">
              Previous
            </Link>
          ) : (
            <span className="px-3 py-2 rounded-md bg-gray-100 text-gray-400 border">Previous</span>
          )}
        </li>

        {pageNumbers.map((p) => (
          <li key={p}>
            {p === page ? (
              <span className="px-3 py-2 rounded-md bg-green-600 text-white border">{p}</span>
            ) : (
              <Link href={`${basePath}?page=${p}`} className="px-3 py-2 rounded-md bg-white border text-gray-700 hover:bg-gray-50">
                {p}
              </Link>
            )}
          </li>
        ))}

        <li>
          {showNext ? (
            <Link href={`${basePath}?page=${page + 1}`} className="px-3 py-2 rounded-md bg-white border text-gray-700 hover:bg-gray-50">
              Next
            </Link>
          ) : (
            <span className="px-3 py-2 rounded-md bg-gray-100 text-gray-400 border">Next</span>
          )}
        </li>
      </ul>
    </nav>
  );
}

function getPageNumbers(current: number, total: number) {
  const maxDisplay = 5;
  const pages: number[] = [];

  if (total <= maxDisplay) {
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }

  let start = Math.max(1, current - Math.floor(maxDisplay / 2));
  let end = start + maxDisplay - 1;

  if (end > total) {
    end = total;
    start = total - maxDisplay + 1;
  }

  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
}

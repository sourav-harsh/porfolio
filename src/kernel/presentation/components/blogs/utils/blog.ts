import { marked } from "marked";

export type BlogPostMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  readingTime: number;
};

export type BlogPost = BlogPostMeta & {
  content: string;
  html: string;
};

type MarkdownFile = {
  frontmatter: BlogPostMeta;
  content: string;
};

// Load every .md file in src/content/blog
const markdownFiles = import.meta.glob("/src/content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function getSlug(path: string): string {
  return path
      .split("/")
      .pop()!
      .replace(/\.md$/, "");
}

/**
 * Very small frontmatter parser.
 *
 * Supports:
 *
 * ---
 * title: "My Blog"
 * date: "2026-08-28"
 * excerpt: "My excerpt"
 * tags: ["react", "javascript"]
 * ---
 */
function parseMarkdown(raw: string): MarkdownFile {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);

  if (!match) {
    return {
      frontmatter: {
        slug: "",
        title: "Untitled",
        date: "",
        excerpt: "",
        tags: [],
        readingTime: 1,
      },
      content: raw,
    };
  }

  const [, frontmatterText, content] = match;

  const data: Record<string, string | string[]> = {};

  for (const line of frontmatterText.split("\n")) {
    const separator = line.indexOf(":");

    if (separator === -1) continue;

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();

    // Remove quotes
    if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // Parse arrays like ["react", "javascript"]
    if (value.startsWith("[") && value.endsWith("]")) {
      try {
        data[key] = JSON.parse(value);
      } catch {
        data[key] = [];
      }
    } else {
      data[key] = value;
    }
  }

  const words = content.trim()
      ? content.trim().split(/\s+/).length
      : 0;

  const meta: BlogPostMeta = {
    slug: "",
    title: String(data.title ?? "Untitled"),
    date: String(data.date ?? ""),
    excerpt: String(data.excerpt ?? ""),
    tags: Array.isArray(data.tags)
        ? data.tags.map(String)
        : [],
    readingTime: Math.max(1, Math.ceil(words / 200)),
  };

  return {
    frontmatter: meta,
    content: content.trim(),
  };
}

function loadPost(path: string, raw: string): BlogPost {
  const parsed = parseMarkdown(raw);

  const slug = getSlug(path);

  const meta: BlogPostMeta = {
    ...parsed.frontmatter,
    slug,
  };

  return {
    ...meta,
    content: parsed.content,
    html: marked.parse(parsed.content) as string,
  };
}

/**
 * Get all blog posts.
 */
export function getAllPosts(): BlogPostMeta[] {
  return Object.entries(markdownFiles)
      .map(([path, raw]) => {
        const post = loadPost(path, raw);

        return {
          slug: post.slug,
          title: post.title,
          date: post.date,
          excerpt: post.excerpt,
          tags: post.tags,
          readingTime: post.readingTime,
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Get a single blog post by slug.
 */
export function getPostBySlug(
    slug: string
): BlogPost | null {
  const entry = Object.entries(markdownFiles).find(
      ([path]) => getSlug(path) === slug
  );

  if (!entry) {
    return null;
  }

  return loadPost(entry[0], entry[1]);
}

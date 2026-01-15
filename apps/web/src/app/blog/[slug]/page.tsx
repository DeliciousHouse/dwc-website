import { notFound } from "next/navigation";

import { getPostBySlug, posts } from "../posts";

type PageProps = {
  params: { slug: string };
};

export const generateStaticParams = async () =>
  posts.map((post) => ({ slug: post.slug }));

export default function BlogPostPage({ params }: PageProps) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="text-xs text-muted-foreground">{post.date}</div>
        <h1 className="dw-h1 mt-2">{post.title}</h1>
        <p className="dw-lead mt-3 max-w-2xl">{post.excerpt}</p>
      </div>

      <div className="dw-card p-6">
        <div className="space-y-4 text-sm text-muted-foreground">
          {post.content.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

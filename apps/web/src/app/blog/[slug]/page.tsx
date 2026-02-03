import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { Fragment } from "react";

import { AdSlot } from "@/components/ad-slot";
import { getSiteUrl } from "@/lib/site";

import { getPostBySlug, posts } from "../posts";

type PageProps = {
  params: { slug: string };
};

export const generateStaticParams = async () =>
  posts.map((post) => ({ slug: post.slug }));

export function generateMetadata({ params }: PageProps): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) {
    return {
      title: "Blog post not found",
      description: "This blog post could not be found.",
    };
  }

  const url = `${getSiteUrl()}/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url,
    },
  };
}

export default function BlogPostPage({ params }: PageProps) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const postUrl = `${getSiteUrl()}/blog/${post.slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Organization",
      name: "Delicious Wines",
    },
    publisher: {
      "@type": "Organization",
      name: "Delicious Wines",
    },
    mainEntityOfPage: postUrl,
  };

  return (
    <div className="flex flex-col gap-6">
      <Script id={`blogpost-schema-${post.slug}`} type="application/ld+json">
        {JSON.stringify(schema)}
      </Script>
      <div>
        <div className="text-xs text-muted-foreground">{post.date}</div>
        <h1 className="dw-h1 mt-2">{post.title}</h1>
        <p className="dw-lead mt-3 max-w-2xl">{post.excerpt}</p>
      </div>

      <div className="space-y-4 text-sm text-muted-foreground">
        {post.content.map((paragraph, index) => (
          <Fragment key={paragraph}>
            <p>{paragraph}</p>
            {index === 0 ? (
              <AdSlot
                className="my-4 border-t border-border/70 pt-4"
                slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_POST}
                minHeightClassName="min-h-[180px]"
                label="Blog post advertisement"
              />
            ) : null}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

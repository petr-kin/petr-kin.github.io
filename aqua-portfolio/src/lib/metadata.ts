import type { Metadata } from "next";

// Base metadata that can be extended by individual pages
export const baseMetadata: Metadata = {
  metadataBase: new URL('https://petrkindlmann.dev'),
  keywords: [
    "QA Engineer",
    "Test Automation", 
    "Playwright",
    "TypeScript",
    "React",
    "Next.js",
    "Web Development",
    "Software Testing",
    "Czech Republic"
  ],
  authors: [{ name: "Petr Kindlmann", url: "mailto:thepetr@gmail.com" }],
  creator: "Petr Kindlmann",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "Petr Kindlmann Portfolio",
    locale: "en_US",
    url: "https://petrkindlmann.dev",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Petr Kindlmann - QA-Minded Developer Portfolio"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    creator: "@petrkindlmann",
    images: ["/og-image.jpg"]
  }
};

// Helper function to create page-specific metadata
export function createMetadata(
  title: string,
  description: string,
  path: string = "",
  additionalImages?: Array<{ url: string; width: number; height: number; alt: string }>
): Metadata {
  const fullUrl = `https://petrkindlmann.dev${path}`;
  
  return {
    ...baseMetadata,
    title,
    description,
    openGraph: {
      ...baseMetadata.openGraph,
      title,
      description,
      url: fullUrl,
      images: additionalImages || baseMetadata.openGraph?.images || []
    },
    twitter: {
      ...baseMetadata.twitter,
      title,
      description
    },
    alternates: {
      canonical: fullUrl
    }
  };
}

// Structured data helpers
export function createPersonSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Petr Kindlmann",
    jobTitle: "QA Automation Engineer & Full-Stack Developer",
    description: "QA automation engineer building fast, reliable web applications with comprehensive testing and AI integration.",
    url: "https://petrkindlmann.dev",
    email: "thepetr@gmail.com",
    sameAs: [
      "https://twitter.com/petrkindlmann",
      "https://github.com/petrkindlmann",
      "https://linkedin.com/in/petrkindlmann"
    ],
    address: {
      "@type": "PostalAddress",
      addressCountry: "CZ",
      addressLocality: "Czech Republic"
    },
    knowsAbout: [
      "Test Automation",
      "Quality Assurance",
      "Playwright",
      "TypeScript",
      "React",
      "Next.js",
      "Web Development",
      "Software Testing"
    ]
  };
}

export function createBlogPostSchema(post: {
  title: string;
  description: string;
  publishedAt: string;
  slug: string;
  tags: string[];
  readTime: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    author: {
      "@type": "Person",
      name: "Petr Kindlmann",
      url: "https://petrkindlmann.dev"
    },
    publisher: {
      "@type": "Person",
      name: "Petr Kindlmann",
      url: "https://petrkindlmann.dev"
    },
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    url: `https://petrkindlmann.dev/blog/${post.slug}`,
    keywords: post.tags.join(", "),
    timeRequired: post.readTime,
    inLanguage: "en-US",
    isAccessibleForFree: true
  };
}

export function createWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Website",
    name: "Petr Kindlmann Portfolio",
    description: "QA automation engineer and full-stack developer building fast, beautiful, and reliable web applications with AI.",
    url: "https://petrkindlmann.dev",
    author: {
      "@type": "Person",
      name: "Petr Kindlmann"
    },
    inLanguage: "en-US",
    copyrightYear: new Date().getFullYear(),
    genre: ["Technology", "Software Development", "Quality Assurance"],
    keywords: "QA Engineer, Test Automation, Playwright, TypeScript, React, Next.js"
  };
}

export function createCaseStudySchema(study: {
  title: string;
  subtitle: string;
  slug: string;
  category: string;
  duration: string;
  technologies: string[];
  overview: string;
  challenge: string;
  solution: string;
  results: Array<{
    metric: string;
    improvement: string;
  }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@subtype": "CaseStudy",
    name: study.title,
    description: study.subtitle,
    url: `https://petrkindlmann.dev/case-studies/${study.slug}`,
    author: {
      "@type": "Person",
      name: "Petr Kindlmann",
      url: "https://petrkindlmann.dev"
    },
    genre: study.category,
    keywords: study.technologies.join(", "),
    abstract: study.overview,
    about: [
      {
        "@type": "Thing",
        name: "Challenge",
        description: study.challenge
      },
      {
        "@type": "Thing",
        name: "Solution",
        description: study.solution
      },
      {
        "@type": "Thing",
        name: "Results",
        description: study.results.map(r => `${r.metric}: ${r.improvement}`).join("; ")
      }
    ],
    timeRequired: study.duration,
    inLanguage: "en-US"
  };
}
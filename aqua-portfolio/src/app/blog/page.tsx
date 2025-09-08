import AquaLayout from '@/components/AquaLayout'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import NewsletterForm from '@/components/ui/NewsletterForm'
import { createMetadata, createBlogPostSchema } from '@/lib/metadata'
import blogPosts from '@/data/blog-posts.json'
import Script from 'next/script'

export const metadata = createMetadata(
  "Blog | Petr Kindlmann",
  "Practical insights, lessons learned, and best practices from 4+ years of QA automation experience across enterprise projects.",
  "/blog"
);

export default function BlogPage() {
  const featuredPosts = blogPosts.filter(post => post.featured)

  // Generate structured data for the blog listing
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "QA Insights Blog",
    "description": "Practical insights and best practices from QA automation experience",
    "author": {
      "@type": "Person",
      "name": "Petr Kindlmann",
      "url": "https://petrkindlmann.dev"
    },
    "blogPost": blogPosts.map(post => createBlogPostSchema({
      title: post.title,
      description: post.excerpt,
      publishedAt: post.publishedAt,
      slug: post.slug,
      tags: post.tags,
      readTime: post.readTime
    }))
  };

  return (
    <AquaLayout>
      <Script
        id="blog-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent mb-8 tracking-tight leading-tight">
            QA Insights Blog
          </h1>
          <p className="text-2xl md:text-3xl text-midnight-300 max-w-4xl mx-auto font-light leading-relaxed">
            Practical insights, lessons learned, and <span className="font-semibold text-cyan-600">best practices</span> from <span className="font-semibold text-blue-600">4+ years of QA automation</span> experience across enterprise projects.
          </p>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="pb-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-midnight">Featured Articles</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {featuredPosts.map((post) => (
                <Card 
                  key={post.id}
                  className="group p-8 hover:shadow-2xl hover:shadow-aqua-500/20 transition-all duration-300 border border-aqua-100 bg-white/70 backdrop-blur-sm"
                >
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Badge variant="outline" className="border-cyan-200 text-cyan-700">
                      {post.category}
                    </Badge>
                    <span className="text-sm text-slate-500">{post.readTime}</span>
                    <span className="text-sm text-slate-500">
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-midnight mb-3 group-hover:text-cyan-600 transition-colors tracking-tight">
                    {post.title}
                  </h3>
                  
                  <p className="text-midnight-300 mb-6 leading-relaxed text-lg font-light">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary"
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {post.tags.length > 3 && (
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
                        +{post.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-400 text-white px-6 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-cyan-500 transition-all duration-300 shadow-lg shadow-cyan-500/25"
                  >
                    Read Article
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Posts */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-400 to-slate-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">All Articles</h2>
          </div>
          
          <div className="grid gap-6">
            {blogPosts.map((post) => (
              <Card 
                key={post.id}
                className="group p-6 hover:shadow-xl hover:shadow-aqua-500/10 transition-all duration-300 border border-slate-200 bg-white/50 backdrop-blur-sm"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <Badge variant="outline" className="border-cyan-200 text-cyan-700">
                        {post.category}
                      </Badge>
                      {post.featured && (
                        <Badge className="bg-gradient-to-r from-cyan-500 to-cyan-400 text-white">
                          Featured
                        </Badge>
                      )}
                      <span className="text-sm text-slate-500">{post.readTime}</span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-aqua-600 transition-colors">
                      {post.title}
                    </h3>
                    
                    <p className="text-slate-600 text-sm leading-relaxed mb-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {post.tags.slice(0, 4).map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="secondary"
                          className="bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 md:flex-col md:items-end text-sm text-slate-500">
                    <span>
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 text-aqua-600 font-medium hover:text-aqua-700 transition-colors"
                    >
                      Read
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="relative py-20 overflow-hidden">
        {/* Elegant geometric background with animations */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 animate-pulse duration-[4000ms]"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-cyan-100/40 to-transparent rounded-full blur-3xl animate-[float_6s_ease-in-out_infinite]"></div>
          <div className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-bl from-blue-100/30 to-transparent rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite_reverse]"></div>
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-tr from-cyan-50/50 to-transparent rounded-full blur-3xl animate-[float_7s_ease-in-out_infinite]"></div>
        </div>
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="relative max-w-4xl mx-auto px-6 text-center z-10 animate-[slideInUp_1s_ease-out]">
          <h2 className="text-4xl md:text-5xl font-black text-midnight mb-8 tracking-tight leading-tight opacity-0 animate-[fadeInUp_1s_ease-out_0.2s_forwards]">
            Stay Updated on QA Best Practices
          </h2>
          <p className="text-2xl md:text-2xl text-midnight-300 mb-10 font-light leading-relaxed opacity-0 animate-[fadeInUp_1s_ease-out_0.4s_forwards]">
            Get notified when I publish new insights on <span className="font-semibold text-cyan-600 hover:text-cyan-500 transition-colors duration-300">test automation</span>, <span className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-300">quality strategies</span>, and industry trends.
          </p>
          <NewsletterForm />
          <p className="text-sm text-midnight-300 opacity-0 animate-[fadeInUp_1s_ease-out_0.8s_forwards]">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </section>
    </AquaLayout>
  )
}
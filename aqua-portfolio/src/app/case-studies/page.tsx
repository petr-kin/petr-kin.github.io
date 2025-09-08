import AquaLayout from '@/components/AquaLayout'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { createMetadata, createCaseStudySchema } from '@/lib/metadata'
import caseStudies from '@/data/case-studies.json'
import Script from 'next/script'

export const metadata = createMetadata(
  "Case Studies | Petr Kindlmann",
  "Deep dives into real-world QA automation projects, challenges solved, and measurable results achieved through strategic test implementation.",
  "/case-studies"
);

export default function CaseStudiesPage() {
  // Generate structured data for case studies
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "QA Automation Case Studies",
    "description": "Real-world QA automation projects and their measurable results",
    "author": {
      "@type": "Person",
      "name": "Petr Kindlmann",
      "url": "https://petrkindlmann.dev"
    },
    "hasPart": caseStudies.map(study => createCaseStudySchema(study))
  };

  return (
    <AquaLayout>
      <Script
        id="case-studies-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-aqua-600 to-aqua-400 bg-clip-text text-transparent mb-6">
            Case Studies
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Deep dives into real-world QA automation projects, challenges solved, and measurable results achieved through strategic test implementation.
          </p>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid gap-8">
            {caseStudies.map((study) => (
              <Card 
                key={study.id}
                className="group p-8 hover:shadow-2xl hover:shadow-aqua-500/20 transition-all duration-300 border border-aqua-100 bg-white/70 backdrop-blur-sm"
              >
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Content */}
                  <div className="md:col-span-2">
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <Badge variant="outline" className="border-aqua-200 text-aqua-700">
                        {study.category}
                      </Badge>
                      <span className="text-sm text-slate-500">
                        {study.duration} • {study.team}
                      </span>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-aqua-600 transition-colors">
                      {study.title}
                    </h2>
                    
                    <p className="text-slate-600 mb-4 leading-relaxed">
                      {study.subtitle}
                    </p>
                    
                    <p className="text-slate-700 mb-6 leading-relaxed">
                      {study.overview}
                    </p>
                    
                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {study.technologies.map((tech) => (
                        <Badge 
                          key={tech} 
                          variant="secondary"
                          className="bg-slate-100 text-slate-700 hover:bg-slate-200"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    
                    <Link
                      href={`/case-studies/${study.slug}`}
                      className="inline-flex items-center gap-2 text-aqua-600 font-medium hover:text-aqua-700 transition-colors group"
                    >
                      Read Full Case Study
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                  
                  {/* Results Summary */}
                  <div className="bg-gradient-to-br from-aqua-50 to-blue-50 p-6 rounded-xl border border-aqua-100">
                    <h3 className="font-semibold text-slate-900 mb-4">Key Results</h3>
                    <div className="space-y-4">
                      {study.results.slice(0, 2).map((result, idx) => (
                        <div key={idx} className="border-l-4 border-aqua-400 pl-4">
                          <div className="font-semibold text-aqua-700 text-lg">
                            {result.improvement}
                          </div>
                          <div className="text-sm text-slate-600">
                            {result.metric}
                          </div>
                        </div>
                      ))}
                      
                      {study.results.length > 2 && (
                        <div className="text-xs text-slate-500 pt-2">
                          +{study.results.length - 2} more metrics
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Elegant geometric background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-cyan-100/40 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-bl from-blue-100/30 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-tr from-cyan-50/50 to-transparent rounded-full blur-3xl"></div>
        </div>
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="relative max-w-4xl mx-auto px-6 text-center z-10">
          <h2 className="text-4xl md:text-5xl font-black text-midnight mb-8 tracking-tight leading-tight">
            Need Expert QA Consultation?
          </h2>
          <p className="text-2xl md:text-2xl text-midnight-300 mb-10 font-light leading-relaxed">
            Let&apos;s discuss how these capabilities can be applied to <span className="font-semibold text-cyan-600">optimize your testing strategy</span> and <span className="font-semibold text-blue-600">improve quality outcomes</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/#contact"
              className="inline-flex items-center gap-2 bg-sunny-yellow text-midnight px-8 py-4 rounded-lg font-semibold hover:bg-sunny-yellow-200 transition-colors"
            >
              Schedule Consultation
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </Link>
            <Link
              href="/expertise"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-400 text-white px-8 py-4 rounded-lg font-semibold hover:from-cyan-600 hover:to-cyan-500 transition-all duration-300 shadow-lg shadow-cyan-500/25"
            >
              View Capabilities
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </AquaLayout>
  )
}
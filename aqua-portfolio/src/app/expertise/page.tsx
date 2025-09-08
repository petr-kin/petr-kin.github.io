import AquaLayout from '@/components/AquaLayout'
import Link from 'next/link'
import SectionDividerWave from '@/components/SectionDividerWave'
import { Suspense, lazy } from 'react'
import { createMetadata } from '@/lib/metadata'

export const metadata = createMetadata(
  "Expertise | Petr Kindlmann",
  "Comprehensive QA automation expertise with Playwright, TypeScript, React, and AI integration. Explore interactive demos and technical showcases.",
  "/expertise"
);

// Lazy load heavy components for better performance
const TestDemo = lazy(() => import('@/components/sections/TestDemo'))
const TestingComparisonSection = lazy(() => import('@/components/sections/TestingComparison'))
const TestingInActionSection = lazy(() => import('@/components/sections/TestingInActionSection'))
const InteractiveShowcase = lazy(() => import('@/components/sections/InteractiveShowcase'))
const QALab = lazy(() => import('@/components/sections/QALab'))
const AIAgentsSection = lazy(() => import('@/components/sections/AIAgentsSection'))
const DemoVideosShowcase = lazy(() => import('@/components/ui/DemoVideosShowcase'))

// Loading component for sections
const SectionLoader = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="max-w-6xl mx-auto px-6">
      <div className="space-y-8">
        <div className="h-8 bg-slate-200 rounded-lg w-96 mx-auto"></div>
        <div className="h-4 bg-slate-100 rounded w-full max-w-2xl mx-auto"></div>
        <div className="h-4 bg-slate-100 rounded w-3/4 max-w-xl mx-auto"></div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-100 rounded-2xl"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

export default function ExpertisePage() {
  return (
    <AquaLayout>
      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent mb-16 tracking-tight leading-tight">
            QA Expertise & Capabilities
          </h1>
        </div>
      </section>

      
      {/* Interactive Demo */}
      <section id="demo" className="bg-gradient-to-b from-blue-50/50 to-aqua-50/30">
        <Suspense fallback={<SectionLoader className="py-24" />}>
          <TestDemo />
        </Suspense>
      </section>
      
      <SectionDividerWave direction="up" variant="aqua" />
      
      {/* Testing Comparison */}
      <section id="comparison">
        <Suspense fallback={<SectionLoader className="py-24" />}>
          <TestingComparisonSection />
        </Suspense>
      </section>
      
      <SectionDividerWave direction="up" variant="aqua" />
      
      {/* Testing in Action */}
      <section id="testing-action" className="bg-gradient-to-b from-blue-50/50 to-aqua-50/30">
        <Suspense fallback={<SectionLoader className="py-24" />}>
          <TestingInActionSection />
        </Suspense>
      </section>
      
      <SectionDividerWave />
      
      {/* Interactive Showcase */}
      <section id="interactive-showcase">
        <Suspense fallback={<SectionLoader className="py-20" />}>
          <InteractiveShowcase />
        </Suspense>
      </section>
      
      <SectionDividerWave direction="up" variant="aqua" />
      
      {/* QA Lab */}
      <section id="qa-lab" className="bg-gradient-to-b from-aqua-50/30 to-blue-50/50">
        <Suspense fallback={<SectionLoader className="py-24" />}>
          <QALab />
        </Suspense>
      </section>

      <SectionDividerWave />
      
      {/* AI Agents & MCPs */}
      <section id="ai-agents">
        <Suspense fallback={<SectionLoader className="py-24" />}>
          <AIAgentsSection />
        </Suspense>
      </section>

      {/* Demo Videos */}
      <Suspense fallback={<SectionLoader className="py-24" />}>
        <DemoVideosShowcase />
      </Suspense>

      <SectionDividerWave direction="up" variant="aqua" />

      {/* Consultation CTA */}
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
            <a
              href="/case-studies"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-400 text-white px-8 py-4 rounded-lg font-semibold hover:from-cyan-600 hover:to-cyan-500 transition-all duration-300 shadow-lg shadow-cyan-500/25"
            >
              View Case Studies
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </AquaLayout>
  )
}
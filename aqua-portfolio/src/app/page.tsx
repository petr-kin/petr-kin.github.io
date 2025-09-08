import AquaLayout from '@/components/AquaLayout'
import HeroWave from '@/components/HeroWave'
import SkillsMarquee from '@/components/sections/SkillsMarquee'
import FeaturedProjects from '@/components/sections/FeaturedProjects'
import FAQ from '@/components/sections/FAQ'
import Contact from '@/components/sections/Contact'
import ScrollProgress from '@/components/ScrollProgress'
import GlassNavigation from '@/components/GlassNavigation'
import SectionDividerWave from '@/components/SectionDividerWave'
import Link from 'next/link'

export default function Home() {
  return (
    <AquaLayout>
      <ScrollProgress />
      <GlassNavigation />
      
      <section id="home">
        <HeroWave />
      </section>
      
      <SectionDividerWave />
      
      <section id="skills">
        <SkillsMarquee />
      </section>
      
      <SectionDividerWave direction="up" variant="aqua" />
      
      <section id="projects">
        <FeaturedProjects />
      </section>
      
      <SectionDividerWave />

      {/* Featured Content Navigation */}
      <section className="py-20 bg-gradient-to-b from-blue-50/50 to-aqua-50/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-midnight via-true-blue to-midnight bg-clip-text text-transparent mb-6 tracking-tight leading-tight">
              Explore My QA Expertise
            </h2>
            <p className="text-xl md:text-2xl text-midnight-300 max-w-4xl mx-auto font-light leading-relaxed">
              Dive deeper into comprehensive testing capabilities, real-world case studies, and practical insights from enterprise QA implementations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Expertise */}
            <Link href="/expertise" className="group">
              <div className="bg-white/70 backdrop-blur-sm border border-aqua-100 rounded-2xl p-8 h-full transition-all duration-300 hover:shadow-2xl hover:shadow-aqua-500/20 hover:-translate-y-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-midnight mb-4 group-hover:text-true-blue transition-colors tracking-tight">
                  Technical Expertise
                </h3>
                <p className="text-midnight-300 leading-relaxed mb-6 font-light text-lg">
                  Interactive demos, testing comparisons, automation frameworks, and comprehensive QA capabilities showcase.
                </p>
                <div className="flex items-center text-true-blue font-semibold group-hover:text-midnight transition-colors text-lg">
                  Explore Capabilities
                  <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Case Studies */}
            <Link href="/case-studies" className="group">
              <div className="bg-white/70 backdrop-blur-sm border border-aqua-100 rounded-2xl p-8 h-full transition-all duration-300 hover:shadow-2xl hover:shadow-aqua-500/20 hover:-translate-y-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-midnight mb-4 group-hover:text-true-blue transition-colors tracking-tight">
                  Case Studies
                </h3>
                <p className="text-midnight-300 leading-relaxed mb-6 font-light text-lg">
                  Detailed project breakdowns with measurable results, challenges solved, and strategic implementations.
                </p>
                <div className="flex items-center text-true-blue font-semibold group-hover:text-midnight transition-colors text-lg">
                  View Projects
                  <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Blog */}
            <Link href="/blog" className="group">
              <div className="bg-white/70 backdrop-blur-sm border border-aqua-100 rounded-2xl p-8 h-full transition-all duration-300 hover:shadow-2xl hover:shadow-aqua-500/20 hover:-translate-y-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-midnight mb-4 group-hover:text-true-blue transition-colors tracking-tight">
                  QA Insights Blog
                </h3>
                <p className="text-midnight-300 leading-relaxed mb-6 font-light text-lg">
                  Practical insights, best practices, and lessons learned from 4+ years of QA automation experience.
                </p>
                <div className="flex items-center text-true-blue font-semibold group-hover:text-midnight transition-colors text-lg">
                  Read Articles
                  <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <SectionDividerWave direction="up" variant="aqua" />
      
      <FAQ />
      
      <Contact />
    </AquaLayout>
  )
}

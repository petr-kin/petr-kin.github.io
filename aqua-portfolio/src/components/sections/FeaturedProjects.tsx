'use client'

import { motion } from 'framer-motion'
import AdvancedProjectCard from '@/components/ui/AdvancedProjectCard'
import MagneticButton from '@/components/ui/MagneticButton'
import projectsData from '@/data/projects.json'

export default function FeaturedProjects() {
  const featuredProjects = projectsData.filter(project => project.featured)

  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50/50">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-6 justify-center">
            <div className="h-px w-12 bg-gradient-to-r from-cyan-500 to-cyan-400"></div>
            <span className="text-sm font-medium text-cyan-600 tracking-wider uppercase">
              Featured Work
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-cyan-500 to-cyan-400"></div>
          </div>
          
          <h2 className="text-4xl font-bold text-midnight mb-4">
            Featured Projects
          </h2>
          
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Real-world solutions that demonstrate the intersection of testing excellence, 
            AI innovation, and business impact
          </p>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredProjects.map((project, index) => (
            <motion.div
              key={project.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1 
              }}
            >
              <AdvancedProjectCard
                slug={project.slug}
                title={project.title}
                summary={project.summary}
                tags={project.tags}
                media={project.media}
                mediaType={project.mediaType as 'image' | 'video'}
                metrics={project.metrics ? project.metrics as unknown as Record<string, string> : undefined}
                links={project.links}
                featured={project.featured}
              />
            </motion.div>
          ))}
        </div>

        {/* View All Projects CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <MagneticButton>
            <button className="px-8 py-4 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-cyan-500 hover:text-cyan-600 transition-all hover:-translate-y-0.5 inline-flex items-center gap-2">
              View All Projects
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  )
}
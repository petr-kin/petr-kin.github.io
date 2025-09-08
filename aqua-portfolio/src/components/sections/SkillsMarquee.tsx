'use client'

import { motion } from 'framer-motion'
import BadgeMarquee from '@/components/BadgeMarquee'
import skillsData from '@/data/skills.json'

export default function SkillsMarquee() {
  return (
    <section className="py-12 bg-aqua-50/30 border-y border-aqua-100/50">
      <div className="mx-auto max-w-full">
        {/* Section Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-medium text-aqua-600 mb-2">
            Core Technologies & Expertise
          </p>
        </motion.div>

        {/* Scrolling Skills */}
        <div className="space-y-4">
          <BadgeMarquee 
            badges={skillsData.primarySkills} 
            speed={25}
            className="mask-gradient"
          />
        </div>
      </div>
    </section>
  )
}
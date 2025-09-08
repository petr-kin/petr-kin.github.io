'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, MapPin, Calendar, ExternalLink } from 'lucide-react'

export default function Contact() {
  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'thepetr@gmail.com',
      href: 'mailto:thepetr@gmail.com',
      color: 'text-aqua-600'
    },
    {
      icon: MapPin,
      label: 'Location',
      value: 'České Budějovice, Czech Republic',
      href: null,
      color: 'text-aqua-600'
    },
    {
      icon: Calendar,
      label: 'Timezone',
      value: 'CET (UTC+1)',
      href: null,
      color: 'text-purple-600'
    }
  ]

  const socialLinks = [
    { name: 'LinkedIn', href: '#linkedin', icon: 'LI' },
    { name: 'GitHub', href: '#github', icon: 'GH' },
    { name: 'Twitter', href: '#twitter', icon: 'TW' },
    { name: 'Resume', href: '/Petr-Resume.pdf', icon: 'CV' }
  ]

  return (
    <section id="contact" className="py-24 bg-gradient-to-br from-background to-aqua-50/20">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card text-sm font-medium text-primary mb-4">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Let&apos;s Connect
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-midnight mb-4 font-display">
            Ready to Build Something Great?
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Available for test automation projects, QA consulting, and full-stack development.
            Let&apos;s discuss how we can improve your software quality together.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-4">
              {contactInfo.map((info, index) => {
                const Icon = info.icon
                return (
                  <motion.div
                    key={info.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="glass-card border-aqua-200/50 hover:border-aqua-300/70 transition-all duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl bg-opacity-10 ${info.color} bg-current`}>
                            <Icon className={`h-5 w-5 ${info.color}`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">{info.label}</p>
                            {info.href ? (
                              <a 
                                href={info.href}
                                className="text-lg font-semibold text-midnight hover:text-aqua-600 transition-colors"
                              >
                                {info.value}
                              </a>
                            ) : (
                              <p className="text-lg font-semibold text-midnight">{info.value}</p>
                            )}
                          </div>
                          {info.href && (
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>

            {/* Social Links */}
            <motion.div
              className="pt-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <p className="text-sm font-medium text-muted-foreground mb-4">
                Connect with me on social platforms:
              </p>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    className="w-12 h-12 rounded-xl glass-card border border-aqua-200/50 flex items-center justify-center text-sm font-semibold text-aqua-600 hover:text-aqua-700 hover:bg-aqua-50 transition-all duration-200"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    title={social.name}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Contact CTA */}
          <motion.div
            className="flex flex-col justify-center space-y-8"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="glass-card border-aqua-200/50 p-8">
              <CardContent className="p-0 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-midnight">
                    Start Your Project
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Whether you need comprehensive test automation, performance optimization, 
                    or full-stack development with built-in quality assurance, I&apos;m here to help.
                  </p>
                </div>

                <div className="space-y-4">
                  <Button
                    size="lg"
                    className="w-full rounded-full px-8 py-6 text-base font-semibold bg-aqua-gradient hover:shadow-aqua hover:shadow-lg transition-all duration-200 group"
                    asChild
                  >
                    <motion.a
                      href="mailto:thepetr@gmail.com?subject=Project Inquiry&body=Hi Petr,%0A%0AI&apos;d like to discuss a project with you.%0A%0AProject type: [QA Automation / Full-stack Development / Consulting]%0ATimeline: %0ABudget range: %0A%0AProject details:%0A"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Send Project Inquiry
                    </motion.a>
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full rounded-full px-8 py-6 text-base font-semibold glass-card border-aqua-200 hover:bg-aqua-50 group"
                    asChild
                  >
                    <motion.a
                      href="mailto:thepetr@gmail.com?subject=Quick Chat Request&body=Hi Petr,%0A%0AI&apos;d like to schedule a quick call to discuss potential collaboration.%0A%0APreferred time: %0ATimezone: %0ATopic: %0A"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule a Call
                    </motion.a>
                  </Button>
                </div>

                <div className="pt-4 border-t border-aqua-100">
                  <p className="text-sm text-muted-foreground text-center">
                    💬 Typically responds within 24 hours
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
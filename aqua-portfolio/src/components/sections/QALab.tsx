'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy, CheckCircle, AlertCircle, Clock, Zap } from 'lucide-react'
import { useState } from 'react'

export default function QALab() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const codeExample = `// Intelligent Selector Healing
await page.locator('[data-testid="submit-btn"]')
  .or(page.locator('button:has-text("Submit")'))
  .or(page.locator('.btn-primary'))
  .click();

// Performance Assertions
await expect(page).toHaveLoadState('networkidle');
const metrics = await page.evaluate(() => performance.now());
expect(metrics).toBeLessThan(3000);`

  const stats = [
    {
      icon: CheckCircle,
      label: 'Test Success Rate',
      value: '98.5%',
      trend: '+2.3%',
      color: 'text-aqua-600'
    },
    {
      icon: Zap,
      label: 'Avg Test Speed',
      value: '2.1s',
      trend: '-0.8s',
      color: 'text-aqua-600'
    },
    {
      icon: AlertCircle,
      label: 'Auto-Healed',
      value: '156',
      trend: '+23',
      color: 'text-orange-600'
    },
    {
      icon: Clock,
      label: 'Weekly Runs',
      value: '2,847',
      trend: '+412',
      color: 'text-purple-600'
    }
  ]

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(codeExample)
    setCopiedCode('playwright-example')
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <section className="py-24 bg-gradient-to-br from-background to-aqua-50/30">
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
            QA Laboratory
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-midnight mb-4 font-display">
            Testing in Action
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real metrics from production testing suites. Automated healing, performance monitoring,
            and intelligent failure recovery in action.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Code Example */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="glass-card border-aqua-200/50 overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-midnight flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-aqua-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="ml-2">playwright-example.spec.ts</span>
                  </CardTitle>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyCode}
                    className="h-8 w-8 p-0 hover:bg-aqua-100"
                  >
                    {copiedCode === 'playwright-example' ? (
                      <CheckCircle className="h-4 w-4 text-aqua-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <pre className="bg-ink-900 text-aqua-100 p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{codeExample}</code>
                </pre>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="secondary" className="bg-aqua-50 text-aqua-700 border-aqua-200">
                    Resilient Selectors
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    Performance Testing
                  </Badge>
                  <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                    Auto-Healing
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Metrics Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                >
                  <Card className="glass-card border-aqua-200/50 hover:shadow-aqua transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-opacity-10 ${stat.color} bg-current`}>
                            <Icon className={`h-5 w-5 ${stat.color}`} />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                            <p className="text-2xl font-bold text-midnight">{stat.value}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant="secondary" 
                            className="bg-aqua-50 text-aqua-700 border-aqua-200"
                          >
                            {stat.trend}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>

        {/* Test Suite Overview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="glass-card border-aqua-200/50">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-midnight">
                Current Test Suite Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-aqua-600">847</p>
                  <p className="text-sm text-muted-foreground">Tests Passing</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">23</p>
                  <p className="text-sm text-muted-foreground">Auto-Fixed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-aqua-600">12</p>
                  <p className="text-sm text-muted-foreground">Sites Monitored</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">5.2s</p>
                  <p className="text-sm text-muted-foreground">Avg Runtime</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
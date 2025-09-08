'use client';

import React, { useState, useEffect, useRef, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimelinePhase {
  id: string;
  title: string;
  period: string;
  description: string;
  achievements: string[];
  technologies: string[];
  challenges: string[];
  impact: string;
  color: string;
  icon: React.ReactNode;
  stats?: { label: string; value: string }[];
}

const TimelineJourney = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [visiblePhases, setVisiblePhases] = useState<Set<string>>(new Set());
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(-1);

  const phases: TimelinePhase[] = useMemo(() => [
    {
      id: 'manual-testing',
      title: 'Manual Testing Era',
      period: '2020-2021',
      description: 'Started with manual testing approaches, learning the fundamentals of quality assurance and test case design.',
      achievements: [
        'Developed comprehensive test case documentation',
        'Established bug tracking and reporting processes',
        'Created manual regression testing workflows',
        'Built foundation in testing methodologies'
      ],
      technologies: ['Excel', 'JIRA', 'TestRail', 'Postman'],
      challenges: [
        'Time-consuming regression cycles',
        'Human error in repetitive tasks',
        'Scaling test coverage manually',
        'Inconsistent test execution'
      ],
      impact: 'Built solid foundation in QA principles and attention to detail',
      color: '#64748b',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      stats: [
        { label: 'Test Cases', value: '500+' },
        { label: 'Bugs Found', value: '200+' },
        { label: 'Projects', value: '8' }
      ]
    },
    {
      id: 'automation-beginnings',
      title: 'First Automation Steps',
      period: '2021-2022',
      description: 'Transitioned into test automation, learning Selenium and building first automated test suites.',
      achievements: [
        'Built first Selenium WebDriver tests',
        'Implemented Page Object Model pattern',
        'Created CI/CD integration pipelines',
        'Reduced regression time by 60%'
      ],
      technologies: ['Selenium', 'Java', 'TestNG', 'Maven', 'Jenkins'],
      challenges: [
        'Flaky tests due to timing issues',
        'Brittle selectors breaking frequently',
        'Complex setup and maintenance',
        'Limited cross-browser testing'
      ],
      impact: 'Achieved significant time savings and consistent test execution',
      color: '#059669',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        </svg>
      ),
      stats: [
        { label: 'Tests Automated', value: '150+' },
        { label: 'Time Saved', value: '60%' },
        { label: 'Frameworks', value: '3' }
      ]
    },
    {
      id: 'modern-tools',
      title: 'Modern Tool Mastery',
      period: '2022-2023',
      description: 'Adopted cutting-edge tools like Playwright and Cypress, focusing on reliability and developer experience.',
      achievements: [
        'Migrated to Playwright for better reliability',
        'Implemented visual testing strategies',
        'Built comprehensive test reporting',
        'Achieved 95% test stability'
      ],
      technologies: ['Playwright', 'Cypress', 'TypeScript', 'Docker', 'GitHub Actions'],
      challenges: [
        'Learning new tool ecosystems',
        'Maintaining multiple test frameworks',
        'Cross-platform compatibility issues',
        'Performance optimization needs'
      ],
      impact: 'Dramatically improved test reliability and development velocity',
      color: '#7c3aed',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      stats: [
        { label: 'Test Stability', value: '95%' },
        { label: 'Execution Speed', value: '3x faster' },
        { label: 'Platforms', value: '5+' }
      ]
    },
    {
      id: 'ai-integration',
      title: 'AI-Powered Testing',
      period: '2023-2024',
      description: 'Pioneered AI integration in testing workflows, developing intelligent test healing and generation capabilities.',
      achievements: [
        'Developed AI-powered selector healing',
        'Built intelligent test generation systems',
        'Created self-maintaining test suites',
        'Reduced maintenance overhead by 80%'
      ],
      technologies: ['OpenAI API', 'Claude API', 'Python', 'Machine Learning', 'Neural Networks'],
      challenges: [
        'Integrating AI APIs effectively',
        'Training models for test-specific tasks',
        'Balancing automation with control',
        'Ensuring AI decision reliability'
      ],
      impact: 'Revolutionary reduction in maintenance time and improved test coverage',
      color: '#dc2626',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      stats: [
        { label: 'Maintenance Reduction', value: '80%' },
        { label: 'AI Healing Rate', value: '94%' },
        { label: 'Auto-Generated Tests', value: '300+' }
      ]
    },
    {
      id: 'future-vision',
      title: 'Future of Testing',
      period: '2024+',
      description: 'Leading the next generation of autonomous testing systems with advanced AI capabilities.',
      achievements: [
        'Autonomous test suite management',
        'Predictive test failure analysis',
        'Zero-maintenance test frameworks',
        'AI-driven quality insights'
      ],
      technologies: ['GPT-4', 'Claude-3', 'Advanced ML', 'Autonomous Systems', 'Predictive Analytics'],
      challenges: [
        'Achieving full test autonomy',
        'Maintaining human oversight',
        'Scaling AI systems globally',
        'Ensuring ethical AI practices'
      ],
      impact: 'Defining the future of intelligent software testing',
      color: '#0ea5e9',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      stats: [
        { label: 'Autonomy Level', value: '98%' },
        { label: 'Prediction Accuracy', value: '96%' },
        { label: 'Future Ready', value: '∞' }
      ]
    }
  ], []);

  // Auto-reveal phases with staggered animation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    const startAnimation = () => {
      timer = setInterval(() => {
        setCurrentPhaseIndex((prev: number) => {
          const nextIndex = prev + 1;
          if (nextIndex < phases.length) {
            setVisiblePhases(prevVisible => new Set([...prevVisible, phases[nextIndex].id]));
            return nextIndex;
          } else {
            // Clear interval when done
            clearInterval(timer);
            return prev;
          }
        });
      }, 800);
    };

    // Show first phase immediately
    if (phases.length > 0) {
      setVisiblePhases(new Set([phases[0].id]));
      startAnimation();
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [phases]);

  const PhaseCard = memo(({ phase, index }: { phase: TimelinePhase; index: number }) => {
    const isVisible = visiblePhases.has(phase.id);
    const isSelected = selectedPhase === phase.id;
    const isLeft = index % 2 === 0;

    return (
      <motion.div
        className={`flex items-center mb-12 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
        initial={{ opacity: 0, y: 50 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: index * 0.1 }}
      >
        {/* Content Card */}
        <motion.div
          className={`w-5/12 ${isLeft ? 'pr-8' : 'pl-8'}`}
          whileHover={{ scale: 1.02 }}
        >
          <div 
            className={`p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
              isSelected 
                ? `border-${phase.color} bg-gradient-to-br from-white to-slate-50 shadow-xl`
                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg'
            }`}
            style={{ 
              borderColor: isSelected ? phase.color : undefined,
              boxShadow: isSelected ? `0 0 30px ${phase.color}20` : undefined
            }}
            onClick={() => setSelectedPhase(isSelected ? null : phase.id)}
          >
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${phase.color}20`, color: phase.color }}
              >
                {phase.icon}
              </div>
              <div>
                <h3 className="font-bold text-midnight">{phase.title}</h3>
                <div className="text-sm text-slate-600">{phase.period}</div>
              </div>
            </div>
            
            <p className="text-slate-700 mb-4">{phase.description}</p>

            {/* Stats */}
            {phase.stats && (
              <div className="flex gap-4 mb-4">
                {phase.stats.map((stat, statIndex) => (
                  <div key={statIndex} className="text-center">
                    <div className="font-bold text-lg" style={{ color: phase.color }}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-slate-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

            <motion.div
              className="text-sm text-slate-600"
              style={{ color: phase.color }}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Click to explore details →
            </motion.div>
          </div>
        </motion.div>

        {/* Timeline Node */}
        <div className="w-2/12 flex justify-center relative z-10">
          <motion.div
            className="w-4 h-4 rounded-full border-4 border-white shadow-lg"
            style={{ backgroundColor: phase.color }}
            animate={isVisible ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.8, delay: index * 0.2 }}
          />
        </div>

        {/* Spacer */}
        <div className="w-5/12" />
      </motion.div>
    );
  });

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200/50 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/50">
          <h3 className="text-xl font-bold text-midnight mb-2">Testing Evolution Journey</h3>
          <p className="text-slate-600">From manual testing to AI-powered automation - a story of continuous innovation</p>
        </div>

        <div className="p-8">
          {/* Timeline Container */}
          <div ref={containerRef} className="relative">
            {/* Central Timeline Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-slate-300 via-slate-400 to-slate-300 transform -translate-x-1/2" />

            {/* Phase Cards */}
            {phases.map((phase, index) => (
              <PhaseCard key={phase.id} phase={phase} index={index} />
            ))}
          </div>

          {/* Detailed View */}
          <AnimatePresence>
            {selectedPhase && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-8 overflow-hidden"
              >
                {(() => {
                  const phase = phases.find(p => p.id === selectedPhase);
                  if (!phase) return null;

                  return (
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div 
                            className="p-3 rounded-lg"
                            style={{ backgroundColor: `${phase.color}20`, color: phase.color }}
                          >
                            {phase.icon}
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-midnight">{phase.title}</h4>
                            <div className="text-slate-600">{phase.period}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedPhase(null)}
                          className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      <div className="grid md:grid-cols-3 gap-6">
                        {/* Achievements */}
                        <div>
                          <h5 className="font-semibold text-midnight mb-3">Key Achievements</h5>
                          <div className="space-y-2">
                            {phase.achievements.map((achievement, index) => (
                              <motion.div
                                key={index}
                                className="flex items-start gap-2 text-sm text-slate-700"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: phase.color }} />
                                {achievement}
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        {/* Technologies */}
                        <div>
                          <h5 className="font-semibold text-midnight mb-3">Technologies</h5>
                          <div className="flex flex-wrap gap-2">
                            {phase.technologies.map((tech, index) => (
                              <motion.span
                                key={index}
                                className="px-2 py-1 bg-white rounded-full text-xs border border-slate-200"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                              >
                                {tech}
                              </motion.span>
                            ))}
                          </div>
                        </div>

                        {/* Challenges */}
                        <div>
                          <h5 className="font-semibold text-midnight mb-3">Challenges Overcome</h5>
                          <div className="space-y-2">
                            {phase.challenges.map((challenge, index) => (
                              <motion.div
                                key={index}
                                className="text-sm text-slate-600"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                • {challenge}
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Impact */}
                      <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: `${phase.color}10` }}>
                        <h5 className="font-semibold mb-2" style={{ color: phase.color }}>Impact & Results</h5>
                        <p className="text-slate-700">{phase.impact}</p>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TimelineJourney;
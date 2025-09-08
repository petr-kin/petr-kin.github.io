'use client'

import { useState } from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function NewsletterForm() {
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [email, setEmail] = useState('')
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubscribing(true)
    
    // Simulate subscription process
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      setSubscriptionStatus('success')
      setEmail('')
    } catch {
      setSubscriptionStatus('error')
    } finally {
      setIsSubscribing(false)
      setTimeout(() => setSubscriptionStatus('idle'), 3000)
    }
  }

  return (
    <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-6 opacity-0 animate-[fadeInUp_1s_ease-out_0.6s_forwards]">
      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isSubscribing}
        className="flex-1 px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-cyan-500/50 focus:outline-none focus:border-cyan-400 transition-all duration-300 hover:border-slate-300 focus:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        required
      />
      <button 
        type="submit"
        disabled={isSubscribing || !email}
        className={`group px-8 py-4 rounded-lg font-semibold transition-all duration-300 shadow-lg min-w-[120px] ${
          subscriptionStatus === 'success' 
            ? 'bg-green-500 text-white shadow-green-500/25' 
            : subscriptionStatus === 'error'
            ? 'bg-red-500 text-white shadow-red-500/25'
            : 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-white shadow-cyan-500/25 hover:from-cyan-600 hover:to-cyan-500 hover:shadow-xl hover:shadow-cyan-500/30 hover:scale-105 active:scale-95'
        } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
      >
        {isSubscribing ? (
          <span className="flex items-center justify-center gap-2">
            <LoadingSpinner size="sm" />
            Subscribing...
          </span>
        ) : subscriptionStatus === 'success' ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Subscribed!
          </span>
        ) : subscriptionStatus === 'error' ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Error
          </span>
        ) : (
          <span className="flex items-center gap-2">
            Subscribe
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        )}
      </button>
    </form>
  )
}
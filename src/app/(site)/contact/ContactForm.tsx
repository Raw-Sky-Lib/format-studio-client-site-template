'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type FormData = z.infer<typeof schema>

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setStatus('sending')
    try {
      const res = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_name: 'contact', data }),
      })
      if (!res.ok) throw new Error()
      setStatus('sent')
      reset()
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="flex flex-col gap-4 rounded-lg border border-[var(--color-border)] p-8">
        <p className="text-lg font-semibold text-[var(--color-text)]">Message sent!</p>
        <p className="text-[var(--color-text-muted)]">We&#39;ll be in touch soon.</p>
        <button
          onClick={() => setStatus('idle')}
          className="w-fit text-sm text-[var(--color-text-muted)] underline"
        >
          Send another
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-[var(--color-text)]">
          Name
        </label>
        <input
          id="name"
          type="text"
          {...register('name')}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
        />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-[var(--color-text)]">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
        />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm font-medium text-[var(--color-text)]">
          Message
        </label>
        <textarea
          id="message"
          rows={5}
          {...register('message')}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
        />
        {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-500">Something went wrong. Please try again.</p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-fit rounded-md bg-[var(--color-text)] px-5 py-2.5 text-sm font-medium text-[var(--color-bg)] transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}

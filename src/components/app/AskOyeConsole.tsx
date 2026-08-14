'use client'

import type { Route } from 'next'
import Link from 'next/link'
import { FormEvent, useRef, useState } from 'react'

type SearchResult = { documentId: string; domain: string; title: string; summary: string; deepLink: string | null; scope: string }
type AskResult = {
  answer: string
  language: 'en'|'hi'|'hinglish'
  researchRequired: boolean
  highImpact: boolean
  executionState: 'advice_only'|'approval_required'
  results: SearchResult[]
}

export function AskOyeConsole() {
  const [message, setMessage] = useState('')
  const [result, setResult] = useState<AskResult | null>(null)
  const [state, setState] = useState<'idle'|'thinking'|'error'>('idle')
  const [listening, setListening] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  async function ask(event?: FormEvent) {
    event?.preventDefault()
    const query = message.trim()
    if (!query) return
    setState('thinking'); setResult(null)
    try {
      const response = await fetch('/api/ask-oye', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: query }) })
      const body = await response.json()
      if (!response.ok || !body.ok) throw new Error(body.code ?? 'ask_failed')
      setResult(body.response?.result ?? null)
      setState('idle')
    } catch {
      setState('error')
    }
  }

  function startVoice() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setState('error')
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = /[\u0900-\u097F]/.test(message) ? 'hi-IN' : 'en-IN'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onerror = () => { setListening(false); setState('error') }
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? ''
      setMessage((current) => `${current}${current ? ' ' : ''}${transcript}`.trim())
      setTimeout(() => inputRef.current?.focus(), 0)
    }
    recognition.start()
  }

  function speak() {
    if (!result?.answer || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(result.answer)
    utterance.lang = result.language === 'hi' ? 'hi-IN' : 'en-IN'
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
      <section className="rounded-[2.5rem] border-2 border-black bg-white p-5 shadow-[8px_8px_0_#111] md:p-8">
        <p className="text-xs font-black uppercase tracking-[0.24em]">Ask in English · हिंदी · Hinglish</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.055em] md:text-6xl">Say the messy thought. Oye will find the useful next move.</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-black/60">Ask where a setting lives, what a result means, what to do next or why an idea may be wrong. Search is restricted to what your identity is allowed to see. High-impact actions stay approval-bound.</p>
        <form onSubmit={ask} className="mt-7 rounded-[2rem] border-2 border-black bg-[#e7e5e2] p-4 md:p-5">
          <textarea ref={inputRef} value={message} onChange={(event) => setMessage(event.target.value)} rows={6} maxLength={800} placeholder="Example: Mere campaign ka ROAS down kyun hai aur mujhe next kya check karna chahiye?" className="w-full resize-none bg-transparent p-2 text-lg font-semibold leading-8 outline-none placeholder:text-black/35" />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-black/15 pt-4">
            <div className="flex gap-2"><button type="button" onClick={startVoice} className={`rounded-full border-2 border-black px-4 py-2 text-sm font-black ${listening ? 'bg-[#f7adc8]' : 'bg-white'}`}>{listening ? '● Listening' : '🎙 Speak'}</button>{result ? <button type="button" onClick={speak} className="rounded-full border-2 border-black bg-white px-4 py-2 text-sm font-black">🔊 Read answer</button> : null}</div>
            <button type="submit" disabled={state === 'thinking' || !message.trim()} className="rounded-full border-2 border-black bg-black px-6 py-3 text-sm font-black text-white disabled:opacity-40">{state === 'thinking' ? 'Oye is thinking…' : 'Ask Oye →'}</button>
          </div>
        </form>
        {state === 'error' ? <p className="mt-4 rounded-2xl bg-[#f7adc8]/45 p-4 text-sm font-bold">Oye could not complete that request. If voice is unavailable in this browser, type the same thought instead.</p> : null}

        {result ? <article className="mt-7 rounded-[2rem] border-2 border-black bg-[#fdca5a] p-6 md:p-7"><div className="flex flex-wrap gap-2">{result.researchRequired ? <span className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-black">Research first</span> : <span className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-black">Oye evidence</span>}{result.highImpact ? <span className="rounded-full border-2 border-black bg-[#f7adc8] px-3 py-1 text-xs font-black">Approval required</span> : null}<span className="rounded-full border-2 border-black bg-black px-3 py-1 text-xs font-black text-white">{result.language}</span></div><p className="mt-5 whitespace-pre-wrap text-lg font-semibold leading-8">{result.answer}</p></article> : null}
      </section>

      <aside className="rounded-[2.5rem] border-2 border-black bg-[#111] p-5 text-white shadow-[8px_8px_0_#f7adc8] md:p-7">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#fdca5a]">Right place, right evidence</p>
        <h2 className="mt-3 text-3xl font-black tracking-[-0.045em]">Where Oye found the answer</h2>
        <div className="mt-6 grid gap-3">{result?.results?.length ? result.results.map((item) => <article key={item.documentId} className="rounded-[1.5rem] border border-white/15 bg-white/[0.05] p-4"><div className="flex items-center justify-between gap-3"><span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#f7adc8]">{item.domain}</span><span className="text-[10px] uppercase text-white/35">{item.scope}</span></div><h3 className="mt-2 text-lg font-black">{item.title}</h3>{item.summary ? <p className="mt-2 text-sm leading-6 text-white/55">{item.summary}</p> : null}{item.deepLink ? <Link href={item.deepLink as Route} className="mt-4 inline-flex text-sm font-black text-[#fdca5a]">Open exact screen →</Link> : null}</article>) : <p className="rounded-[1.5rem] border border-white/10 p-5 text-sm leading-7 text-white/45">Ask something to see the authorised Oye evidence and exact screens behind the answer.</p>}</div>
      </aside>
    </div>
  )
}

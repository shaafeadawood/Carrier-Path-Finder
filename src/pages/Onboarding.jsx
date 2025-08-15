import { useState } from 'react'

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '', email: '', education: '', experience: '', skills: '', projects: '', interests: ''
  })

  const next = () => setStep((s) => Math.min(s + 1, 3))
  const prev = () => setStep((s) => Math.max(s - 1, 1))
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Tell us about you</h1>

      {step === 1 && (
        <div className="space-y-3">
          <input name="name" value={form.name} onChange={onChange} className="w-full border rounded-xl p-3" placeholder="Full name" />
          <input name="email" value={form.email} onChange={onChange} className="w-full border rounded-xl p-3" placeholder="Email" />
          <textarea name="education" value={form.education} onChange={onChange} className="w-full border rounded-xl p-3" placeholder="Education" />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <textarea name="experience" value={form.experience} onChange={onChange} className="w-full border rounded-xl p-3" placeholder="Work experience" />
          <input name="skills" value={form.skills} onChange={onChange} className="w-full border rounded-xl p-3" placeholder="Skills (comma-separated)" />
          <input name="projects" value={form.projects} onChange={onChange} className="w-full border rounded-xl p-3" placeholder="Projects" />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <input type="file" accept=".pdf,.doc,.docx" className="w-full" />
          <input name="interests" value={form.interests} onChange={onChange} className="w-full border rounded-xl p-3" placeholder="Interests" />
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <button onClick={prev} className="px-4 py-2 rounded-xl border" disabled={step === 1}>Back</button>
        {step < 3 ? (
          <button onClick={next} className="px-4 py-2 rounded-xl bg-black text-white">Next</button>
        ) : (
          <button className="px-4 py-2 rounded-xl bg-green-600 text-white">Submit (stub)</button>
        )}
      </div>
    </div>
  )
}
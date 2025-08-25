// Multi-step form component for onboarding/profile
import { useState } from "react";
import Button from "./Button";
import FormInput from "./FormInput";

const steps = [
  { label: "Personal Info", fields: ["Name", "Email"] },
  { label: "Skills", fields: ["Skills"] },
  { label: "Summary", fields: [] },
];

export default function MultiStepForm({ onSubmit }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ Name: "", Email: "", Skills: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === steps.length - 1) {
      onSubmit?.(form);
    } else {
      next();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">{steps[step].label}</h2>
      {steps[step].fields.map((field) => (
        <FormInput
          key={field}
          label={field}
          name={field}
          value={form[field]}
          onChange={handleChange}
        />
      ))}
      <div className="flex gap-2 mt-4">
        {step > 0 && <Button type="button" onClick={prev}>Back</Button>}
        <Button type="submit">{step === steps.length - 1 ? "Submit" : "Next"}</Button>
      </div>
    </form>
  );
}

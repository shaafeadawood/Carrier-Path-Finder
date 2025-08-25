import { useRef, useState } from "react";

export default function SkillChips({ skills, setSkills, disabled }) {
  const [input, setInput] = useState("");
  const inputRef = useRef();

  const addSkill = (e) => {
    e.preventDefault();
    const val = input.trim();
    if (val && !skills.includes(val)) {
      setSkills([...skills, val]);
      setInput("");
    }
  };
  const removeSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {skills.map((skill) => (
          <span key={skill} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center gap-1">
            {skill}
            <button type="button" aria-label={`Remove ${skill}`} className="ml-1 text-blue-500 hover:text-red-500 focus:outline-none" onClick={() => removeSkill(skill)} disabled={disabled}>
              &times;
            </button>
          </span>
        ))}
      </div>
      <form className="flex gap-2" onSubmit={addSkill}>
        <input
          ref={inputRef}
          type="text"
          className="border rounded px-2 py-1 w-40 focus:ring focus:ring-blue-200"
          placeholder="Add a skill"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={disabled}
          aria-label="Add skill"
        />
        <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50" disabled={disabled || !input.trim()}>Add</button>
      </form>
    </div>
  );
}

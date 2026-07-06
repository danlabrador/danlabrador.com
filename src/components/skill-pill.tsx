import type { Skill } from "@/lib/content-types";

export function SkillPill({ skill }: { skill: Skill }) {
  return (
    <li className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1.5 text-sm">
      <span className="text-muted-foreground">{skill.label}</span>
    </li>
  );
}

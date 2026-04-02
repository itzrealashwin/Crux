import { AVAILABLE_SKILLS } from "@/features/skills/lib/availableSkills.js";

export const normalizeSkillOption = (skill) => {
  if (!skill) return null;

  if (typeof skill === "string") {
    const normalized = skill.trim().toLowerCase();
    const matchedSkill = AVAILABLE_SKILLS.find((option) => {
      const aliases = option.aliases || [];
      return (
        option.skill.toLowerCase() === normalized ||
        aliases.some((alias) => alias.toLowerCase() === normalized)
      );
    });

    return matchedSkill
      ? {
          skillCode: matchedSkill.skillCode,
          name: matchedSkill.skill,
          category: matchedSkill.category,
          aliases: matchedSkill.aliases || [],
        }
      : { skillCode: null, name: skill, category: "Other", aliases: [] };
  }

  const name = skill.name || skill.skill;
  if (!name) return null;

  return {
    skillCode: skill.skillCode || null,
    name,
    category: skill.category || "Other",
    aliases: skill.aliases || [],
  };
};

export const getSkillLabel = (skill) =>
  skill?.name || skill?.skill || (typeof skill === "string" ? skill : "");

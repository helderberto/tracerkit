export const SKILL_PREFIX = 'tk';
export const SKILL_NAMES = [
  `${SKILL_PREFIX}:prd`,
  `${SKILL_PREFIX}:plan`,
  `${SKILL_PREFIX}:check`,
] as const;
export const DEPRECATED_SKILLS = [`${SKILL_PREFIX}:verify`] as const;

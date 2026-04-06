export interface ExtractFlagResult {
  value: string | undefined;
  rest: string[];
}

export function extractFlag(args: string[], flag: string): ExtractFlagResult {
  const idx = args.indexOf(flag);

  if (idx < 0) {
    return { value: undefined, rest: args };
  }

  const value = args[idx + 1];
  const rest = args.filter((_, i) => i !== idx && i !== idx + 1);

  return { value, rest };
}

export const filterAgentThoughts = (content: string): string => {
  return content
    .split('\n')
    .filter(line => {
      const trimmed = line.trim().toLowerCase();
      return !(
        trimmed.startsWith('thought:') ||
        trimmed.startsWith('action:') ||
        trimmed.startsWith('observation:') ||
        trimmed.startsWith('reasoning:') ||
        trimmed.startsWith('process:') ||
        trimmed.startsWith('analysis:') ||
        trimmed.startsWith('step ') ||
        trimmed.startsWith('first,') ||
        trimmed.startsWith('next,') ||
        trimmed.startsWith('then,') ||
        trimmed.startsWith('finally,') ||
        /^\[.*\]$/.test(trimmed) ||
        /^paso \d+:/i.test(trimmed) ||
        /^etapa \d+:/i.test(trimmed) ||
        trimmed.startsWith('let me think') ||
        trimmed.startsWith('i need to') ||
        trimmed.startsWith('i should') ||
        trimmed.startsWith('i will') ||
        trimmed.startsWith('my approach') ||
        trimmed.includes('thinking about') ||
        trimmed.includes('analyzing') ||
        /^(considering|evaluating|examining)/i.test(trimmed)
      );
    })
    .join('\n')
    .replace(/^(Muy bien|Perfecto|Excelente|Entiendo),?\s*/gm, '')
    .replace(/\*\*Análisis:\*\*.*?\n\n/gmi, '')
    .replace(/\*\*Proceso:\*\*.*?\n\n/gmi, '')
    .replace(/^.*?(?:Pensamiento|Thought):\s*.*$/gmi, '')
    .replace(/```thinking[\s\S]*?```/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

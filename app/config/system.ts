// Configuración del sistema QueenSeek
export const SYSTEM_CONFIG = {
  // Configuración del modelo
  MODEL: {
    name: 'qwen3:14b',
    temperature: 0.7,
    top_p: 0.9,
    max_tokens: 4000,
  },
  
  // Patrones para filtrar el pensamiento del agente
  THOUGHT_PATTERNS: [
    'thought:', 'action:', 'observation:', 'reasoning:', 'process:', 'analysis:',
    'step ', 'first,', 'next,', 'then,', 'finally,', 'paso ', 'etapa ',
    'let me think', 'i need to', 'i should', 'i will', 'my approach',
    'thinking about', 'analyzing', 'considering', 'evaluating', 'examining',
    'muy bien', 'perfecto', 'excelente', 'entiendo'
  ],
  
  // Comandos disponibles
  COMMANDS: {
    '/read': 'Lee el contenido de un archivo',
    '/write': 'Crea o edita un archivo',
    '/list': 'Lista archivos en el directorio actual',
    '/delete': 'Elimina un archivo',
    '/mkdir': 'Crea una nueva carpeta',
    '/help': 'Muestra esta ayuda'
  },
  
  // Directorio base por defecto
  DEFAULT_DIRECTORY: 'C:\\Users\\lears.ISRA\\Git-clones\\AI_Lear\\app',
  
  // Extensiones de archivo soportadas
  SUPPORTED_EXTENSIONS: [
    '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs',
    '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.dart', '.vue',
    '.html', '.css', '.scss', '.sass', '.less', '.xml', '.json',
    '.md', '.txt', '.yml', '.yaml', '.toml', '.ini', '.env'
  ]
};

// Prompt del sistema mejorado
export const ENHANCED_SYSTEM_PROMPT = `
Eres QueenSeek, un asistente de programación experto inspirado en Claude de Anthropic.

PERSONALIDAD Y COMPORTAMIENTO:
- Profesional, directo y eficiente
- Amigable pero sin ser excesivamente entusiasta
- Siempre explicas claramente los conceptos
- Nunca juzgas al usuario
- Respondes en el mismo idioma que el usuario

REGLAS CRÍTICAS:
1. NUNCA muestres tu proceso de pensamiento interno
2. NO uses prefijos como "Thought:", "Action:", "Process:", etc.
3. NO analices paso a paso de forma visible
4. Responde directamente a la pregunta

ESTRUCTURA DE RESPUESTA:
- Explicación clara y concisa
- Análisis de errores si los hay
- Código completo funcional al final (SIEMPRE)
- Sé directo, no divagues

CAPACIDADES DE ARCHIVOS:
Puedes gestionar archivos usando comandos:
- /read <archivo> - Lee un archivo
- /write <archivo> <contenido> - Crea/edita archivo
- /list - Lista archivos
- /delete <archivo> - Elimina archivo
- /mkdir <carpeta> - Crea carpeta

REGLAS DE CÓDIGO:
- Siempre proporciona código completo y funcional
- Explica errores claramente
- Usa mejores prácticas
- Incluye comentarios útiles
- Estructura el código de manera legible

Responde de forma directa, sin mostrar tu proceso de razonamiento.
`;

export default SYSTEM_CONFIG;
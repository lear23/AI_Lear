import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, readdir, stat, mkdir, unlink } from 'fs/promises';
import { join, dirname } from 'path';

export async function POST(req: NextRequest) {
  try {
    const { message, workingDirectory } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message' },
        { status: 400 }
      );
    }

    // Sistema de prompts ultra-directo
    const systemPrompt = `
Eres QueenSeek, asistente de programación experto.

REGLAS CRÍTICAS - NUNCA ROMPAS ESTAS REGLAS:
1. JAMÁS muestres tu proceso de pensamiento
2. JAMÁS uses prefijos como "Thought:", "Let me", "I need to", "First", "Then", "Analysis:"
3. JAMÁS hagas listas de pasos numeradas (1., 2., 3.)
4. JAMÁS uses "Based on", "Looking at", "Given that"
5. JAMÁS pongas tu razonamiento en bloques **Analysis:** o similares
6. Responde DIRECTAMENTE sin explicar tu proceso

CAPACIDADES DE ARCHIVOS:
- /read <archivo> - Lee un archivo
- /write <archivo> - Crea/edita un archivo  
- /list - Lista archivos
- /delete <archivo> - Elimina un archivo
- /mkdir <carpeta> - Crea una carpeta

FORMATO: Explicación directa + código funcional completo al final.
DIRECTORIO: ${workingDirectory || 'No especificado'}

Responde DIRECTAMENTE sin mostrar tu proceso mental.
`;

    // Procesar comandos de archivos
    let fileOperationResult = '';
    const baseDir = workingDirectory || 'C:\\Users\\lears.ISRA\\Git-clones\\AI_Lear\\app';
    
    if (message.startsWith('/')) {
      try {
        const [command, ...args] = message.split(' ');
        
        switch (command) {
          case '/read':
            if (args[0]) {
              const filePath = join(baseDir, args[0]);
              const content = await readFile(filePath, 'utf-8');
              fileOperationResult = `Contenido de ${args[0]}:\n\`\`\`\n${content}\n\`\`\``;
            }
            break;
            
          case '/write':
            if (args[0]) {
              const filePath = join(baseDir, args[0]);
              const content = args.slice(1).join(' ');
              await mkdir(dirname(filePath), { recursive: true });
              await writeFile(filePath, content, 'utf-8');
              fileOperationResult = `Archivo ${args[0]} creado/actualizado exitosamente.`;
            }
            break;
            
          case '/list':
            const files = await readdir(baseDir);
            const fileDetails = await Promise.all(
              files.map(async (file) => {
                const filePath = join(baseDir, file);
                const stats = await stat(filePath);
                return `${stats.isDirectory() ? '📁' : '📄'} ${file}`;
              })
            );
            fileOperationResult = `Archivos en ${baseDir}:\n${fileDetails.join('\n')}`;
            break;
            
          case '/delete':
            if (args[0]) {
              const filePath = join(baseDir, args[0]);
              await unlink(filePath);
              fileOperationResult = `Archivo ${args[0]} eliminado exitosamente.`;
            }
            break;
            
          case '/mkdir':
            if (args[0]) {
              const dirPath = join(baseDir, args[0]);
              await mkdir(dirPath, { recursive: true });
              fileOperationResult = `Carpeta ${args[0]} creada exitosamente.`;
            }
            break;
            
          default:
            fileOperationResult = `Comando no reconocido. Comandos disponibles: /read, /write, /list, /delete, /mkdir`;
        }
        
        if (fileOperationResult) {
          return NextResponse.json({ 
            response: fileOperationResult,
            isFileOperation: true 
          }, { status: 200 });
        }
      } catch (error) {
        return NextResponse.json({ 
          response: `Error en operación de archivo: ${error}`,
          isFileOperation: true 
        }, { status: 200 });
      }
    }

    const fullPrompt = `${systemPrompt}\n\nUsuario: ${message}`;

    const deepseekResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen3:14b',
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 4000,
        }
      }),
    });

    if (!deepseekResponse.ok) {
      throw new Error('Error al comunicarse con el modelo');
    }

    const data = await deepseekResponse.json();
    let responseMessage: string = data.response;

    // Filtro ultra-agresivo para ocultar CUALQUIER pensamiento
    const filterThoughts = (text: string): string => {
      return text
        .split('\n')
        .filter(line => {
          const l = line.trim().toLowerCase();
          return !(
            // Prefijos de pensamiento
            l.startsWith('thought:') || l.startsWith('action:') || l.startsWith('let me') ||
            l.startsWith('i need') || l.startsWith('i should') || l.startsWith('i will') ||
            l.startsWith('first') || l.startsWith('then') || l.startsWith('next') ||
            l.startsWith('finally') || l.startsWith('based on') || l.startsWith('looking at') ||
            l.startsWith('analysis:') || l.startsWith('process:') || l.startsWith('step ') ||
            l.startsWith('reasoning:') || l.startsWith('approach:') || l.startsWith('considering') ||
            l.startsWith('primero') || l.startsWith('luego') || l.startsWith('después') ||
            l.startsWith('análisis:') || l.startsWith('proceso:') || l.startsWith('paso ') ||
            l.startsWith('necesito') || l.startsWith('debería') || l.startsWith('voy a') ||
            l.startsWith('mirando') || l.startsWith('basándome') || l.startsWith('ahora') ||
            // Patrones regex
            /^\d+\./i.test(l) || /^\[.*\]$/.test(l) || /^(well|now|so)/i.test(l) ||
            /thinking|analyzing|examining/i.test(l) || /^(muy bien|perfecto)/i.test(l)
          );
        })
        .join('\n')
        .replace(/\*\*(Analysis|Análisis|Process|Proceso|Thought|Pensamiento):\*\*[\s\S]*?(?=\n\n|$)/gi, '')
        .replace(/```(thinking|reasoning|analysis)[\s\S]*?```/gi, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    };
    
    responseMessage = filterThoughts(responseMessage);

    return NextResponse.json({ 
      response: responseMessage,
      workingDirectory: baseDir 
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error en el backend:', error);
    return NextResponse.json(
      { error: 'Hubo un problema procesando la solicitud' },
      { status: 500 }
    );
  }
}
// import { NextRequest, NextResponse } from 'next/server';

// export async function POST(req: NextRequest) {
//   try {
//     const { message } = await req.json();

//     if (!message || typeof message !== 'string') {
//       return NextResponse.json(
//         { error: 'Invalid message' },
//         { status: 400 }
//       );
//     }

//     const systemPrompt = `
//       Eres un asistente experto en programación. Siempre que el usuario te pida un código:
//       1. Explica paso a paso.
//       2. Divide el código en partes si es útil.
//       3. Siempre al final, muestra el código completo con tu propuesta.
//       4.si el usuario escribe en español, responde en español.
//       5. Si el usuario escribe en inglés, responde en inglés.
//     `;

//     const prompt = `${systemPrompt}\n\n${message}`;

//     const deepseekResponse = await fetch('http://localhost:11434/api/generate', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         model: 'qwen3:14b',
//         prompt,
//         stream: false,
//       }),
//     });

//     if (!deepseekResponse.ok) {
//       throw new Error('Error al comunicarse con el modelo');
//     }

//     const data = await deepseekResponse.json();

//     let responseMessage: string = data.response;

//     responseMessage = responseMessage
//       .split('\n')
//       .filter(
//         (line) =>
//           !/^thought:/i.test(line) &&
//           !/^action:/i.test(line) &&
//           !/^observation:/i.test(line) &&
//           !/^reasoning:/i.test(line) &&
//           !/^\[.*?\]$/.test(line.trim())
//       )
//       .join('\n')
//       .trim();

//     return NextResponse.json({ response: responseMessage }, { status: 200 });
//   } catch (error) {
//     console.error('Error en el backend:', error);
//     return NextResponse.json(
//       { error: 'Hubo un problema procesando la solicitud' },
//       { status: 500 }
//     );
//   }
// }

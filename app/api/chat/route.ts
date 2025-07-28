import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, readdir, stat, mkdir, unlink } from 'fs/promises';
import { join, dirname, resolve } from 'path';
import SYSTEM_CONFIG from '@/app/config/system';

export async function POST(req: NextRequest) {
  try {
    const { message, workingDirectory, history } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Mensaje inválido' },
        { status: 400 }
      );
    }

    const baseDir = resolve(workingDirectory || SYSTEM_CONFIG.DEFAULT_DIRECTORY);
 

    // Prompt mejorado para interpretar lenguaje natural
    const systemPrompt = `
Eres QueenSeek, un asistente de programación avanzado con control completo del sistema de archivos.

REGLAS:
1. Interpreta las solicitudes del usuario y realiza acciones directas
2. Para operaciones con archivos/directorios, ejecuta la acción y muestra el resultado
3. Usa lenguaje natural y respuestas concisas

CAPACIDADES:
- Crear/editar/leer/eliminar/renombrar archivos
- Crear/navegar/eliminar/renombrar directorios
- Listar contenido de directorios
- Ejecutar código
- Responder preguntas técnicas

DIRECTORIO ACTUAL: ${baseDir}

Ejemplos de lo que puedes hacer:
- "crea un archivo prueba.txt con este contenido"
- "muéstrame los archivos en esta carpeta"
- "entra a la carpeta documentos"
- "elimina el archivo viejo.js"
- "escribe una función que sume dos números"

Responde directamente con la acción realizada o la información solicitada.
`;

    // Primero intentamos interpretar operaciones de archivos
    try {
      // Crear archivo
      if (/crea?r (un )?archivo (.+?) (con|que contenga)/i.test(message)) {
        const match = message.match(/crea?r (un )?archivo (.+?) (con|que contenga) (.+)/i);
        const fileName = match?.[2].trim();
        const content = match?.[4].trim();
        
        if (fileName && content) {
          const filePath = join(baseDir, fileName);
          await mkdir(dirname(filePath), { recursive: true });
          await writeFile(filePath, content, 'utf-8');
          return NextResponse.json({
            response: `✅ Archivo creado: ${fileName}`,
            workingDirectory: baseDir
          });
        }
      }

      // Leer archivo
      if (/(muestra|lee|ver) (el )?archivo (.+)/i.test(message)) {
        const fileName = message.match(/(muestra|lee|ver) (el )?archivo (.+)/i)?.[3].trim();
        if (fileName) {
          const filePath = join(baseDir, fileName);
          const content = await readFile(filePath, 'utf-8');
          return NextResponse.json({
            response: `📄 Contenido de ${fileName}:\n\`\`\`\n${content}\n\`\`\``,
            workingDirectory: baseDir
          });
        }
      }

      // Listar directorio
      if (/(lista|muestra) (archivos|contenido)/i.test(message)) {
        const files = await readdir(baseDir);
        const fileDetails = await Promise.all(
          files.map(async (file) => {
            const filePath = join(baseDir, file);
            const stats = await stat(filePath);
            return `${stats.isDirectory() ? '📁' : '📄'} ${file}`;
          })
        );
        return NextResponse.json({
          response: `📂 Contenido:\n${fileDetails.join('\n')}`,
          workingDirectory: baseDir
        });
      }

      // Navegar a directorio
      if (/(entra|ve|navega) (a |al |la )?(carpeta|directorio) (.+)/i.test(message)) {
        const dirName = message.match(/(entra|ve|navega) (a |al |la )?(carpeta|directorio) (.+)/i)?.[4].trim();
        if (dirName) {
          const newPath = resolve(join(baseDir, dirName));
          const stats = await stat(newPath);
          if (!stats.isDirectory()) {
            throw new Error(`No es un directorio válido: ${dirName}`);
          }
          return NextResponse.json({
            response: `📂 Directorio actual: ${newPath}`,
            workingDirectory: newPath
          });
        }
      }

      // Eliminar archivo
      if (/(elimina|borra) (el )?archivo (.+)/i.test(message)) {
        const fileName = message.match(/(elimina|borra) (el )?archivo (.+)/i)?.[3].trim();
        if (fileName) {
          const filePath = join(baseDir, fileName);
          await unlink(filePath);
          return NextResponse.json({
            response: `🗑️ Archivo eliminado: ${fileName}`,
            workingDirectory: baseDir
          });
        }
      }

    } catch (error) {
      return NextResponse.json({
        response: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
        workingDirectory: baseDir
      });
    }

    // Si no es una operación de archivo, pasamos al modelo AI
    const historyMessages = Array.isArray(history) 
      ? history.map(msg => `${msg.role === 'user' ? 'Usuario' : 'QueenSeek'}: ${msg.content}`).join('\n')
      : '';

    const fullPrompt = `${systemPrompt}\n\n${historyMessages}\nUsuario: ${message}`;

    const qweenseekResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen3:14b',
        prompt: fullPrompt,
        stream: false,
        options: { temperature: 0.7, top_p: 0.9, max_tokens: 4000 }
      }),
    });

    if (!qweenseekResponse.ok) throw new Error('Error al comunicarse con el modelo');

    const data = await qweenseekResponse.json();
    const response = data.response.replace(/(Thought:|Analysis:|Paso \d+:).*/gi, '').trim();

    return NextResponse.json({
      response,
      workingDirectory: baseDir
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
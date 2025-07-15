import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message' },
        { status: 400 }
      );
    }

    const systemPrompt = `
      Eres un asistente experto en programación. Siempre que el usuario te pida un código:
      1. Explica paso a paso.
      2. Divide el código en partes si es útil.
      3. Siempre al final, muestra el código completo con tu propuesta.
      4.si el usuario escribe en español, responde en español.
      5. Si el usuario escribe en inglés, responde en inglés.
    `;

    const prompt = `${systemPrompt}\n\n${message}`;

    const deepseekResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen3:14b',
        prompt,
        stream: false,
      }),
    });

    if (!deepseekResponse.ok) {
      throw new Error('Error al comunicarse con el modelo');
    }

    const data = await deepseekResponse.json();

    let responseMessage: string = data.response;

    responseMessage = responseMessage
      .split('\n')
      .filter(
        (line) =>
          !/^thought:/i.test(line) &&
          !/^action:/i.test(line) &&
          !/^observation:/i.test(line) &&
          !/^reasoning:/i.test(line) &&
          !/^\[.*?\]$/.test(line.trim())
      )
      .join('\n')
      .trim();

    return NextResponse.json({ response: responseMessage }, { status: 200 });
  } catch (error) {
    console.error('Error en el backend:', error);
    return NextResponse.json(
      { error: 'Hubo un problema procesando la solicitud' },
      { status: 500 }
    );
  }
}

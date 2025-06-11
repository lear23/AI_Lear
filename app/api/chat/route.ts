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
    
    const deepseekResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2:3b', 
        prompt: message,
        stream: false, 
      }),
    });

    if (!deepseekResponse.ok) {
      throw new Error('Error al comunicarse con llama');
    }

    const data = await deepseekResponse.json();
    const responseMessage = data.response;

    return NextResponse.json({ response: responseMessage }, { status: 200 });
  } catch (error) {
    console.error('Error en el backend:', error);
    return NextResponse.json(
      { error: 'Hubo un problema procesando la solicitud' },
      { status: 500 }
    );
  }
}

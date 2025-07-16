import { SYSTEM_CONFIG } from '../config/system';

export class ResponseProcessor {
  /**
   * Filtra el pensamiento interno del agente de la respuesta
   */
  static filterAgentThoughts(content: string): string {
    if (!content) return '';
    
    // Filtrar líneas que contienen patrones de pensamiento
    const filteredLines = content
      .split('\n')
      .filter(line => {
        const trimmed = line.trim().toLowerCase();
        
        // Verificar patrones específicos
        return !SYSTEM_CONFIG.THOUGHT_PATTERNS.some(pattern =>
          trimmed.startsWith(pattern.toLowerCase())
        );
      })
      .filter(line => {
        const trimmed = line.trim();
        
        // Filtrar patrones regex adicionales
        return !(
          /^\[.*\]$/.test(trimmed) ||
          /^paso \d+:/i.test(trimmed) ||
          /^etapa \d+:/i.test(trimmed) ||
          /^(considering|evaluating|examining)/i.test(trimmed) ||
          /^(ahora|luego|después|entonces)/i.test(trimmed)
        );
      });
    
    let processedContent = filteredLines.join('\n');
    
    // Limpiar patrones de texto específicos
    processedContent = processedContent
      .replace(/^(Muy bien|Perfecto|Excelente|Entiendo),?\s*/gm, '')
      .replace(/\*\*Análisis:\*\*[\s\S]*?\n\n/g, '')
      .replace(/\*\*Proceso:\*\*[\s\S]*?\n\n/g, '')
      .replace(/\*\*Pensamiento:\*\*[\s\S]*?\n\n/g, '')
      .replace(/\*\*Razonamiento:\*\*[\s\S]*?\n\n/g, '')
      .replace(/```thinking[\s\S]*?```/g, '')
      .replace(/```reasoning[\s\S]*?```/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    return processedContent;
  }

  /**
   * Verifica si el mensaje es un comando de archivo
   */
  static isFileCommand(message: string): boolean {
    return message.startsWith('/') && Object.keys(SYSTEM_CONFIG.COMMANDS).includes(message.split(' ')[0]);
  }

  /**
   * Procesa comandos de archivo
   */
  static parseFileCommand(message: string): { command: string; args: string[] } {
    const parts = message.split(' ');
    return {
      command: parts[0],
      args: parts.slice(1)
    };
  }

  /**
   * Valida extensiones de archivo
   */
  static isSupportedFile(filename: string): boolean {
    const ext = filename.substring(filename.lastIndexOf('.'));
    return SYSTEM_CONFIG.SUPPORTED_EXTENSIONS.includes(ext);
  }

  /**
   * Formatea el código para mejor legibilidad
   */
  static formatCodeResponse(content: string): string {
    // Asegurar que el código esté bien formateado
    return content
      .replace(/```(\w+)?\n/g, '```$1\n')
      .replace(/\n```/g, '\n```')
      .replace(/```\n\n/g, '```\n');
  }

  /**
   * Extrae bloques de código de la respuesta
   */
  static extractCodeBlocks(content: string): Array<{ language: string; code: string }> {
    const codeBlocks: Array<{ language: string; code: string }> = [];
    const regex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      codeBlocks.push({
        language: match[1] || 'text',
        code: match[2].trim()
      });
    }
    
    return codeBlocks;
  }

  /**
   * Limpia respuestas duplicadas o redundantes
   */
  static removeDuplicateContent(content: string): string {
    const lines = content.split('\n');
    const uniqueLines: string[] = [];
    const seenLines = new Set<string>();
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!seenLines.has(trimmed) || trimmed === '') {
        uniqueLines.push(line);
        seenLines.add(trimmed);
      }
    }
    
    return uniqueLines.join('\n');
  }
}

export default ResponseProcessor;
// type Props = {
//   onCommandSelect: (cmd: string) => void;
//   currentDirectory: string;
// };

// const fileOperations = [
//   { 
//     category: 'Archivos', 
//     commands: [
//       { cmd: 'crear archivo ', desc: 'Crea un nuevo archivo', example: 'crear archivo ejemplo.txt' },
//       { cmd: 'editar ', desc: 'Edita un archivo existente', example: 'editar ejemplo.txt' },
//       { cmd: 'leer ', desc: 'Muestra el contenido de un archivo', example: 'leer ejemplo.txt' },
//       { cmd: 'eliminar ', desc: 'Borra un archivo', example: 'eliminar ejemplo.txt' },
//       { cmd: 'renombrar ', desc: 'Cambia el nombre de un archivo', example: 'renombrar viejo.txt nuevo.txt' }
//     ]
//   },
//   { 
//     category: 'Directorios', 
//     commands: [
//       { cmd: 'crear carpeta ', desc: 'Crea una nueva carpeta', example: 'crear carpeta documentos' },
//       { cmd: 'entrar ', desc: 'Cambia al directorio especificado', example: 'entrar documentos' },
//       { cmd: 'eliminar carpeta ', desc: 'Borra una carpeta y su contenido', example: 'eliminar carpeta documentos' },
//       { cmd: 'renombrar carpeta ', desc: 'Cambia el nombre de una carpeta', example: 'renombrar carpeta vieja nueva' },
//       { cmd: 'volver', desc: 'Regresa al directorio anterior', example: 'volver' }
//     ]
//   },
//   { 
//     category: 'Sistema', 
//     commands: [
//       { cmd: 'listar', desc: 'Muestra el contenido del directorio actual', example: 'listar' },
//       { cmd: 'buscar ', desc: 'Busca archivos por nombre', example: 'buscar *.txt' },
//       { cmd: 'directorio', desc: 'Muestra la ruta actual', example: 'directorio' },
//       { cmd: 'limpiar', desc: 'Borra la salida de la terminal', example: 'limpiar' }
//     ]
//   }
// ];

// export const CommandPanel = ({ onCommandSelect, currentDirectory }: Props) => (
//   <div className="mt-3 p-3 bg-slate-800 rounded-lg border border-slate-700">
//     <div className="flex justify-between items-center mb-3">
//       <h3 className="text-sm font-medium text-slate-200">Operaciones disponibles:</h3>
//       <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
//         {currentDirectory}
//       </span>
//     </div>
    
//     <div className="space-y-4">
//       {fileOperations.map(({ category, commands }) => (
//         <div key={category}>
//           <h4 className="text-xs font-semibold text-slate-400 mb-2">{category}</h4>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
//             {commands.map(({ cmd, desc, example }) => (
//               <div 
//                 key={cmd}
//                 className="p-2 bg-slate-700 hover:bg-slate-600 rounded cursor-pointer transition-colors"
//                 onClick={() => onCommandSelect(cmd)}
//                 title={`Ejemplo: ${example}`}
//               >
//                 <div className="flex items-start space-x-2">
//                   <code className="text-blue-300 text-xs flex-shrink-0">{cmd}</code>
//                   <span className="text-xs text-slate-300">{desc}</span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       ))}
//     </div>
    
//     <div className="mt-4 pt-3 border-t border-slate-700">
//       <p className="text-xs text-slate-400">
//         💡 Haz clic en cualquier comando para insertarlo. Completa los parámetros necesarios.
//       </p>
//     </div>
//   </div>
// );
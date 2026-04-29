import { useState } from "react"
import { Search, ChevronLeft, ChevronRight, FileText } from "lucide-react"

interface Props {
  data: any[]
}

export default function DashboardRawTable({ data }: Props) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const itemsPerPage = 20

  // Búsqueda inteligente por nombre de alumno o texto de pregunta
  const filteredData = data.filter(item => {
    const nombre = `${item.estudiantes?.nombres || ''} ${item.estudiantes?.apellidos || ''}`.toLowerCase()
    const pregunta = (item.preguntas?.texto || '').toLowerCase()
    const query = search.toLowerCase()
    return nombre.includes(query) || pregunta.includes(query)
  })

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
          <FileText className="w-6 h-6 text-cyan-400" />
          Base de Datos Viva (Detalle por Alumno)
        </h2>
        
        {/* Buscador */}
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Buscar alumno o pregunta..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full md:w-80 pl-11 pr-4 py-3 bg-slate-950/50 border border-white/10 rounded-2xl text-white text-sm focus:border-cyan-500/50 outline-none transition-all"
          />
        </div>
      </div>

      <div className="overflow-x-auto border border-white/5 rounded-3xl bg-slate-950/20">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/80 border-b border-white/5">
              <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Estudiante</th>
              <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Salón</th>
              <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest min-w-75">Pregunta</th>
              <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Respuesta Exacta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedData.map((item, i) => (
              <tr key={i} className="hover:bg-white/2 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-300">
                  {item.estudiantes?.nombres} {item.estudiantes?.apellidos}
                </td>
                <td className="px-6 py-4">
                  <span className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-lg font-bold text-xs">
                    {item.estudiantes?.grado}° "{item.estudiantes?.seccion}"
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400 text-xs">
                  {item.preguntas?.texto || "Sin texto registrado"}
                </td>
                <td className="px-6 py-4">
                  <span className="bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-medium block w-max max-w-50 truncate">
                    {item.respuesta}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex justify-between items-center mt-6">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Mostrando {paginatedData.length} de {filteredData.length} resultados
        </p>
        <div className="flex gap-2">
          <button 
            disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
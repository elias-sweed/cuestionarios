import { useState, useMemo } from "react"
import { Search, ChevronLeft, ChevronRight, Filter, Users } from "lucide-react"
import { detectarAlumnosRiesgo, detectarAlumnosRiesgoInicial } from "../../utils/dashboard.utils"

interface Props {
  data: any[]
  nivel: "primaria" | "inicial"
}

export default function DashboardAlumnosPorGrado({ data, nivel }: Props) {
  const esInicial = nivel === "inicial"
  const [grado, setGrado] = useState("")
  const [seccion, setSeccion] = useState("")
  const [busqueda, setBusqueda] = useState("")
  const [page, setPage] = useState(1)
  const itemsPerPage = 25

  // Calcular riesgo de todos los alumnos
  const alumnosConRiesgo = useMemo(() => {
    const raw = esInicial ? detectarAlumnosRiesgoInicial(data) : detectarAlumnosRiesgo(data)
    return new Map((raw as any[]).map((a: any) => [a.estudiante_id, a]))
  }, [data, esInicial])

  // Extraer estudiantes únicos con resumen
  const estudiantesUnicos = useMemo(() => {
    const mapa = new Map<string, any>()
    data.forEach((item: any) => {
      const id = item.estudiante_id
      if (!id || mapa.has(id)) return
      const est = Array.isArray(item.estudiantes) ? item.estudiantes[0] : item.estudiantes
      const g = est?.grado != null ? String(est.grado).trim() : ""
      const s = (est?.seccion || "").toUpperCase()
      if (esInicial ? g !== "0" : !["1", "2", "3", "4", "5", "6"].includes(g)) return
      mapa.set(id, { id, nombres: est?.nombres || "", apellidos: est?.apellidos || "", grado: g, seccion: s, totalRespuestas: 0 })
    })
    data.forEach((item: any) => {
      const id = item.estudiante_id
      if (id && mapa.has(id)) mapa.get(id)!.totalRespuestas++
    })
    return Array.from(mapa.values())
  }, [data, esInicial])

  const gradosDisponibles = useMemo(() => {
    const set = new Set(estudiantesUnicos.map((e: any) => e.grado))
    return esInicial ? ["0"] : ["1", "2", "3", "4", "5", "6"].filter((g) => set.has(g))
  }, [estudiantesUnicos, esInicial])

  const seccionesDisponibles = useMemo(() => {
    const set = new Set(estudiantesUnicos.filter((e: any) => !grado || e.grado === grado).map((e: any) => e.seccion))
    return Array.from(set).sort()
  }, [estudiantesUnicos, grado])

  const estudiantesFiltrados = useMemo(() => {
    let lista = estudiantesUnicos
    if (grado) lista = lista.filter((e: any) => e.grado === grado)
    if (seccion) lista = lista.filter((e: any) => e.seccion === seccion)
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      lista = lista.filter((e: any) => e.nombres.toLowerCase().includes(q) || e.apellidos.toLowerCase().includes(q))
    }
    return lista.sort((a: any, b: any) => a.apellidos.localeCompare(b.apellidos))
  }, [estudiantesUnicos, grado, seccion, busqueda])

  const totalPages = Math.max(1, Math.ceil(estudiantesFiltrados.length / itemsPerPage))
  const estudiantesPagina = estudiantesFiltrados.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  // Reset page on filter change
  const handleGradoChange = (v: string) => { setGrado(v); setSeccion(""); setPage(1) }
  const handleSeccionChange = (v: string) => { setSeccion(v); setPage(1) }
  const handleBusquedaChange = (v: string) => { setBusqueda(v); setPage(1) }

  // Contadores de riesgo
  const resumenRiesgo = useMemo(() => {
    const filtrados = estudiantesFiltrados
    let bajo = 0, medio = 0, alto = 0, sinDatos = 0
    filtrados.forEach((e: any) => {
      const r = alumnosConRiesgo.get(e.id)
      if (!r) { sinDatos++; return }
      if (r.riesgo === "Alto") alto++
      else if (r.riesgo === "Medio") medio++
      else bajo++
    })
    return { bajo, medio, alto, sinDatos, total: filtrados.length }
  }, [estudiantesFiltrados, alumnosConRiesgo])

  return (
    <div className="space-y-6">
      {/* ── FILTROS ─────────────────────────────────────── */}
      <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/5 shadow-2xl">
        <div className="flex flex-wrap items-end gap-4">
          {!esInicial && (
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                <Filter className="w-3 h-3 text-cyan-500" /> Grado
              </label>
              <select
                value={grado}
                onChange={(e) => handleGradoChange(e.target.value)}
                className="min-w-36 border border-white/10 bg-slate-950/50 text-white rounded-2xl px-4 py-2.5 focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all text-sm font-bold appearance-none cursor-pointer"
              >
                <option value="">Seleccionar grado</option>
                {gradosDisponibles.map((g) => (
                  <option key={g} value={g} className="bg-slate-900">{g}° Grado</option>
                ))}
              </select>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
              <Filter className="w-3 h-3 text-cyan-500" /> Sección
            </label>
            <select
              value={seccion}
              onChange={(e) => handleSeccionChange(e.target.value)}
              disabled={!grado && !esInicial}
              className="min-w-36 border border-white/10 bg-slate-950/50 text-white rounded-2xl px-4 py-2.5 focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all text-sm font-bold appearance-none cursor-pointer disabled:opacity-40"
            >
              <option value="">Seleccionar sección</option>
              {seccionesDisponibles.map((s) => (
                <option key={s} value={s} className="bg-slate-900">{s}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-48 space-y-1.5">
            <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
              <Search className="w-3 h-3 text-cyan-500" /> Buscar
            </label>
            <input
              type="text" placeholder="Nombre o apellido..."
              value={busqueda} onChange={(e) => handleBusquedaChange(e.target.value)}
              className="w-full bg-slate-950/50 border border-white/10 text-white placeholder-slate-600 rounded-2xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all"
            />
          </div>
        </div>
      </div>

      {/* ── TARJETA DE RESUMEN ───────────────────────────── */}
      {(grado || esInicial) && seccion && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 px-4 py-3">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total</p>
            <p className="text-2xl font-black text-white mt-1">{resumenRiesgo.total}</p>
          </div>
          <div className="bg-emerald-500/5 backdrop-blur-xl rounded-2xl border border-emerald-500/10 px-4 py-3">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Bajo</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{resumenRiesgo.bajo}</p>
          </div>
          <div className="bg-amber-500/5 backdrop-blur-xl rounded-2xl border border-amber-500/10 px-4 py-3">
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Medio</p>
            <p className="text-2xl font-black text-amber-400 mt-1">{resumenRiesgo.medio}</p>
          </div>
          <div className="bg-red-500/5 backdrop-blur-xl rounded-2xl border border-red-500/10 px-4 py-3">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Alto</p>
            <p className="text-2xl font-black text-red-400 mt-1">{resumenRiesgo.alto}</p>
          </div>
          {resumenRiesgo.sinDatos > 0 && (
            <div className="bg-slate-700/20 backdrop-blur-xl rounded-2xl border border-slate-600/20 px-4 py-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sin datos</p>
              <p className="text-2xl font-black text-slate-400 mt-1">{resumenRiesgo.sinDatos}</p>
            </div>
          )}
        </div>
      )}

      {/* ── TABLA DE ALUMNOS ─────────────────────────────── */}
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
        {(!grado && !esInicial) || !seccion ? (
          <div className="p-16 text-center text-slate-600 font-bold text-sm">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
            {esInicial ? "Selecciona una sección para ver los alumnos" : "Selecciona un grado y sección para ver los alumnos"}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-white/5">
                    <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center w-10">#</th>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Apellidos</th>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Nombres</th>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Grado</th>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Sección</th>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Resp.</th>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Puntaje</th>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Riesgo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {estudiantesPagina.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-600 font-bold">
                        No hay alumnos en {grado ? `${grado}°` : ""} {seccion ? `"${seccion}"` : ""}
                      </td>
                    </tr>
                  ) : (
                    estudiantesPagina.map((est: any, i: number) => {
                      const riesgo = alumnosConRiesgo.get(est.id)
                      const score = riesgo?.score ?? 0
                      const nivelRiesgo = riesgo?.riesgo ?? "—"

                      return (
                        <tr key={est.id} className="hover:bg-white/2 transition-colors">
                          <td className="px-4 py-3 text-center text-slate-500 font-bold text-xs">
                            {(page - 1) * itemsPerPage + i + 1}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-300 capitalize">{est.apellidos}</td>
                          <td className="px-4 py-3 text-slate-300 capitalize">{est.nombres}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-cyan-400 font-black text-xs">
                              {est.grado === "0" ? "Inicial" : `${est.grado}°`}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-slate-400 font-bold text-xs">"{est.seccion}"</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="bg-slate-800 text-slate-300 font-bold text-xs px-2 py-1 rounded-lg">
                              {est.totalRespuestas}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-white font-black text-sm">{score}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {nivelRiesgo !== "—" ? (
                              <span className={`inline-block px-2.5 py-1 rounded-lg font-black text-[10px] uppercase tracking-wider border ${
                                nivelRiesgo === "Alto" ? "bg-red-500/10 text-red-400 border-red-500/30" :
                                nivelRiesgo === "Medio" ? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
                                "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              }`}>
                                {nivelRiesgo}
                              </span>
                            ) : (
                              <span className="text-slate-600 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center px-5 py-4 border-t border-white/5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Mostrando {estudiantesPagina.length} de {estudiantesFiltrados.length} alumnos
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

import { useState, useMemo } from "react"
import { Search, ChevronLeft, ChevronRight, User, X, Eye, Filter } from "lucide-react"

interface Props {
  data: any[]
  nivel: "primaria" | "inicial"
}

export default function DashboardAlumnosPorGrado({ data, nivel }: Props) {
  const esInicial = nivel === "inicial"
  const [grado, setGrado] = useState("")
  const [seccion, setSeccion] = useState("")
  const [alumnoId, setAlumnoId] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState("")
  const [page, setPage] = useState(1)
  const itemsPerPage = 15

  // Extraer estudiantes únicos con sus datos
  const estudiantesUnicos = useMemo(() => {
    const mapa = new Map<string, any>()
    data.forEach((item: any) => {
      const id = item.estudiante_id
      if (!id || mapa.has(id)) return
      const est = Array.isArray(item.estudiantes) ? item.estudiantes[0] : item.estudiantes
      const g = est?.grado != null ? String(est.grado).trim() : ""
      const s = (est?.seccion || "").toUpperCase()
      if (esInicial ? g !== "0" : !["1", "2", "3", "4", "5", "6"].includes(g)) return
      mapa.set(id, {
        id,
        nombres: est?.nombres || "",
        apellidos: est?.apellidos || "",
        grado: g,
        seccion: s,
        totalRespuestas: 0,
      })
    })
    data.forEach((item: any) => {
      const id = item.estudiante_id
      if (id && mapa.has(id)) mapa.get(id)!.totalRespuestas++
    })
    return Array.from(mapa.values())
  }, [data, esInicial])

  const gradosDisponibles = useMemo(() => {
    const set = new Set(estudiantesUnicos.map((e: any) => e.grado))
    return esInicial ? ["0"] : ["1", "2", "3", "4", "5", "6"].filter(g => set.has(g))
  }, [estudiantesUnicos, esInicial])

  const seccionesDisponibles = useMemo(() => {
    const set = new Set(
      estudiantesUnicos
        .filter((e: any) => !grado || e.grado === grado)
        .map((e: any) => e.seccion)
    )
    return Array.from(set).sort()
  }, [estudiantesUnicos, grado])

  // Lista de estudiantes filtrada por grado + sección + búsqueda
  const estudiantesFiltrados = useMemo(() => {
    let lista = estudiantesUnicos
    if (grado) lista = lista.filter((e: any) => e.grado === grado)
    if (seccion) lista = lista.filter((e: any) => e.seccion === seccion)
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      lista = lista.filter(
        (e: any) =>
          e.nombres.toLowerCase().includes(q) || e.apellidos.toLowerCase().includes(q)
      )
    }
    return lista.sort((a: any, b: any) => a.apellidos.localeCompare(b.apellidos))
  }, [estudiantesUnicos, grado, seccion, busqueda])

  const totalPages = Math.max(1, Math.ceil(estudiantesFiltrados.length / itemsPerPage))
  const estudiantesPagina = estudiantesFiltrados.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  )

  // Respuestas del alumno seleccionado
  const respuestasAlumno = useMemo(() => {
    if (!alumnoId) return []
    return data
      .filter((item: any) => item.estudiante_id === alumnoId)
      .map((item: any) => ({
        preguntaId: item.pregunta_id,
        texto: item.preguntas?.texto || `Pregunta ${item.pregunta_id}`,
        tipo: item.preguntas?.tipo || "",
        respuesta: item.respuesta,
        fecha: item.fecha ? String(item.fecha).slice(0, 10) : "",
      }))
  }, [data, alumnoId])

  const alumnoSeleccionado = useMemo(
    () => estudiantesUnicos.find((e: any) => e.id === alumnoId) || null,
    [estudiantesUnicos, alumnoId]
  )

  const handleSelectAlumno = (id: string) => {
    setAlumnoId((prev) => (prev === id ? null : id))
  }

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
                onChange={(e) => { setGrado(e.target.value); setSeccion(""); setPage(1); setAlumnoId(null) }}
                className="min-w-36 border border-white/10 bg-slate-950/50 text-white rounded-2xl px-4 py-2.5 focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all text-sm font-bold appearance-none cursor-pointer"
              >
                <option value="">Seleccionar grado</option>
                {gradosDisponibles.map((g) => (
                  <option key={g} value={g} className="bg-slate-900">
                    {g}° Grado
                  </option>
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
              onChange={(e) => { setSeccion(e.target.value); setPage(1); setAlumnoId(null) }}
              disabled={!grado && !esInicial}
              className="min-w-36 border border-white/10 bg-slate-950/50 text-white rounded-2xl px-4 py-2.5 focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all text-sm font-bold appearance-none cursor-pointer disabled:opacity-40"
            >
              <option value="">{esInicial ? "Única" : "Seleccionar sección"}</option>
              {seccionesDisponibles.map((s) => (
                <option key={s} value={s} className="bg-slate-900">
                  {esInicial ? "Sección Única" : `Sección ${s}`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-48 space-y-1.5">
            <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
              <Search className="w-3 h-3 text-cyan-500" /> Buscar alumno
            </label>
            <input
              type="text"
              placeholder="Nombre o apellido..."
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setPage(1) }}
              className="w-full bg-slate-950/50 border border-white/10 text-white placeholder-slate-600 rounded-2xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all"
            />
          </div>

          {(grado || esInicial) && seccion && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl self-end">
              <User className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 font-bold text-sm">
                {estudiantesFiltrados.length} alumno{estudiantesFiltrados.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── CONTENIDO PRINCIPAL ──────────────────────────── */}
      <div className="grid grid-cols-1 gap-6" style={{ gridTemplateColumns: alumnoId ? "1fr 1fr" : "1fr" }}>
        {/* LISTA DE ALUMNOS */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              {esInicial ? "Alumnos - Inicial" : grado && seccion ? `Alumnos - ${grado}° "${seccion}"` : "Alumnos"}
            </h3>
            {alumnoId && (
              <button
                onClick={() => setAlumnoId(null)}
                className="text-xs text-slate-500 hover:text-white font-bold flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-all"
              >
                <X className="w-3 h-3" /> Cerrar detalle
              </button>
            )}
          </div>

          {(!grado && !esInicial) || !seccion ? (
            <div className="p-12 text-center text-slate-600 font-bold text-sm">
              {esInicial
                ? "Selecciona una sección para ver los alumnos"
                : "Selecciona un grado y sección para ver los alumnos"}
            </div>
          ) : estudiantesPagina.length === 0 ? (
            <div className="p-12 text-center text-slate-600 font-bold text-sm">
              No hay alumnos en {grado ? `${grado}°` : ""} {seccion ? `"${seccion}"` : ""}
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {estudiantesPagina.map((est: any) => (
                <button
                  key={est.id}
                  onClick={() => handleSelectAlumno(est.id)}
                  className={`w-full flex items-center justify-between px-5 py-4 text-left transition-all hover:bg-white/3 ${
                    alumnoId === est.id ? "bg-cyan-500/10 border-l-2 border-cyan-400" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                      alumnoId === est.id
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "bg-slate-800 text-slate-500"
                    }`}>
                      {est.apellidos.charAt(0)}{est.nombres.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-white truncate capitalize">
                        {est.nombres} {est.apellidos}
                      </p>
                      <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                        {est.grado !== "0" ? `${est.grado}° ` : ""}{est.seccion} · {est.totalRespuestas} respuestas
                      </p>
                    </div>
                  </div>
                  <Eye className={`w-4 h-4 shrink-0 ${
                    alumnoId === est.id ? "text-cyan-400" : "text-slate-600"
                  }`} />
                </button>
              ))}
            </div>
          )}

          {estudiantesFiltrados.length > itemsPerPage && (
            <div className="flex justify-between items-center px-5 py-4 border-t border-white/5">
              <p className="text-xs font-bold text-slate-500">
                {estudiantesFiltrados.length} alumnos
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── DETALLE DEL ALUMNO ──────────────────────────── */}
        {alumnoId && alumnoSeleccionado && (
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h3 className="text-sm font-black text-white capitalize flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" />
                {alumnoSeleccionado.nombres} {alumnoSeleccionado.apellidos}
              </h3>
              <p className="text-[10px] text-slate-500 font-bold mt-1">
                {alumnoSeleccionado.grado !== "0"
                  ? `${alumnoSeleccionado.grado}° Grado · Sección ${alumnoSeleccionado.seccion}`
                  : "Inicial (5 años)"}
                {" · "}
                {respuestasAlumno.length} respuesta{respuestasAlumno.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
              {respuestasAlumno.length === 0 ? (
                <div className="p-8 text-center text-slate-600 font-bold text-sm">
                  No hay respuestas registradas para este alumno.
                </div>
              ) : (
                respuestasAlumno.map((r: any, i: number) => (
                  <div key={i} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-400 font-bold mb-1">
                          Pregunta #{r.preguntaId}
                          {r.tipo && (
                            <span className="ml-2 text-[10px] uppercase tracking-wider text-cyan-500/60">
                              {r.tipo}
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-white font-medium leading-snug">
                          {r.texto}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="inline-block bg-slate-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold leading-tight max-w-48 break-words">
                          {typeof r.respuesta === "string"
                            ? r.respuesta
                            : Array.isArray(r.respuesta)
                              ? r.respuesta.join(", ")
                              : JSON.stringify(r.respuesta)}
                        </span>
                        {r.fecha && (
                          <p className="text-[10px] text-slate-600 mt-1">{r.fecha}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

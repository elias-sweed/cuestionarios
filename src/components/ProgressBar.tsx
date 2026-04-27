interface Props {
  actual: number
  total: number
}

export default function ProgressBar({ actual, total }: Props) {
  const porcentaje = Math.round((actual / total) * 100)

  return (
    <div className="w-full flex items-center">
      {/* 1. Contenedor de la barra con flex-grow para que ocupe todo el espacio sobrante */}
      <div className="grow bg-slate-800/50 border border-white/5 rounded-full h-3 overflow-hidden shadow-inner relative">
        <div
          className="bg-blue-500 h-full rounded-full transition-all duration-700 ease-out relative shadow-[0_0_15px_rgba(59,130,246,0.6)]"
          style={{ width: `${porcentaje}%` }}
        >
          <div className="absolute top-0 left-0 right-0 h-[40%] bg-white/20 blur-[1px] rounded-full mx-1 mt-0.5"></div>
          <div className="absolute top-0 right-0 bottom-0 w-8 bg-white/30 blur-md rounded-full"></div>
        </div>
      </div>

      {/* 2. El porcentaje ahora tiene un ancho fijo y margen a la izquierda */}
      <div className="w-13.75 ml-4 text-right">
        <span className="text-xs font-black text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)] tabular-nums">
          {porcentaje}%
        </span>
      </div>
    </div>
  )
}
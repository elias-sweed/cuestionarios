interface Props {
  actual: number
  total: number
}

export default function ProgressBar({ actual, total }: Props) {
  const porcentaje = Math.round((actual / total) * 100)

  return (
    <div className="w-full flex items-center gap-4">
      {/* Contenedor de la barra: ahora es oscuro y con un borde sutil */}
      <div className="flex-1 bg-slate-800/50 border border-white/5 rounded-full h-3 overflow-hidden shadow-inner">
        <div
          className="bg-blue-500 h-full rounded-full transition-all duration-700 ease-out relative shadow-[0_0_15px_rgba(59,130,246,0.6)]"
          style={{ width: `${porcentaje}%` }}
        >
          {/* Reflejo de luz para dar efecto de cristal/neón */}
          <div className="absolute top-0 left-0 right-0 h-[40%] bg-white/20 blur-[1px] rounded-full mx-1 mt-0.5"></div>
          
          {/* Brillo en la punta de la barra */}
          <div className="absolute top-0 right-0 bottom-0 w-8 bg-white/30 blur-md rounded-full"></div>
        </div>
      </div>

      {/* Porcentaje con estilo neón */}
      <span className="text-xs font-black text-blue-400 min-w-[4ch] text-right drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]">
        {porcentaje}%
      </span>
    </div>
  )
}
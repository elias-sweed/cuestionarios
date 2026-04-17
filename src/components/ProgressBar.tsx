interface Props {
  actual: number
  total: number
}

export default function ProgressBar({ actual, total }: Props) {
  const porcentaje = Math.round((actual / total) * 100)

  return (
    <div className="w-full flex items-center gap-4">
      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out relative"
          style={{ width: `${porcentaje}%` }}
        >
          {/* Brillo sutil en la barra */}
          <div className="absolute top-0 right-0 bottom-0 w-10 bg-white/20 blur-sm rounded-full"></div>
        </div>
      </div>
      <span className="text-xs font-bold text-blue-600 min-w-[3ch] text-right">
        {porcentaje}%
      </span>
    </div>
  )
}
interface Props {
  actual: number
  total: number
}

export default function ProgressBar({ actual, total }: Props) {
  const porcentaje = Math.round((actual / total) * 100)

  return (
    <div className="w-full space-y-1">
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-blue-600 h-3 rounded-full transition-all duration-300"
          style={{ width: `${porcentaje}%` }}
        />
      </div>
      <p className="text-sm text-gray-600 text-right">
        {porcentaje}%
      </p>
    </div>
  )
}
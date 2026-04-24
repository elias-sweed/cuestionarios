import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

// Colores más vibrantes para el modo oscuro (estilo neón)
const COLORS = ['#06b6d4', '#10b981', '#6366f1', '#f43f5e', '#8b5cf6', '#ec4899', '#f59e0b']

interface Props {
  porGrado: any[]
  porSeccion: any[]
  emociones: any[]
}

export default function DashboardCharts({ porGrado, porSeccion, emociones }: Props) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico Barras */}
        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <h2 className="text-xl font-black text-white mb-8 tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            Distribución por Grado
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porGrado}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12}} 
                />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
                    color: '#fff'
                  }} 
                />
                <Bar dataKey="value" fill="#0891b2" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico Secciones */}
        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <h2 className="text-xl font-black text-white mb-8 tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
            Participación por Sección
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={porSeccion} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={100} 
                  innerRadius={70} 
                  paddingAngle={8}
                >
                  {porSeccion.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="rgba(0,0,0,0.3)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Emociones full width */}
      <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
        <h2 className="text-xl font-black text-white mb-8 tracking-tight text-center">Clima Emocional General</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={emociones}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={140}
                label={({ name, percent }: { name?: string; percent?: number }) => (
                    `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
                    )}
                // Estilo del label (texto fuera del pie)
                labelLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              >
                {emociones.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
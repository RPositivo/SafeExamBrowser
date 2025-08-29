"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface Behavior {
  id: string
  text: string
  score: number | null
  notObserved: boolean
}

interface SpecialBehaviorsChartProps {
  behaviors: Behavior[]
}

export function SpecialBehaviorsChart({ behaviors }: SpecialBehaviorsChartProps) {
  console.log("SpecialBehaviorsChart - behaviors:", behaviors)

  const data = behaviors.map((behavior) => ({
    name: behavior.text.length > 30 ? behavior.text.substring(0, 30) + "..." : behavior.text,
    score: behavior.score !== null ? behavior.score : 0,
    fullText: behavior.text,
    notObserved: behavior.notObserved,
    fill: behavior.notObserved ? "#9CA3AF" : getColorForScore(behavior.score || 0),
  }))

  console.log("SpecialBehaviorsChart - data:", data)

  function getColorForScore(score: number) {
    if (score <= 1) return "#4CAF50" // Verde
    if (score <= 2) return "#FFD700" // Amarillo
    if (score <= 3) return "#FFA500" // Naranja
    return "#FF0000" // Rojo
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-primary/20 rounded-lg">
        <p className="text-lg text-muted-foreground">No hay datos para mostrar</p>
      </div>
    )
  }

  return (
    <div className="w-full h-[600px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 150, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, 4]} tick={{ fill: "#ffffff" }} axisLine={{ stroke: "#ffffff" }} />
          <YAxis
            dataKey="name"
            type="category"
            width={150}
            tick={{ fontSize: 12, fill: "#ffffff" }}
            axisLine={{ stroke: "#ffffff" }}
          />
          <Tooltip
            formatter={(value: number, name: string, props: any) => {
              const entry = props.payload
              if (entry.notObserved) {
                return ["No observado", ""]
              }
              return [value, "Puntuación"]
            }}
            labelFormatter={(label) => data.find((item) => item.name === label)?.fullText || label}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload

                return (
                  <div className="bg-card p-2 border rounded shadow-sm text-card-foreground">
                    <p className="font-bold">{data.fullText}</p>
                    {data.notObserved ? <p>No observado</p> : <p>Puntuación: {data.score}</p>}
                  </div>
                )
              }
              return null
            }}
          />
          <Bar dataKey="score" fill={(entry) => entry.fill} radius={[0, 4, 4, 0]} name="score" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

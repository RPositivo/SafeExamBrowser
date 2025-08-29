"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts"
import { factorNames, populationAverages } from "@/lib/cbarq-data"

interface FactorChartProps {
  factorScores: Record<string, number>
  factorMetadata: Record<string, { score: number; insufficientData: boolean }>
}

export function FactorChart({ factorScores, factorMetadata }: FactorChartProps) {
  console.log("FactorChart - factorScores:", factorScores)
  console.log("FactorChart - factorMetadata:", factorMetadata)

  const data = Object.entries(factorScores).map(([factor, score]) => {
    const average = populationAverages[factor]
    const difference = score - average
    const insufficientData = factorMetadata[factor]?.insufficientData || false

    return {
      factor: factorNames[factor],
      factorKey: factor,
      score,
      average,
      difference,
      insufficientData,
      fill: insufficientData ? "#9CA3AF" : getColorForDifference(factor, difference),
    }
  })

  console.log("FactorChart - data:", data)

  function getColorForDifference(factor: string, difference: number) {
    // Para el factor de entrenabilidad, invertimos la lógica de colores
    if (factor === "trainability") {
      if (difference < 0) {
        // Menor entrenabilidad que el promedio es negativo
        if (difference > -1) return "#FFD700" // Amarillo
        if (difference > -2) return "#FFA500" // Naranja
        return "#FF0000" // Rojo
      } else {
        // Mayor entrenabilidad que el promedio es positivo
        return "#4CAF50" // Verde
      }
    } else {
      // Para todos los demás factores
      if (difference > 0) {
        // Mayor que el promedio es negativo
        if (difference < 1) return "#FFD700" // Amarillo
        if (difference < 2) return "#FFA500" // Naranja
        return "#FF0000" // Rojo
      } else {
        // Menor que el promedio es positivo
        return "#4CAF50" // Verde
      }
    }
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
            dataKey="factor"
            type="category"
            width={150}
            tick={{ fontSize: 12, fill: "#ffffff" }}
            axisLine={{ stroke: "#ffffff" }}
          />
          <Tooltip
            formatter={(value: number, name: string, props: any) => {
              if (name === "score") return [value.toFixed(2), "Puntuación"]
              return [value.toFixed(2), name]
            }}
            labelFormatter={(label) => `Factor: ${label}`}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload

                if (data.insufficientData) {
                  return (
                    <div className="bg-card p-2 border rounded shadow-sm text-card-foreground">
                      <p className="font-bold">{label}</p>
                      <p>Datos insuficientes</p>
                      <p className="text-xs mt-1">Más de la mitad de las preguntas no han sido observadas</p>
                    </div>
                  )
                }

                const difference = (data.score - data.average).toFixed(2)
                const differenceText = difference > 0 ? `+${difference}` : difference

                return (
                  <div className="bg-card p-2 border rounded shadow-sm text-card-foreground">
                    <p className="font-bold">{label}</p>
                    <p>Puntuación: {data.score.toFixed(2)}</p>
                    <p>Promedio población: {data.average.toFixed(2)}</p>
                    <p>Diferencia: {differenceText}</p>
                    <p className="text-xs mt-1">
                      {data.factorKey === "trainability"
                        ? "Para entrenabilidad, valores más altos son mejores"
                        : "Para este factor, valores más bajos son mejores"}
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          {data.map((entry, index) => (
            <ReferenceLine
              key={`ref-${index}`}
              y={entry.factor}
              x={entry.average}
              stroke="#fdc001"
              strokeDasharray="3 3"
              isFront={true}
              label={{
                value: entry.average.toFixed(1),
                position: "right",
                fill: "#ffffff",
                fontSize: 10,
              }}
            />
          ))}
          <Bar dataKey="score" fill={(entry) => entry.fill} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

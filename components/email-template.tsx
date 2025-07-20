interface FactorScore {
  score: number
  insufficientData: boolean
  average: number
  difference: number
  name: string
}

interface SpecialBehavior {
  id: string
  text: string
  score: number | null
  notObserved: boolean
}

interface EmailTemplateProps {
  dogName: string
  factorScores: Record<string, FactorScore>
  specialBehaviorScores: SpecialBehavior[]
}

// Exportación por defecto en lugar de exportación nombrada
export default function EmailTemplate({ dogName, factorScores, specialBehaviorScores }: EmailTemplateProps) {
  // Función para determinar el color basado en la diferencia
  const getColorForDifference = (factor: string, difference: number) => {
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

  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ backgroundColor: "#32004f", color: "white", padding: "20px", textAlign: "center" }}>
        <h1 style={{ margin: "0", color: "#fdc001" }}>Resultados C-BARQ</h1>
        <p style={{ margin: "10px 0 0" }}>para {dogName}</p>
      </div>

      <div style={{ padding: "20px" }}>
        <h2 style={{ borderBottom: "2px solid #32004f", paddingBottom: "10px", color: "#32004f" }}>
          Puntuaciones por Factor
        </h2>

        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "30px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Factor</th>
              <th style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid #ddd" }}>Puntuación</th>
              <th style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid #ddd" }}>Promedio</th>
              <th style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid #ddd" }}>Diferencia</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(factorScores).map(([factor, data]) => (
              <tr key={factor} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "10px" }}>{data.name}</td>
                <td style={{ padding: "10px", textAlign: "center" }}>
                  {data.insufficientData ? (
                    <span style={{ color: "#999" }}>Datos insuficientes</span>
                  ) : (
                    <span
                      style={{
                        color: getColorForDifference(factor, data.difference),
                        fontWeight: "bold",
                      }}
                    >
                      {data.score.toFixed(2)}
                    </span>
                  )}
                </td>
                <td style={{ padding: "10px", textAlign: "center" }}>{data.average.toFixed(2)}</td>
                <td style={{ padding: "10px", textAlign: "center" }}>
                  {!data.insufficientData && (
                    <span
                      style={{
                        color: getColorForDifference(factor, data.difference),
                        fontWeight: "bold",
                      }}
                    >
                      {data.difference > 0 ? `+${data.difference.toFixed(2)}` : data.difference.toFixed(2)}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 style={{ borderBottom: "2px solid #32004f", paddingBottom: "10px", color: "#32004f" }}>
          Conductas Especiales
        </h2>

        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "30px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Conducta</th>
              <th style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid #ddd" }}>Puntuación</th>
            </tr>
          </thead>
          <tbody>
            {specialBehaviorScores.map((behavior) => (
              <tr key={behavior.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "10px" }}>{behavior.text}</td>
                <td style={{ padding: "10px", textAlign: "center" }}>
                  {behavior.notObserved ? (
                    <span style={{ color: "#999" }}>No observado</span>
                  ) : (
                    <span
                      style={{
                        color: behavior.score !== null && behavior.score > 2 ? "#FF0000" : "#000000",
                        fontWeight: behavior.score !== null && behavior.score > 2 ? "bold" : "normal",
                      }}
                    >
                      {behavior.score !== null ? behavior.score : "No respondido"}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 style={{ borderBottom: "2px solid #32004f", paddingBottom: "10px", color: "#32004f" }}>
          Interpretación de Resultados
        </h2>

        <p style={{ marginBottom: "15px" }}>
          <strong>
            Si su perro recibió puntuaciones altas (naranja o rojo) en alguno de los factores, tenga en cuenta:
          </strong>
        </p>

        <h3 style={{ color: "#32004f", marginBottom: "5px" }}>Agresión:</h3>
        <p style={{ marginBottom: "15px" }}>
          Las puntuaciones altas en cualquiera de las subescalas de agresión deben tomarse en serio debido a los riesgos
          potenciales de lesiones por mordeduras a usted, miembros de su familia, otras personas y/u otros perros.
        </p>

        <h3 style={{ color: "#32004f", marginBottom: "5px" }}>Capacidad de entrenamiento:</h3>
        <p style={{ marginBottom: "15px" }}>
          Las puntuaciones bajas pueden ser motivo de preocupación dependiendo del tamaño del perro y su entorno. Si
          vive cerca de una calle concurrida, por ejemplo, un perro que no acude cuando se le llama puede ser una
          preocupación significativa.
        </p>

        <h3 style={{ color: "#32004f", marginBottom: "5px" }}>Excitabilidad y energía:</h3>
        <p style={{ marginBottom: "15px" }}>
          Las puntuaciones altas pueden ser motivo de preocupación si el comportamiento del perro es una fuente de
          irritación. El valor de molestia de la hiperexcitabilidad tiende a surgir de su asociación con comportamientos
          molestos, como ladridos excesivos o saltar sobre las personas, ambos fácilmente modificables mediante
          entrenamiento.
        </p>

        <p
          style={{
            marginTop: "30px",
            fontSize: "12px",
            color: "#666",
            borderTop: "1px solid #ddd",
            paddingTop: "15px",
          }}
        >
          Este correo electrónico fue generado automáticamente por el sistema C-BARQ. Para más información sobre el
          comportamiento canino, consulte con un profesional.
        </p>
      </div>
    </div>
  )
}

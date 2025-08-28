"use server"

import { Resend } from "resend"
import { factorNames, populationAverages, cbarqQuestions, specialBehaviors } from "@/lib/cbarq-data"
import { NOT_OBSERVED } from "@/components/questionnaire"

// Verificar que la API key exista antes de inicializar Resend
const RESEND_API_KEY = process.env.RESEND_API_KEY
let resend: Resend | null = null

// Solo inicializar Resend si la API key existe
if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY)
}

interface EmailData {
  email: string
  dogName: string
  answers: Record<string, number>
  anamnesisData?: any
}

export async function sendEmail(data: EmailData) {
  try {
    // Verificar si Resend está inicializado
    if (!resend) {
      console.error("Error: Resend API key no configurada o inválida")
      return {
        success: false,
        message: "Error de configuración: No se ha configurado correctamente la API key de Resend.",
      }
    }

    const { email, dogName, answers, anamnesisData } = data

    // Calcular puntuaciones de factores
    const factorScores = calculateFactorScores(answers)

    // Obtener puntuaciones de conductas especiales
    const specialBehaviorScores = getSpecialBehaviorScores(answers)

    // Obtener respuestas individuales
    const individualResponses = getIndividualResponses(answers)

    // Formatear el contenido del correo en texto plano
    const plainTextContent = formatPlainTextEmail(
      dogName,
      factorScores,
      specialBehaviorScores,
      individualResponses,
      anamnesisData,
    )

    // Generar HTML para el correo
    const htmlContent = generateHtmlEmail(
      dogName,
      factorScores,
      specialBehaviorScores,
      individualResponses,
      anamnesisData,
    )

    console.log("Enviando correo a:", email)
    console.log("Nombre del perro:", dogName)

    try {
      // Enviar correo usando Resend con manejo de errores mejorado
      const { data: resendData, error } = await resend.emails.send({
        from: "C-BARQ <onboarding@resend.dev>", // Usar el remitente de prueba de Resend
        to: email,
        subject: `Resultados C-BARQ para ${dogName}`,
        text: plainTextContent, // Versión de texto plano
        html: htmlContent, // Versión HTML mejorada
      })

      if (error) {
        console.error("Error de Resend:", error)
        return { success: false, message: `Error al enviar el correo: ${error.message || "Error desconocido"}` }
      }

      console.log("Correo enviado correctamente:", resendData)
      return { success: true, message: `Resultados enviados a ${email}` }
    } catch (resendError) {
      console.error("Error al enviar correo con Resend:", resendError)
      return {
        success: false,
        message: `Error al enviar el correo: ${resendError instanceof Error ? resendError.message : "Error desconocido"}`,
      }
    }
  } catch (error) {
    console.error("Error general:", error)
    return {
      success: false,
      message: `Error al procesar los datos: ${error instanceof Error ? error.message : "Error desconocido"}`,
    }
  }
}

function calculateFactorScores(answers: Record<string, number>) {
  const scores: Record<string, { score: number; count: number; notObservedCount: number; totalQuestions: number }> = {}

  Object.entries(cbarqQuestions).forEach(([factor, questions]) => {
    scores[factor] = { score: 0, count: 0, notObservedCount: 0, totalQuestions: questions.length }

    questions.forEach((question) => {
      if (answers[question.id] !== undefined) {
        if (answers[question.id] === NOT_OBSERVED) {
          scores[factor].notObservedCount++
        } else {
          scores[factor].score += answers[question.id]
          scores[factor].count++
        }
      }
    })
  })

  return Object.entries(scores).reduce(
    (acc, [factor, { score, count, notObservedCount, totalQuestions }]) => {
      const insufficientData = notObservedCount >= totalQuestions / 2
      acc[factor] = {
        score: count > 0 ? score / count : 0,
        insufficientData,
        average: populationAverages[factor],
        difference: count > 0 ? score / count - populationAverages[factor] : -populationAverages[factor],
        name: factorNames[factor],
      }
      return acc
    },
    {} as Record<
      string,
      {
        score: number
        insufficientData: boolean
        average: number
        difference: number
        name: string
      }
    >,
  )
}

function getSpecialBehaviorScores(answers: Record<string, number>) {
  return specialBehaviors.map((behavior) => ({
    id: behavior.id,
    text: behavior.text,
    score: answers[behavior.id] === NOT_OBSERVED ? null : answers[behavior.id] || 0,
    notObserved: answers[behavior.id] === NOT_OBSERVED,
  }))
}

function getIndividualResponses(answers: Record<string, number>) {
  const responses: Record<string, { question: string; answer: number | string; factor: string }> = {}

  // Procesar preguntas de factores
  Object.entries(cbarqQuestions).forEach(([factor, questions]) => {
    questions.forEach((question) => {
      const answer = answers[question.id]
      responses[question.id] = {
        question: question.text,
        answer: answer === NOT_OBSERVED ? "No observado" : answer !== undefined ? answer : "No respondido",
        factor: factorNames[factor],
      }
    })
  })

  // Procesar conductas especiales
  specialBehaviors.forEach((behavior) => {
    const answer = answers[behavior.id]
    responses[behavior.id] = {
      question: behavior.text,
      answer: answer === NOT_OBSERVED ? "No observado" : answer !== undefined ? answer : "No respondido",
      factor: "Conductas Especiales",
    }
  })

  return responses
}

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

function formatPlainTextEmail(
  dogName: string,
  factorScores: Record<string, any>,
  specialBehaviorScores: Array<any>,
  individualResponses: Record<string, any>,
  anamnesisData?: any,
) {
  let content = `
RESULTADOS DEL CUESTIONARIO C-BARQ PARA ${dogName.toUpperCase()}
=====================================================
`

  // Agregar datos de anamnesis si están disponibles
  if (anamnesisData) {
    content += `
DATOS DE ANAMNESIS
-----------------
Animal: ${anamnesisData.petName || "N/A"} - ${anamnesisData.species || "N/A"} - ${anamnesisData.breed || "N/A"}
Edad: ${anamnesisData.age || "N/A"} - Sexo: ${anamnesisData.sex || "N/A"}
Propietario: ${anamnesisData.ownerName || "N/A"}

Problema Principal: ${anamnesisData.mainProblem || "N/A"}
Duración: ${anamnesisData.problemDuration || "N/A"}
Severidad: ${anamnesisData.problemSeverity || "N/A"}
Funcionamiento General: ${anamnesisData.overallFunctioning || "N/A"}
`
  }

  // Puntuaciones por factor
  content += `
PUNTUACIONES POR FACTOR
----------------------
`

  Object.values(factorScores).forEach((factor) => {
    if (factor.insufficientData) {
      content += `\n${factor.name}: Datos insuficientes (Promedio población: ${factor.average.toFixed(2)})`
    } else {
      const differenceText = factor.difference >= 0 ? `+${factor.difference.toFixed(2)}` : factor.difference.toFixed(2)
      content += `\n${factor.name}: ${factor.score.toFixed(2)} (Promedio población: ${factor.average.toFixed(2)}, Diferencia: ${differenceText})`
    }
  })

  // Conductas especiales
  content += `

CONDUCTAS ESPECIALES
-------------------
`

  specialBehaviorScores.forEach((behavior) => {
    if (behavior.notObserved) {
      content += `\n${behavior.text}: No observado`
    } else if (behavior.score === null) {
      content += `\n${behavior.text}: No respondido`
    } else {
      content += `\n${behavior.text}: ${behavior.score}`
    }
  })

  // Respuestas individuales
  content += `

RESPUESTAS INDIVIDUALES
---------------------
`

  // Agrupar por factor
  const responsesByFactor: Record<string, Array<{ id: string; question: string; answer: number | string }>> = {}

  Object.entries(individualResponses).forEach(([id, { question, answer, factor }]) => {
    if (!responsesByFactor[factor]) {
      responsesByFactor[factor] = []
    }
    responsesByFactor[factor].push({ id, question, answer })
  })

  // Mostrar respuestas agrupadas por factor
  Object.entries(responsesByFactor).forEach(([factor, responses]) => {
    content += `\n\n${factor}:\n`
    content += `${"=".repeat(factor.length + 1)}\n`

    responses.forEach(({ question, answer }) => {
      content += `\n- ${question}: ${answer}`
    })
  })

  // Interpretación de resultados
  content += `

INTERPRETACIÓN DE RESULTADOS
--------------------------

Si su perro recibió puntuaciones altas (naranja o rojo) en alguno de los factores, tenga en cuenta:

- Agresión: Las puntuaciones altas en cualquiera de las subescalas de agresión deben tomarse en serio debido a los riesgos potenciales de lesiones por mordeduras.

- Capacidad de entrenamiento: Las puntuaciones bajas pueden ser motivo de preocupación dependiendo del tamaño del perro y su entorno.

- Excitabilidad y energía: Las puntuaciones altas pueden ser motivo de preocupación si el comportamiento del perro es una fuente de irritación.

La mayoría de los problemas de comportamiento en perros pueden tratarse con éxito. Consulte con un profesional del comportamiento canino si tiene preocupaciones.
`

  return content
}

function generateHtmlEmail(
  dogName: string,
  factorScores: Record<string, any>,
  specialBehaviorScores: Array<any>,
  individualResponses: Record<string, any>,
  anamnesisData?: any,
) {
  // Crear representación visual de barras para los factores
  const factorBars = Object.entries(factorScores)
    .map(([factor, data]) => {
      if (data.insufficientData) {
        return `
          <div style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span style="font-weight: bold;">${data.name}</span>
              <span style="color: #999;">Datos insuficientes</span>
            </div>
            <div style="height: 20px; background-color: #f0f0f0; border-radius: 4px; position: relative;">
              <div style="position: absolute; height: 20px; width: 2px; background-color: #fdc001; left: ${
                (data.average / 4) * 100
              }%; top: 0;"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 2px;">
              <span>0</span>
              <span>4</span>
            </div>
          </div>
        `
      }

      const barWidth = (data.score / 4) * 100
      const barColor = getColorForDifference(factor, data.difference)
      const differenceText = data.difference >= 0 ? `+${data.difference.toFixed(2)}` : data.difference.toFixed(2)
      // Determinar el color del texto basado en el color de fondo
      const textColor = barColor === "#FFD700" ? "#000000" : "#FFFFFF"

      return `
        <div style="margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span style="font-weight: bold;">${data.name}</span>
            <span style="color: ${barColor};">${data.score.toFixed(2)} (${differenceText})</span>
          </div>
          <div style="height: 20px; background-color: #f0f0f0; border-radius: 4px; position: relative;">
            <div style="height: 20px; width: ${barWidth}%; background-color: ${barColor}; border-radius: 4px 0 0 4px; display: flex; align-items: center; justify-content: center;">
              <span style="color: ${textColor}; font-size: 12px; font-weight: bold;">${data.score.toFixed(1)}</span>
            </div>
            <div style="position: absolute; height: 20px; width: 2px; background-color: #fdc001; left: ${(data.average / 4) * 100}%; top: 0;"></div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 2px;">
            <span>0</span>
            <span>4</span>
          </div>
        </div>
      `
    })
    .join("")

  // Crear representación visual de barras para conductas especiales
  const specialBars = specialBehaviorScores
    .map((behavior) => {
      if (behavior.notObserved) {
        return `
          <div style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span style="font-weight: bold;">${behavior.text}</span>
              <span style="color: #999;">No observado</span>
            </div>
            <div style="height: 20px; background-color: #f0f0f0; border-radius: 4px;"></div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 2px;">
              <span>0</span>
              <span>4</span>
            </div>
          </div>
        `
      }

      if (behavior.score === null) {
        return `
          <div style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span style="font-weight: bold;">${behavior.text}</span>
              <span style="color: #999;">No respondido</span>
            </div>
            <div style="height: 20px; background-color: #f0f0f0; border-radius: 4px;"></div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 2px;">
              <span>0</span>
              <span>4</span>
            </div>
          </div>
        `
      }

      const barWidth = (behavior.score / 4) * 100
      const barColor =
        behavior.score <= 1 ? "#4CAF50" : behavior.score <= 2 ? "#FFD700" : behavior.score <= 3 ? "#FFA500" : "#FF0000"
      // Determinar el color del texto basado en el color de fondo
      const textColor = barColor === "#FFD700" ? "#000000" : "#FFFFFF"

      return `
        <div style="margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span style="font-weight: bold;">${behavior.text}</span>
            <span style="color: ${barColor};">${behavior.score}</span>
          </div>
          <div style="height: 20px; background-color: #f0f0f0; border-radius: 4px;">
            <div style="height: 20px; width: ${barWidth}%; background-color: ${barColor}; border-radius: 4px 0 0 4px; display: flex; align-items: center; justify-content: center;">
              <span style="color: ${textColor}; font-size: 12px; font-weight: bold;">${behavior.score}</span>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 2px;">
            <span>0</span>
            <span>4</span>
          </div>
        </div>
      `
    })
    .join("")

  // Agrupar respuestas individuales por factor
  const responsesByFactor: Record<string, Array<{ id: string; question: string; answer: number | string }>> = {}

  Object.entries(individualResponses).forEach(([id, { question, answer, factor }]) => {
    if (!responsesByFactor[factor]) {
      responsesByFactor[factor] = []
    }
    responsesByFactor[factor].push({ id, question, answer })
  })

  // Crear tablas HTML para respuestas individuales
  const responseTables = Object.entries(responsesByFactor)
    .map(([factor, responses]) => {
      const rows = responses
        .map(({ question, answer }) => {
          const answerDisplay = answer
          let answerColor = "#000"

          if (answer === "No observado") {
            answerColor = "#999"
          } else if (typeof answer === "number") {
            answerColor = answer <= 1 ? "#4CAF50" : answer <= 2 ? "#FFD700" : answer <= 3 ? "#FFA500" : "#FF0000"
          }

          return `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; text-align: left;">${question}</td>
              <td style="padding: 8px; text-align: center; color: ${answerColor}; font-weight: bold;">${answerDisplay}</td>
            </tr>
          `
        })
        .join("")

      return `
        <div style="margin-top: 30px;">
          <h3 style="color: #32004f; border-bottom: 1px solid #32004f; padding-bottom: 5px;">${factor}</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Pregunta</th>
                <th style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">Respuesta</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      `
    })
    .join("")

  let htmlContent = `
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Resultados C-BARQ para ${dogName}</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; color: #333;">
        <div style="background-color: #32004f; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; color: #fdc001;">Resultados C-BARQ</h1>
          <p style="margin: 10px 0 0;">para ${dogName}</p>
        </div>
        
        <div style="padding: 20px;">
          <h2 style="border-bottom: 2px solid #32004f; padding-bottom: 10px; color: #32004f;">
            Puntuaciones por Factor
          </h2>
          <p>A continuación se muestran las puntuaciones promedio para cada factor de comportamiento comparadas con los valores de referencia de la población.</p>
          
          <div style="margin-top: 20px;">
            ${factorBars}
          </div>
          
          <div style="margin-top: 30px;">
            <h2 style="border-bottom: 2px solid #32004f; padding-bottom: 10px; color: #32004f;">
              Conductas Especiales
            </h2>
            <p>Comportamientos que no corresponden a ningún factor específico.</p>
            
            <div style="margin-top: 20px;">
              ${specialBars}
            </div>
          </div>
          
          <div style="margin-top: 30px;">
            <h2 style="border-bottom: 2px solid #32004f; padding-bottom: 10px; color: #32004f;">
              Respuestas Individuales
            </h2>
            <p>A continuación se muestran todas las respuestas individuales agrupadas por factor.</p>
            
            ${responseTables}
          </div>
          
          <div style="margin-top: 30px;">
            <h2 style="border-bottom: 2px solid #32004f; padding-bottom: 10px; color: #32004f;">
              Interpretación de Resultados
            </h2>
            
            <p style="margin-bottom: 15px;">
              <strong>
                Si su perro recibió puntuaciones altas (naranja o rojo) en alguno de los factores, tenga en cuenta:
              </strong>
            </p>
            
            <h3 style="color: #32004f; margin-bottom: 5px;">Agresión:</h3>
            <p style="margin-bottom: 15px;">
              Las puntuaciones altas en cualquiera de las subescalas de agresión deben tomarse en serio debido a los riesgos
              potenciales de lesiones por mordeduras a usted, miembros de su familia, otras personas y/u otros perros.
            </p>
            
            <h3 style="color: #32004f; margin-bottom: 5px;">Capacidad de entrenamiento:</h3>
            <p style="margin-bottom: 15px;">
              Las puntuaciones bajas pueden ser motivo de preocupación dependiendo del tamaño del perro y su entorno. Si
              vive cerca de una calle concurrida, por ejemplo, un perro que no acude cuando se le llama puede ser una
              preocupación significativa.
            </p>
            
            <h3 style="color: #32004f; margin-bottom: 5px;">Excitabilidad y energía:</h3>
            <p style="margin-bottom: 15px;">
              Las puntuaciones altas pueden ser motivo de preocupación si el comportamiento del perro es una fuente de
              irritación. El valor de molestia de la hiperexcitabilidad tiende a surgir de su asociación con comportamientos
              molestos, como ladridos excesivos o saltar sobre las personas, ambos fácilmente modificables mediante
              entrenamiento.
            </p>
          </div>
          
          <p style="margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 15px;">
            Este correo electrónico fue generado automáticamente por el sistema C-BARQ. Para más información sobre el
            comportamiento canino, consulte con un profesional.
          </p>
        </div>
      </body>
    </html>
  `

  // Agregar datos de anamnesis si están disponibles
  if (anamnesisData) {
    htmlContent = `
      <div style="margin-bottom: 30px;">
        <h2 style="border-bottom: 2px solid #32004f; padding-bottom: 10px; color: #32004f;">
          Datos de Anamnesis
        </h2>
        <p>
          Animal: ${anamnesisData.petName || "N/A"} - ${anamnesisData.species || "N/A"} - ${anamnesisData.breed || "N/A"}<br>
          Edad: ${anamnesisData.age || "N/A"} - Sexo: ${anamnesisData.sex || "N/A"}<br>
          Propietario: ${anamnesisData.ownerName || "N/A"}<br>
          Problema Principal: ${anamnesisData.mainProblem || "N/A"}<br>
          Duración: ${anamnesisData.problemDuration || "N/A"}<br>
          Severidad: ${anamnesisData.problemSeverity || "N/A"}<br>
          Funcionamiento General: ${anamnesisData.overallFunctioning || "N/A"}
        </p>
      </div>
      ${htmlContent}`
  }

  return htmlContent
}

"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cbarqQuestions, factorNames, populationAverages, specialBehaviors } from "@/lib/cbarq-data"
import { FactorChart } from "@/components/factor-chart"
import { SpecialBehaviorsChart } from "@/components/special-behaviors-chart"
import { NOT_OBSERVED } from "@/components/questionnaire"
import { EmailForm } from "@/components/email-form"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"
import { storeQuestionnaire } from "@/lib/store-data"

interface ResultsProps {
  answers: Record<string, number>
  anamnesisData?: any
}

export function Results({ answers, anamnesisData }: ResultsProps) {
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isStoring, setIsStoring] = useState(false)
  const [storeResult, setStoreResult] = useState<{ success: boolean; message: string; id?: string } | null>(null)

  // Usar useEffect para asegurarse de que el componente solo se renderice en el cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  const calculateFactorScores = () => {
    const scores: Record<string, { score: number; count: number; notObservedCount: number; totalQuestions: number }> =
      {}

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
        // Calcular si hay suficientes observaciones para este factor
        const insufficientData = notObservedCount >= totalQuestions / 2

        acc[factor] = {
          score: count > 0 ? score / count : 0,
          insufficientData,
        }
        return acc
      },
      {} as Record<string, { score: number; insufficientData: boolean }>,
    )
  }

  const factorScoresWithMetadata = calculateFactorScores()
  const factorScores = Object.entries(factorScoresWithMetadata).reduce(
    (acc, [factor, { score }]) => {
      acc[factor] = score
      return acc
    },
    {} as Record<string, number>,
  )

  // Añadir console.log para depuración
  console.log("Results - factorScores:", factorScores)
  console.log("Results - factorScoresWithMetadata:", factorScoresWithMetadata)

  const getSpecialBehaviorScores = () => {
    return specialBehaviors.map((behavior) => ({
      id: behavior.id,
      text: behavior.text,
      score: answers[behavior.id] === NOT_OBSERVED ? null : answers[behavior.id] || 0,
      notObserved: answers[behavior.id] === NOT_OBSERVED,
    }))
  }

  // Añadir console.log para depuración
  console.log("Results - specialBehaviors:", getSpecialBehaviorScores())

  const getColorClass = (factor: string, score: number) => {
    // Si hay datos insuficientes, devolver clase de texto gris
    if (factorScoresWithMetadata[factor]?.insufficientData) {
      return "text-gray-400"
    }

    const average = populationAverages[factor]
    const difference = score - average

    // Para el factor de entrenabilidad, invertimos la lógica de colores
    if (factor === "trainability") {
      if (difference < 0) {
        // Menor entrenabilidad que el promedio es negativo
        if (difference > -1) return "text-yellow-500" // Amarillo
        if (difference > -2) return "text-orange-500" // Naranja
        return "text-red-500" // Rojo
      } else {
        // Mayor entrenabilidad que el promedio es positivo
        return "text-green-500" // Verde
      }
    } else {
      // Para todos los demás factores
      if (difference > 0) {
        // Mayor que el promedio es negativo
        if (difference < 1) return "text-yellow-500" // Amarillo
        if (difference < 2) return "text-orange-500" // Naranja
        return "text-red-500" // Rojo
      } else {
        // Menor que el promedio es positivo
        return "text-green-500" // Verde
      }
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleStoreData = async () => {
    setIsStoring(true)
    setStoreResult(null)

    try {
      const result = await storeQuestionnaire({
        anamnesisData,
        cbarqAnswers: answers,
        factorScores: factorScoresWithMetadata,
        specialBehaviorScores: getSpecialBehaviorScores(),
      })

      setStoreResult(result)
    } catch (error) {
      setStoreResult({
        success: false,
        message: `Error al almacenar: ${error instanceof Error ? error.message : "Error desconocido"}`,
      })
    } finally {
      setIsStoring(false)
    }
  }

  return (
    <div className="space-y-8">
      {anamnesisData && (
        <Card>
          <CardHeader>
            <CardTitle>Datos de Anamnesis</CardTitle>
            <CardDescription>Información general recopilada durante la evaluación inicial</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Información del Perro</h4>
                <p>
                  <strong>Nombre:</strong> {anamnesisData.petName}
                </p>
                <p>
                  <strong>Especie:</strong> {anamnesisData.species}
                </p>
                <p>
                  <strong>Raza:</strong> {anamnesisData.breed}
                </p>
                <p>
                  <strong>Edad:</strong> {anamnesisData.age}
                </p>
                <p>
                  <strong>Sexo:</strong> {anamnesisData.sex}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Problema Principal</h4>
                <p>
                  <strong>Duración:</strong> {anamnesisData.problemDuration}
                </p>
                <p>
                  <strong>Severidad:</strong> {anamnesisData.problemSeverity}
                </p>
                <p>
                  <strong>Funcionamiento:</strong> {anamnesisData.overallFunctioning}
                </p>
              </div>
            </div>
            {anamnesisData.mainProblem && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Descripción del Problema</h4>
                <p className="text-sm bg-primary/10 p-3 rounded">{anamnesisData.mainProblem}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Resultados de la Evaluación C-BARQ</CardTitle>
          <CardDescription>
            Estos son los resultados promedio para cada factor de comportamiento comparados con los valores de
            referencia de la población
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isClient && Object.keys(factorScores).length > 0 ? (
            <FactorChart factorScores={factorScores} factorMetadata={factorScoresWithMetadata} />
          ) : (
            <div className="w-full h-[600px] flex items-center justify-center bg-primary/20 rounded-lg">
              <p className="text-lg text-muted-foreground">Cargando gráfica de factores...</p>
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Desglose por Factor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(factorScores).map(([factor, score]) => (
                <div key={factor} className="flex justify-between items-center border-b pb-2">
                  <span>{factorNames[factor]}</span>
                  <div className="flex items-center gap-2">
                    {factorScoresWithMetadata[factor]?.insufficientData ? (
                      <span className="text-gray-400">Datos insuficientes</span>
                    ) : (
                      <>
                        <span className={getColorClass(factor, score)}>{score.toFixed(2)}</span>
                        <span className="text-sm text-muted-foreground">
                          (Ref: {populationAverages[factor].toFixed(1)})
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium mb-2">Leyenda de Colores</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Verde: Valor favorable (menor que el promedio)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span>Amarillo: Ligeramente desfavorable (0-1 punto sobre el promedio)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span>Naranja: Moderadamente desfavorable (1-2 puntos sobre el promedio)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Rojo: Muy desfavorable (más de 2 puntos sobre el promedio)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-400 rounded"></div>
                <span>Gris: Datos insuficientes (más de la mitad de preguntas no observadas)</span>
              </div>
            </div>
            <p className="text-sm mt-2 text-muted-foreground">
              Nota: Para el factor "Capacidad de entrenamiento", la lógica de colores es inversa, ya que un valor alto
              es favorable.
            </p>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium mb-2">Interpretación de Resultados</h3>
            <div className="space-y-4 text-sm">
              <p className="font-medium">
                Si su perro recibió barras naranjas o rojas, no se alarme. No todos los rasgos de temperamento evaluados
                por el C-BARQ son igualmente problemáticos.
              </p>

              <div>
                <h4 className="font-medium">Agresión:</h4>
                <p>
                  En general, las barras rojas o naranjas para cualquiera de las subescalas de agresión deben tomarse
                  más en serio debido a los riesgos potenciales de lesiones por mordeduras a usted, miembros de su
                  familia, otras personas y/u otros perros. Por razones obvias, estos riesgos serán mayores para perros
                  de tamaño mediano a grande que para los pequeños.
                </p>
              </div>

              <div>
                <h4 className="font-medium">Capacidad de entrenamiento:</h4>
                <p>
                  Las barras rojas/naranjas para la capacidad de entrenamiento pueden o no ser motivo de preocupación
                  para un propietario en particular. Los factores que pueden ayudar a determinar si se debe tomar
                  medidas incluyen el tamaño y la fuerza del perro, dónde vive y el nivel de obediencia que espera de su
                  perro. Si vive cerca de una calle concurrida, por ejemplo, un perro que no acude cuando se le llama
                  puede ser una preocupación significativa.
                </p>
              </div>

              <div>
                <h4 className="font-medium">Excitabilidad y energía:</h4>
                <p>
                  Las barras rojas/naranjas para excitabilidad y energía son motivo de preocupación si encuentra que el
                  comportamiento del perro es una fuente seria de irritación. El valor de molestia de la
                  hiperexcitabilidad tiende a surgir de su asociación con comportamientos molestos, como ladridos
                  excesivos o saltar sobre las personas, ambos fácilmente modificables mediante entrenamiento.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conductas Especiales</CardTitle>
          <CardDescription>Comportamientos que no corresponden a ningún factor específico</CardDescription>
        </CardHeader>
        <CardContent>
          {isClient ? (
            <SpecialBehaviorsChart behaviors={getSpecialBehaviorScores()} />
          ) : (
            <div className="w-full h-[600px] flex items-center justify-center bg-primary/20 rounded-lg">
              <p className="text-lg text-muted-foreground">Cargando gráfica de conductas especiales...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {showEmailForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Enviar Resultados por Correo Electrónico</CardTitle>
            <CardDescription>Los resultados se enviarán automáticamente a contacto@r-positivo.com</CardDescription>
          </CardHeader>
          <CardContent>
            <EmailForm answers={answers} anamnesisData={anamnesisData} />
          </CardContent>
        </Card>
      ) : null}

      {storeResult && (
        <Alert variant={storeResult.success ? "default" : "destructive"} className="mt-4">
          {storeResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertTitle>{storeResult.success ? "Éxito" : "Error"}</AlertTitle>
          <AlertDescription>
            {storeResult.message}
            {storeResult.success && storeResult.id && (
              <p className="mt-2 text-sm">
                ID del cuestionario: <code className="bg-primary/20 px-1 rounded">{storeResult.id}</code>
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button onClick={handlePrint} variant="secondary">
          Imprimir Resultados
        </Button>
        <Button onClick={() => setShowEmailForm(!showEmailForm)}>
          {showEmailForm ? "Ocultar Formulario" : "Enviar Resultados por Correo"}
        </Button>
        <Button onClick={handleStoreData} disabled={isStoring} variant="outline">
          {isStoring ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Almacenando...
            </>
          ) : (
            "Almacenar Datos del Perro"
          )}
        </Button>
      </div>
    </div>
  )
}

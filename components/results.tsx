"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cbarqQuestions, factorNames, populationAverages, specialBehaviors } from "@/lib/cbarq-data"
import { FactorChart } from "@/components/factor-chart"
import { SpecialBehaviorsChart } from "@/components/special-behaviors-chart"
import { NOT_OBSERVED } from "@/components/questionnaire"
import { EmailForm } from "@/components/email-form"
import { useState, useEffect } from "react"
import { Loader2, RotateCcw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"
import { storeQuestionnaire } from "@/lib/store-data"

interface ResultsProps {
  answers: Record<string, number>
  anamnesisData?: any
  onRestart?: () => void
}

export function Results({ answers, anamnesisData, onRestart }: ResultsProps) {
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isStoring, setIsStoring] = useState(false)
  const [storeResult, setStoreResult] = useState<{ success: boolean; message: string; id?: string } | null>(null)

  // Usar useEffect para asegurarse de que el componente solo se renderice en el cliente
  useEffect(() => {
    setIsClient(true)

    // Guardar resultados en localStorage
    const resultsData = {
      answers,
      anamnesisData,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem("cbarq-results", JSON.stringify(resultsData))
  }, [answers, anamnesisData])

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

  const getSpecialBehaviorScores = () => {
    return specialBehaviors.map((behavior) => ({
      id: behavior.id,
      text: behavior.text,
      score: answers[behavior.id] === NOT_OBSERVED ? null : answers[behavior.id] || 0,
      notObserved: answers[behavior.id] === NOT_OBSERVED,
    }))
  }

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

      setStoreResult({
        success: result.success,
        message: result.success ? "Resultados almacenados exitosamente" : result.message,
        id: result.id,
      })
    } catch (error) {
      setStoreResult({
        success: false,
        message: `Error al almacenar: ${error instanceof Error ? error.message : "Error desconocido"}`,
      })
    } finally {
      setIsStoring(false)
    }
  }

  const handleRestart = () => {
    // Limpiar localStorage
    localStorage.removeItem("cbarq-results")
    localStorage.removeItem("cbarq-anamnesis")
    localStorage.removeItem("cbarq-answers")

    // Llamar a la función de reinicio si está disponible
    if (onRestart) {
      onRestart()
    }
  }

  return (
    <div className="space-y-8">
      {anamnesisData && (
        <Card>
          <CardHeader>
            <CardTitle>Información Completa de Anamnesis</CardTitle>
            <CardDescription>Todos los datos recopilados durante la evaluación inicial</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Información Básica del Perro */}
              <div>
                <h4 className="font-medium mb-3 text-lg border-b pb-1">Información del Perro</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <p>
                    <strong>Nombre:</strong> {anamnesisData.petName || "No especificado"}
                  </p>
                  <p>
                    <strong>Raza:</strong> {anamnesisData.breed || "No especificado"}
                  </p>
                  <p>
                    <strong>Edad:</strong> {anamnesisData.age || "No especificado"}
                  </p>
                  <p>
                    <strong>Sexo:</strong> {anamnesisData.sex || "No especificado"}
                  </p>
                  <p>
                    <strong>Castrado/Esterilizado:</strong> {anamnesisData.neutered || "No especificado"}
                  </p>
                  <p>
                    <strong>Peso:</strong> {anamnesisData.weight || "No especificado"}
                  </p>
                  <p>
                    <strong>Edad de llegada al hogar:</strong> {anamnesisData.acquisitionAge || "No especificado"}
                  </p>
                  <p>
                    <strong>Origen:</strong> {anamnesisData.acquisitionSource || "No especificado"}
                  </p>
                </div>
              </div>

              {/* Información del Tutor */}
              <div>
                <h4 className="font-medium mb-3 text-lg border-b pb-1">Información del Tutor</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <p>
                    <strong>Nombre:</strong> {anamnesisData.tutorName || "No especificado"}
                  </p>
                  <p>
                    <strong>Teléfono:</strong> {anamnesisData.tutorPhone || "No especificado"}
                  </p>
                  <p>
                    <strong>Email:</strong> {anamnesisData.tutorEmail || "No especificado"}
                  </p>
                  <p>
                    <strong>Dirección:</strong> {anamnesisData.tutorAddress || "No especificado"}
                  </p>
                </div>
              </div>

              {/* Problema Principal */}
              <div>
                <h4 className="font-medium mb-3 text-lg border-b pb-1">Problema Principal</h4>
                <div className="space-y-2 text-sm">
                  {anamnesisData.mainProblem && (
                    <div>
                      <strong>Descripción del problema:</strong>
                      <p className="bg-primary/10 p-3 rounded mt-1">{anamnesisData.mainProblem}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <p>
                      <strong>Duración:</strong> {anamnesisData.problemDuration || "No especificado"}
                    </p>
                    <p>
                      <strong>Frecuencia:</strong> {anamnesisData.problemFrequency || "No especificado"}
                    </p>
                    <p>
                      <strong>Intensidad:</strong> {anamnesisData.behaviorIntensity || "No especificado"}
                    </p>
                    <p>
                      <strong>Evolución:</strong> {anamnesisData.behaviorEvolution || "No especificado"}
                    </p>
                  </div>
                  {anamnesisData.problemTriggers && (
                    <div>
                      <strong>Situaciones que lo provocan:</strong>
                      <p className="bg-primary/10 p-2 rounded mt-1">{anamnesisData.problemTriggers}</p>
                    </div>
                  )}
                  {anamnesisData.behaviorSequence && (
                    <div>
                      <strong>Secuencia del comportamiento:</strong>
                      <p className="bg-primary/10 p-2 rounded mt-1">{anamnesisData.behaviorSequence}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Personalidad */}
              <div>
                <h4 className="font-medium mb-3 text-lg border-b pb-1">Personalidad y Temperamento</h4>
                <div className="space-y-2 text-sm">
                  {anamnesisData.temperamentTraits && anamnesisData.temperamentTraits.length > 0 && (
                    <div>
                      <strong>Rasgos de personalidad:</strong>
                      <p className="mt-1">{anamnesisData.temperamentTraits.join(", ")}</p>
                    </div>
                  )}
                  {anamnesisData.personalityDescription && (
                    <div>
                      <strong>Descripción de personalidad:</strong>
                      <p className="bg-primary/10 p-2 rounded mt-1">{anamnesisData.personalityDescription}</p>
                    </div>
                  )}
                  {anamnesisData.socialization && (
                    <div>
                      <strong>Socialización temprana:</strong>
                      <p className="bg-primary/10 p-2 rounded mt-1">{anamnesisData.socialization}</p>
                    </div>
                  )}
                  {anamnesisData.learningHistory && (
                    <div>
                      <strong>Historia de entrenamiento:</strong>
                      <p className="bg-primary/10 p-2 rounded mt-1">{anamnesisData.learningHistory}</p>
                    </div>
                  )}
                  {anamnesisData.cognitiveAbilities && (
                    <div>
                      <strong>Capacidades cognitivas:</strong>
                      <p className="bg-primary/10 p-2 rounded mt-1">{anamnesisData.cognitiveAbilities}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Salud */}
              <div>
                <h4 className="font-medium mb-3 text-lg border-b pb-1">Información de Salud</h4>
                <div className="space-y-2 text-sm">
                  {anamnesisData.medicalHistory && (
                    <div>
                      <strong>Historia médica:</strong>
                      <p className="bg-primary/10 p-2 rounded mt-1">{anamnesisData.medicalHistory}</p>
                    </div>
                  )}
                  {anamnesisData.currentMedications && (
                    <div>
                      <strong>Medicamentos actuales:</strong>
                      <p className="bg-primary/10 p-2 rounded mt-1">{anamnesisData.currentMedications}</p>
                    </div>
                  )}
                  {anamnesisData.neurologicalSigns && (
                    <div>
                      <strong>Signos neurológicos:</strong>
                      <p className="bg-primary/10 p-2 rounded mt-1">{anamnesisData.neurologicalSigns}</p>
                    </div>
                  )}
                  {anamnesisData.painAssessment && (
                    <div>
                      <strong>Evaluación de dolor:</strong>
                      <p className="bg-primary/10 p-2 rounded mt-1">{anamnesisData.painAssessment}</p>
                    </div>
                  )}
                  {anamnesisData.reproductiveStatus && (
                    <div>
                      <strong>Estado reproductivo:</strong>
                      <p className="bg-primary/10 p-2 rounded mt-1">{anamnesisData.reproductiveStatus}</p>
                    </div>
                  )}
                  {anamnesisData.veterinaryExams && (
                    <div>
                      <strong>Exámenes veterinarios:</strong>
                      <p className="bg-primary/10 p-2 rounded mt-1">{anamnesisData.veterinaryExams}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Ambiente y Rutina */}
              <div>
                <h4 className="font-medium mb-3 text-lg border-b pb-1">Ambiente y Rutina</h4>
                <div className="space-y-2 text-sm">
                  {anamnesisData.physicalEnvironment && (
                    <div>
                      <strong>Ambiente físico:</strong>
                      <p className="bg-primary/10 p-2 rounded mt-1">{anamnesisData.physicalEnvironment}</p>
                    </div>
                  )}
                  {anamnesisData.socialEnvironment && (
                    <div>
                      <strong>Ambiente social:</strong>
                      <p className="bg-primary/10 p-2 rounded mt-1">{anamnesisData.socialEnvironment}</p>
                    </div>
                  )}
                  {anamnesisData.dailyRoutine && (
                    <div>
                      <strong>Rutina diaria:</strong>
                      <p className="bg-primary/10 p-2 rounded mt-1">{anamnesisData.dailyRoutine}</p>
                    </div>
                  )}
                  <p>
                    <strong>Nivel de ejercicio:</strong> {anamnesisData.exerciseEnrichment || "No especificado"}
                  </p>
                  {anamnesisData.environmentalStressors && anamnesisData.environmentalStressors.length > 0 && (
                    <div>
                      <strong>Factores estresantes:</strong>
                      <p className="mt-1">{anamnesisData.environmentalStressors.join(", ")}</p>
                    </div>
                  )}
                  {anamnesisData.managementPractices && (
                    <div>
                      <strong>Prácticas de manejo:</strong>
                      <p className="bg-primary/10 p-2 rounded mt-1">{anamnesisData.managementPractices}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Calidad de Vida */}
              <div>
                <h4 className="font-medium mb-3 text-lg border-b pb-1">Calidad de Vida y Funcionamiento</h4>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <p>
                      <strong>Bienestar del animal:</strong> {anamnesisData.animalWelfare || "No especificado"}
                    </p>
                    <p>
                      <strong>Función como mascota:</strong> {anamnesisData.petFunction || "No especificado"}
                    </p>
                    <p>
                      <strong>Impacto social:</strong> {anamnesisData.socialImpact || "No especificado"}
                    </p>
                    <p>
                      <strong>Funcionamiento general:</strong> {anamnesisData.overallFunctioning || "No especificado"}
                    </p>
                  </div>
                  {anamnesisData.familyImpact && (
                    <div>
                      <strong>Impacto en la familia:</strong>
                      <p className="bg-primary/10 p-2 rounded mt-1">{anamnesisData.familyImpact}</p>
                    </div>
                  )}
                  {anamnesisData.treatmentGoals && (
                    <div>
                      <strong>Objetivos de tratamiento:</strong>
                      <p className="bg-primary/10 p-2 rounded mt-1">{anamnesisData.treatmentGoals}</p>
                    </div>
                  )}
                  {anamnesisData.prognosisFactors && (
                    <div>
                      <strong>Disposición para el tratamiento:</strong>
                      <p className="bg-primary/10 p-2 rounded mt-1">{anamnesisData.prognosisFactors}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
            <div className="w-full">
              <FactorChart factorScores={factorScores} factorMetadata={factorScoresWithMetadata} />
            </div>
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
                  para un tutor en particular. Los factores que pueden ayudar a determinar si se debe tomar medidas
                  incluyen el tamaño y la fuerza del perro, dónde vive y el nivel de obediencia que espera de su perro.
                  Si vive cerca de una calle concurrida, por ejemplo, un perro que no acude cuando se le llama puede ser
                  una preocupación significativa.
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
            <div className="w-full">
              <SpecialBehaviorsChart behaviors={getSpecialBehaviorScores()} />
            </div>
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
            "Guardar en Base de Datos"
          )}
        </Button>
        <Button onClick={handleRestart} variant="destructive">
          <RotateCcw className="mr-2 h-4 w-4" />
          Empezar Nuevamente
        </Button>
      </div>
    </div>
  )
}

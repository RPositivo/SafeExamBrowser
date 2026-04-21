"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { cbarqQuestions, factorNames, specialBehaviors } from "@/lib/cbarq-data"
import { Results } from "@/components/results"
import { Anamnesis } from "@/components/anamnesis"

// Valor especial para "No se ha observado"
export const NOT_OBSERVED = -1

export function Questionnaire() {
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [currentTab, setCurrentTab] = useState("stranger-directed-aggression")
  const [showResults, setShowResults] = useState(false)
  const [currentSection, setCurrentSection] = useState<"anamnesis" | "questionnaire" | "results">("anamnesis")
  const [anamnesisData, setAnamnesisData] = useState<any>(null)

  // Cargar datos del localStorage al inicializar
  useEffect(() => {
    const savedAnswers = localStorage.getItem("cbarq-answers")
    const savedAnamnesis = localStorage.getItem("cbarq-anamnesis")
    const savedResults = localStorage.getItem("cbarq-results")

    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers))
    }

    if (savedAnamnesis) {
      setAnamnesisData(JSON.parse(savedAnamnesis))
    }

    // Si hay resultados guardados, ir directamente a resultados
    if (savedResults && savedAnswers && savedAnamnesis) {
      setCurrentSection("results")
    } else if (savedAnamnesis) {
      setCurrentSection("questionnaire")
    }
  }, [])

  // Guardar respuestas en localStorage cuando cambien
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem("cbarq-answers", JSON.stringify(answers))
    }
  }, [answers])

  // Guardar datos de anamnesis en localStorage cuando cambien
  useEffect(() => {
    if (anamnesisData) {
      localStorage.setItem("cbarq-anamnesis", JSON.stringify(anamnesisData))
    }
  }, [anamnesisData])

  const handleAnswerChange = (questionId: string, value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const calculateProgress = () => {
    const totalQuestions = Object.values(cbarqQuestions).flat().length + specialBehaviors.length
    const answeredQuestions = Object.keys(answers).length
    return (answeredQuestions / totalQuestions) * 100
  }

  const isComplete = () => {
    // Permitir ver resultados si al menos se ha respondido a una pregunta
    return Object.keys(answers).length > 0
  }

  const handleRestart = () => {
    // Limpiar todos los estados
    setAnswers({})
    setAnamnesisData(null)
    setCurrentTab("stranger-directed-aggression")
    setCurrentSection("anamnesis")
    setShowResults(false)

    // Limpiar localStorage
    localStorage.removeItem("cbarq-answers")
    localStorage.removeItem("cbarq-anamnesis")
    localStorage.removeItem("cbarq-results")
  }

  if (currentSection === "anamnesis") {
    return (
      <Anamnesis
        onComplete={(data) => {
          setAnamnesisData(data)
          setCurrentSection("questionnaire")
        }}
      />
    )
  }

  if (currentSection === "results") {
    return <Results answers={answers} anamnesisData={anamnesisData} onRestart={handleRestart} />
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-card/70 p-4 sm:p-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">Progreso</span>
          <span className="text-sm font-medium">{Math.round(calculateProgress())}%</span>
        </div>
        <Progress value={calculateProgress()} className="h-2" />
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <div className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">Secciones del cuestionario</h2>
            <p className="text-sm text-muted-foreground">
              Navegue por bloques cortos. En movil, cada pestaña ocupa mas alto para mejorar lectura y toque.
            </p>
          </div>
          <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0 sm:grid-cols-3 lg:grid-cols-4">
            {Object.keys(factorNames).map((factor) => (
              <TabsTrigger
                key={factor}
                value={factor}
                className="border border-white/10 bg-card/70 px-2 py-3 text-left text-xs sm:text-sm"
              >
                {factorNames[factor]}
              </TabsTrigger>
            ))}
            <TabsTrigger
              value="special-behaviors"
              className="border border-white/10 bg-card/70 px-2 py-3 text-left text-xs sm:text-sm"
            >
              Conductas Especiales
            </TabsTrigger>
          </TabsList>
        </div>

        {Object.entries(cbarqQuestions).map(([factor, questions]) => (
          <TabsContent key={factor} value={factor} className="mt-0">
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-white/10 bg-primary/10">
                <CardTitle>{factorNames[factor]}</CardTitle>
                <CardDescription>
                  Evalúe con qué frecuencia su perro muestra los siguientes comportamientos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-4 sm:pt-5 md:pt-6">
                {questions.map((question, index) => (
                  <div key={question.id} className="space-y-4 rounded-2xl border border-white/10 bg-background/30 p-4">
                    <div className="text-sm font-medium leading-6 sm:text-base">
                      {index + 1}. {question.text}
                    </div>
                    <RadioGroup
                      value={answers[question.id]?.toString()}
                      onValueChange={(value) => handleAnswerChange(question.id, Number.parseInt(value))}
                      className="grid grid-cols-3 gap-2 sm:grid-cols-6"
                    >
                      {[0, 1, 2, 3, 4, NOT_OBSERVED].map((value) => (
                        <Label
                          key={value}
                          htmlFor={`${question.id}-${value}`}
                          className="flex min-h-[68px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-card/70 px-2 py-3 text-center text-xs font-medium transition-colors hover:bg-card"
                        >
                          <RadioGroupItem value={value.toString()} id={`${question.id}-${value}`} />
                          <span>{value === NOT_OBSERVED ? "N/O" : value}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                      <span>Nunca</span>
                      <span className="text-right sm:text-center">Siempre</span>
                      <span className="col-span-2 text-right sm:col-span-1">No observado</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}

        <TabsContent value="special-behaviors" className="mt-0">
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-white/10 bg-primary/10">
              <CardTitle>Conductas Especiales</CardTitle>
              <CardDescription>
                Estas conductas no corresponden a ningún factor específico pero son importantes para evaluar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4 sm:pt-5 md:pt-6">
              {specialBehaviors.map((question, index) => (
                <div key={question.id} className="space-y-4 rounded-2xl border border-white/10 bg-background/30 p-4">
                  <div className="text-sm font-medium leading-6 sm:text-base">
                    {index + 1}. {question.text}
                  </div>
                  <RadioGroup
                    value={answers[question.id]?.toString()}
                    onValueChange={(value) => handleAnswerChange(question.id, Number.parseInt(value))}
                    className="grid grid-cols-3 gap-2 sm:grid-cols-6"
                  >
                    {[0, 1, 2, 3, 4, NOT_OBSERVED].map((value) => (
                      <Label
                        key={value}
                        htmlFor={`${question.id}-${value}`}
                        className="flex min-h-[68px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-card/70 px-2 py-3 text-center text-xs font-medium transition-colors hover:bg-card"
                      >
                        <RadioGroupItem value={value.toString()} id={`${question.id}-${value}`} />
                        <span>{value === NOT_OBSERVED ? "N/O" : value}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                    <span>Nunca</span>
                    <span className="text-right sm:text-center">Siempre</span>
                    <span className="col-span-2 text-right sm:col-span-1">No observado</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            const factors = Object.keys(factorNames)
            const currentIndex = factors.indexOf(currentTab)
            if (currentTab === "special-behaviors") {
              setCurrentTab(factors[factors.length - 1])
            } else if (currentIndex > 0) {
              setCurrentTab(factors[currentIndex - 1])
            }
          }}
          disabled={currentTab === Object.keys(factorNames)[0]}
        >
          Anterior
        </Button>

        {currentTab === "special-behaviors" ? (
          <Button className="w-full" onClick={() => setCurrentSection("results")} disabled={!isComplete()}>
            Ver Resultados
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={() => {
              const factors = Object.keys(factorNames)
              const currentIndex = factors.indexOf(currentTab)
              if (currentIndex === factors.length - 1) {
                setCurrentTab("special-behaviors")
              } else {
                setCurrentTab(factors[currentIndex + 1])
              }
            }}
          >
            Siguiente
          </Button>
        )}

        <Button
          variant="outline"
          className="w-full sm:col-span-2 xl:col-span-1"
          onClick={() => setCurrentSection("anamnesis")}
        >
          Volver a Anamnesis
        </Button>
      </div>
    </div>
  )
}

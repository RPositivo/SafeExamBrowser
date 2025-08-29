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
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Progreso</span>
          <span className="text-sm font-medium">{Math.round(calculateProgress())}%</span>
        </div>
        <Progress value={calculateProgress()} className="h-2" />
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid grid-cols-3 grid-rows-5 h-auto gap-1">
          {Object.keys(factorNames).map((factor) => (
            <TabsTrigger key={factor} value={factor} className="text-xs md:text-sm py-2">
              {factorNames[factor]}
            </TabsTrigger>
          ))}
          <TabsTrigger value="special-behaviors" className="text-xs md:text-sm py-2">
            Conductas Especiales
          </TabsTrigger>
        </TabsList>

        {Object.entries(cbarqQuestions).map(([factor, questions]) => (
          <TabsContent key={factor} value={factor} className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{factorNames[factor]}</CardTitle>
                <CardDescription>
                  Evalúe con qué frecuencia su perro muestra los siguientes comportamientos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {questions.map((question, index) => (
                  <div key={question.id} className="space-y-3">
                    <div className="font-medium">
                      {index + 1}. {question.text}
                    </div>
                    <RadioGroup
                      value={answers[question.id]?.toString()}
                      onValueChange={(value) => handleAnswerChange(question.id, Number.parseInt(value))}
                      className="flex justify-between"
                    >
                      {[0, 1, 2, 3, 4, NOT_OBSERVED].map((value) => (
                        <div key={value} className="flex flex-col items-center gap-1">
                          <RadioGroupItem value={value.toString()} id={`${question.id}-${value}`} />
                          <Label htmlFor={`${question.id}-${value}`} className="text-xs">
                            {value === NOT_OBSERVED ? "N/O" : value}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                      <span>Nunca</span>
                      <span className="ml-auto">Siempre</span>
                      <span className="ml-4">No observado</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}

        <TabsContent value="special-behaviors" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Conductas Especiales</CardTitle>
              <CardDescription>
                Estas conductas no corresponden a ningún factor específico pero son importantes para evaluar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {specialBehaviors.map((question, index) => (
                <div key={question.id} className="space-y-3">
                  <div className="font-medium">
                    {index + 1}. {question.text}
                  </div>
                  <RadioGroup
                    value={answers[question.id]?.toString()}
                    onValueChange={(value) => handleAnswerChange(question.id, Number.parseInt(value))}
                    className="flex justify-between"
                  >
                    {[0, 1, 2, 3, 4, NOT_OBSERVED].map((value) => (
                      <div key={value} className="flex flex-col items-center gap-1">
                        <RadioGroupItem value={value.toString()} id={`${question.id}-${value}`} />
                        <Label htmlFor={`${question.id}-${value}`} className="text-xs">
                          {value === NOT_OBSERVED ? "N/O" : value}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <div className="flex justify-between text-xs text-muted-foreground px-1">
                    <span>Nunca</span>
                    <span className="ml-auto">Siempre</span>
                    <span className="ml-4">No observado</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between">
        <Button
          variant="outline"
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
          <Button onClick={() => setCurrentSection("results")} disabled={!isComplete()}>
            Ver Resultados
          </Button>
        ) : (
          <Button
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

        <Button variant="outline" onClick={() => setCurrentSection("anamnesis")}>
          Volver a Anamnesis
        </Button>
      </div>
    </div>
  )
}

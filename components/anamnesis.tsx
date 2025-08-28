"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

interface AnamnesisData {
  // Datos generales del animal
  petName: string
  species: string
  breed: string
  age: string
  sex: string
  neutered: string
  weight: string
  acquisitionAge: string
  acquisitionSource: string

  // Datos del propietario
  ownerName: string
  ownerPhone: string
  ownerEmail: string
  ownerAddress: string

  // Descripción del problema principal
  mainProblem: string
  problemDuration: string
  problemFrequency: string
  problemSeverity: string
  problemTriggers: string
  problemConsequences: string

  // Eje I - Trastornos clínicos
  behaviorProblems: string[]
  behaviorDescription: string
  behaviorOnset: string
  behaviorProgression: string

  // Eje II - Desarrollo y temperamento
  earlyDevelopment: string
  socialization: string
  temperament: string[]
  learningHistory: string

  // Eje III - Condiciones médicas
  medicalHistory: string
  currentMedications: string
  veterinaryExams: string
  physicalLimitations: string

  // Eje IV - Factores psicosociales y ambientales
  livingEnvironment: string
  familyComposition: string
  dailyRoutine: string
  exerciseLevel: string
  socialInteractions: string
  environmentalStressors: string[]

  // Eje V - Funcionamiento global
  overallFunctioning: string
  qualityOfLife: string
  ownerExpectations: string
  treatmentGoals: string

  behaviorSequence: string
  behaviorIntensity: string
  behaviorEvolution: string
  temperamentTraits: string[]
  personalityDescription: string
  cognitiveAbilities: string
  neurologicalSigns: string
  painAssessment: string
  reproductiveStatus: string
  physicalEnvironment: string
  socialEnvironment: string
  exerciseEnrichment: string
  managementPractices: string
  animalWelfare: string
  petFunction: string
  socialImpact: string
  familyImpact: string
  prognosisFactors: string
}

interface AnamnesisProps {
  onComplete: (data: AnamnesisData) => void
}

export function Anamnesis({ onComplete }: AnamnesisProps) {
  const [currentTab, setCurrentTab] = useState("general")
  const [formData, setFormData] = useState<Partial<AnamnesisData>>({
    behaviorProblems: [],
    temperament: [],
    environmentalStressors: [],
    temperamentTraits: [],
  })

  const updateFormData = (field: keyof AnamnesisData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const updateArrayField = (field: keyof AnamnesisData, value: string, checked: boolean) => {
    setFormData((prev) => {
      const currentArray = (prev[field] as string[]) || []
      if (checked) {
        return {
          ...prev,
          [field]: [...currentArray, value],
        }
      } else {
        return {
          ...prev,
          [field]: currentArray.filter((item) => item !== value),
        }
      }
    })
  }

  const calculateProgress = () => {
    const requiredFields = [
      "petName",
      "species",
      "breed",
      "age",
      "sex",
      "ownerName",
      "ownerEmail",
      "mainProblem",
      "problemDuration",
      "behaviorDescription",
      "medicalHistory",
      "livingEnvironment",
      "overallFunctioning",
    ]

    const completedFields = requiredFields.filter(
      (field) => formData[field as keyof AnamnesisData] && String(formData[field as keyof AnamnesisData]).trim() !== "",
    ).length

    return (completedFields / requiredFields.length) * 100
  }

  const isComplete = () => {
    return calculateProgress() >= 80 // Al menos 80% completado
  }

  const handleComplete = () => {
    if (isComplete()) {
      onComplete(formData as AnamnesisData)
    }
  }

  const tabs = [
    { id: "general", label: "Información Básica" },
    { id: "behaviour", label: "El Problema" },
    { id: "traits", label: "Personalidad" },
    { id: "health", label: "Salud" },
    { id: "environment", label: "Su Hogar y Rutina" },
    { id: "functioning", label: "Calidad de Vida" },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información sobre su mascota</CardTitle>
          <CardDescription>
            Por favor complete la siguiente información para ayudarnos a entender mejor a su mascota y su situación
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Progreso del formulario</span>
          <span className="text-sm font-medium">{Math.round(calculateProgress())}%</span>
        </div>
        <Progress value={calculateProgress()} className="h-2" />
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-3 h-auto gap-1">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="text-xs md:text-sm py-2 px-1">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Información Básica */}
        <TabsContent value="general" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>Datos generales sobre su mascota y usted</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="petName">Nombre de su mascota *</Label>
                  <Input
                    id="petName"
                    value={formData.petName || ""}
                    onChange={(e) => updateFormData("petName", e.target.value)}
                    placeholder="Ej: Max, Luna, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="species">Tipo de animal *</Label>
                  <Select value={formData.species || ""} onValueChange={(value) => updateFormData("species", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="canino">Perro</SelectItem>
                      <SelectItem value="felino">Gato</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="breed">Raza *</Label>
                  <Input
                    id="breed"
                    value={formData.breed || ""}
                    onChange={(e) => updateFormData("breed", e.target.value)}
                    placeholder="Ej: Labrador, Mestizo, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Edad *</Label>
                  <Input
                    id="age"
                    value={formData.age || ""}
                    onChange={(e) => updateFormData("age", e.target.value)}
                    placeholder="Ej: 3 años, 6 meses"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sexo *</Label>
                  <RadioGroup value={formData.sex || ""} onValueChange={(value) => updateFormData("sex", value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="macho" id="macho" />
                      <Label htmlFor="macho">Macho</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hembra" id="hembra" />
                      <Label htmlFor="hembra">Hembra</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label>¿Está castrado/esterilizado?</Label>
                  <RadioGroup
                    value={formData.neutered || ""}
                    onValueChange={(value) => updateFormData("neutered", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="no-castrado" />
                      <Label htmlFor="no-castrado">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="si" id="si-castrado" />
                      <Label htmlFor="si-castrado">Sí</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Peso aproximado</Label>
                  <Input
                    id="weight"
                    value={formData.weight || ""}
                    onChange={(e) => updateFormData("weight", e.target.value)}
                    placeholder="Ej: 25 kg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acquisitionAge">¿A qué edad llegó a su hogar?</Label>
                  <Input
                    id="acquisitionAge"
                    value={formData.acquisitionAge || ""}
                    onChange={(e) => updateFormData("acquisitionAge", e.target.value)}
                    placeholder="Ej: 2 meses, 1 año"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="acquisitionSource">¿De dónde vino su mascota?</Label>
                <Input
                  id="acquisitionSource"
                  value={formData.acquisitionSource || ""}
                  onChange={(e) => updateFormData("acquisitionSource", e.target.value)}
                  placeholder="Ej: Criador, refugio, lo encontré en la calle, me lo regalaron"
                />
              </div>

              <div className="border-t pt-4 mt-6">
                <h3 className="text-lg font-medium mb-4">Sus Datos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Su nombre completo *</Label>
                    <Input
                      id="ownerName"
                      value={formData.ownerName || ""}
                      onChange={(e) => updateFormData("ownerName", e.target.value)}
                      placeholder="Nombre y apellidos"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerPhone">Teléfono</Label>
                    <Input
                      id="ownerPhone"
                      value={formData.ownerPhone || ""}
                      onChange={(e) => updateFormData("ownerPhone", e.target.value)}
                      placeholder="Número de teléfono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerEmail">Email *</Label>
                    <Input
                      id="ownerEmail"
                      type="email"
                      value={formData.ownerEmail || ""}
                      onChange={(e) => updateFormData("ownerEmail", e.target.value)}
                      placeholder="su.email@ejemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerAddress">Dirección (opcional)</Label>
                    <Input
                      id="ownerAddress"
                      value={formData.ownerAddress || ""}
                      onChange={(e) => updateFormData("ownerAddress", e.target.value)}
                      placeholder="Ciudad, país"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* El Problema */}
        <TabsContent value="behaviour" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Cuéntenos sobre el problema</CardTitle>
              <CardDescription>Describa con detalle el comportamiento que le preocupa de su mascota</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mainProblem">¿Cuál es el problema principal que tiene con su mascota? *</Label>
                <Textarea
                  id="mainProblem"
                  value={formData.mainProblem || ""}
                  onChange={(e) => updateFormData("mainProblem", e.target.value)}
                  placeholder="Describa con detalle qué hace su mascota que le preocupa. Por ejemplo: 'Mi perro ladra mucho cuando llegan visitas y no para hasta que se van. También salta encima de las personas y es muy difícil controlarlo.'"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="problemDuration">¿Hace cuánto tiempo ocurre esto? *</Label>
                  <Select
                    value={formData.problemDuration || ""}
                    onValueChange={(value) => updateFormData("problemDuration", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el tiempo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="menos-1-mes">Menos de 1 mes</SelectItem>
                      <SelectItem value="1-3-meses">Entre 1 y 3 meses</SelectItem>
                      <SelectItem value="3-6-meses">Entre 3 y 6 meses</SelectItem>
                      <SelectItem value="6-12-meses">Entre 6 meses y 1 año</SelectItem>
                      <SelectItem value="mas-1-año">Más de 1 año</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="problemFrequency">¿Con qué frecuencia ocurre?</Label>
                  <Select
                    value={formData.problemFrequency || ""}
                    onValueChange={(value) => updateFormData("problemFrequency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione la frecuencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diaria">Todos los días</SelectItem>
                      <SelectItem value="varias-veces-dia">Varias veces al día</SelectItem>
                      <SelectItem value="semanal">Una vez por semana</SelectItem>
                      <SelectItem value="mensual">Una vez al mes</SelectItem>
                      <SelectItem value="ocasional">De vez en cuando</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="problemTriggers">¿Qué situaciones provocan este comportamiento?</Label>
                <Textarea
                  id="problemTriggers"
                  value={formData.problemTriggers || ""}
                  onChange={(e) => updateFormData("problemTriggers", e.target.value)}
                  placeholder="Por ejemplo: 'Cuando suena el timbre', 'Cuando ve otros perros', 'Cuando me voy de casa', etc."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="behaviorSequence">¿Qué pasa antes, durante y después del comportamiento?</Label>
                <Textarea
                  id="behaviorSequence"
                  value={formData.behaviorSequence || ""}
                  onChange={(e) => updateFormData("behaviorSequence", e.target.value)}
                  placeholder="Describa la secuencia completa. Por ejemplo: 'Primero se pone nervioso, luego empieza a ladrar, después salta, y al final se calma cuando la visita se sienta'"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>¿Qué tan grave considera el problema?</Label>
                <RadioGroup
                  value={formData.behaviorIntensity || ""}
                  onValueChange={(value) => updateFormData("behaviorIntensity", value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="leve" id="leve" />
                    <Label htmlFor="leve">Leve - Es molesto pero no peligroso</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderado" id="moderado" />
                    <Label htmlFor="moderado">Moderado - Afecta mucho nuestra vida diaria</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="severo" id="severo" />
                    <Label htmlFor="severo">Severo - Es peligroso o muy problemático</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="behaviorEvolution">¿El problema ha empeorado, mejorado o sigue igual?</Label>
                <Textarea
                  id="behaviorEvolution"
                  value={formData.behaviorEvolution || ""}
                  onChange={(e) => updateFormData("behaviorEvolution", e.target.value)}
                  placeholder="Cuéntenos si ha notado cambios en el comportamiento desde que comenzó"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personalidad */}
        <TabsContent value="traits" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>La personalidad de su mascota</CardTitle>
              <CardDescription>Ayúdenos a conocer cómo es su mascota en general</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>¿Cómo describiría la personalidad de su mascota? (puede marcar varias opciones)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    "Nervioso/Ansioso",
                    "Confiado/Seguro de sí mismo",
                    "Tímido/Miedoso",
                    "Sociable/Le gusta la gente",
                    "Dominante/Le gusta mandar",
                    "Obediente/Sumiso",
                    "Impulsivo/Reacciona rápido",
                    "Calmado/Tranquilo",
                    "Juguetón/Activo",
                    "Perezoso/Tranquilo",
                    "Independiente",
                    "Pegajoso/Dependiente",
                    "Protector/Territorial",
                    "Tolerante/Flexible",
                    "Sensible a ruidos/cambios",
                    "Se adapta fácilmente",
                  ].map((trait) => (
                    <div key={trait} className="flex items-center space-x-2">
                      <Checkbox
                        id={trait}
                        checked={(formData.temperamentTraits || []).includes(trait)}
                        onCheckedChange={(checked) => updateArrayField("temperamentTraits", trait, checked as boolean)}
                      />
                      <Label htmlFor={trait}>{trait}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="personalityDescription">
                  Describa la personalidad de su mascota con sus propias palabras
                </Label>
                <Textarea
                  id="personalityDescription"
                  value={formData.personalityDescription || ""}
                  onChange={(e) => updateFormData("personalityDescription", e.target.value)}
                  placeholder="Por ejemplo: 'Es muy cariñoso pero a veces se pone nervioso con los extraños. Le encanta jugar pero también puede ser muy testarudo cuando no quiere hacer algo.'"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="socialization">
                  ¿Cómo fue su contacto con personas y otros animales cuando era pequeño?
                </Label>
                <Textarea
                  id="socialization"
                  value={formData.socialization || ""}
                  onChange={(e) => updateFormData("socialization", e.target.value)}
                  placeholder="Cuéntenos si conoció muchas personas, otros animales, lugares diferentes cuando era cachorro/gatito"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="learningHistory">¿Ha recibido entrenamiento? ¿Cómo aprende?</Label>
                <Textarea
                  id="learningHistory"
                  value={formData.learningHistory || ""}
                  onChange={(e) => updateFormData("learningHistory", e.target.value)}
                  placeholder="Cuéntenos si ha ido a clases de entrenamiento, cómo responde cuando le enseña cosas nuevas, qué métodos han usado"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cognitiveAbilities">¿Qué tan inteligente considera que es su mascota?</Label>
                <Textarea
                  id="cognitiveAbilities"
                  value={formData.cognitiveAbilities || ""}
                  onChange={(e) => updateFormData("cognitiveAbilities", e.target.value)}
                  placeholder="Por ejemplo: 'Aprende rápido', 'Resuelve problemas', 'Se acuerda de las cosas', 'Se adapta a situaciones nuevas'"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Salud */}
        <TabsContent value="health" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Salud de su mascota</CardTitle>
              <CardDescription>
                La salud puede influir en el comportamiento, cuéntenos sobre la salud de su mascota
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="medicalHistory">¿Ha tenido problemas de salud? *</Label>
                <Textarea
                  id="medicalHistory"
                  value={formData.medicalHistory || ""}
                  onChange={(e) => updateFormData("medicalHistory", e.target.value)}
                  placeholder="Cuéntenos sobre enfermedades, cirugías, accidentes, problemas de salud que haya tenido. Si no ha tenido ninguno, escriba 'Ninguno'"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentMedications">¿Toma algún medicamento actualmente?</Label>
                <Textarea
                  id="currentMedications"
                  value={formData.currentMedications || ""}
                  onChange={(e) => updateFormData("currentMedications", e.target.value)}
                  placeholder="Liste los medicamentos, vitaminas o suplementos que toma actualmente. Si no toma nada, escriba 'Ninguno'"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="neurologicalSigns">
                  ¿Ha notado convulsiones, desorientación o problemas de coordinación?
                </Label>
                <Textarea
                  id="neurologicalSigns"
                  value={formData.neurologicalSigns || ""}
                  onChange={(e) => updateFormData("neurologicalSigns", e.target.value)}
                  placeholder="Por ejemplo: convulsiones, se pierde en casa, camina raro, problemas de vista o audición. Si no ha notado nada, escriba 'Ninguno'"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="painAssessment">¿Cree que su mascota siente dolor o molestias?</Label>
                <Textarea
                  id="painAssessment"
                  value={formData.painAssessment || ""}
                  onChange={(e) => updateFormData("painAssessment", e.target.value)}
                  placeholder="¿Ha notado que cojea, se queja, no quiere moverse, cambia su postura? Si no ha notado nada, escriba 'No'"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reproductiveStatus">
                  Si no está castrado/esterilizado, ¿ha notado cambios de comportamiento relacionados?
                </Label>
                <Textarea
                  id="reproductiveStatus"
                  value={formData.reproductiveStatus || ""}
                  onChange={(e) => updateFormData("reproductiveStatus", e.target.value)}
                  placeholder="Por ejemplo: cambios durante el celo, comportamientos de monta, marcaje territorial"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="veterinaryExams">¿Cuándo fue la última vez que lo revisó el veterinario?</Label>
                <Textarea
                  id="veterinaryExams"
                  value={formData.veterinaryExams || ""}
                  onChange={(e) => updateFormData("veterinaryExams", e.target.value)}
                  placeholder="Fecha aproximada de la última consulta y si le hicieron análisis o estudios"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Su Hogar y Rutina */}
        <TabsContent value="environment" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Su hogar y rutina diaria</CardTitle>
              <CardDescription>El ambiente donde vive su mascota puede influir en su comportamiento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="physicalEnvironment">Describa su hogar *</Label>
                <Textarea
                  id="physicalEnvironment"
                  value={formData.physicalEnvironment || ""}
                  onChange={(e) => updateFormData("physicalEnvironment", e.target.value)}
                  placeholder="Por ejemplo: 'Casa con jardín', 'Apartamento pequeño', 'Casa grande', 'Tiene acceso al exterior', etc."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="socialEnvironment">¿Quién vive en su casa?</Label>
                <Textarea
                  id="socialEnvironment"
                  value={formData.socialEnvironment || ""}
                  onChange={(e) => updateFormData("socialEnvironment", e.target.value)}
                  placeholder="Cuéntenos sobre los miembros de la familia, otros animales, visitantes frecuentes"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dailyRoutine">¿Cuál es la rutina diaria de su mascota?</Label>
                <Textarea
                  id="dailyRoutine"
                  value={formData.dailyRoutine || ""}
                  onChange={(e) => updateFormData("dailyRoutine", e.target.value)}
                  placeholder="Horarios de comida, paseos, tiempo solo en casa, actividades que hace durante el día"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exerciseEnrichment">¿Cuánto ejercicio hace su mascota?</Label>
                <Select
                  value={formData.exerciseEnrichment || ""}
                  onValueChange={(value) => updateFormData("exerciseEnrichment", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione la cantidad de ejercicio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="poco">Poco - Menos de 30 minutos al día</SelectItem>
                    <SelectItem value="normal">Normal - Entre 30 y 60 minutos al día</SelectItem>
                    <SelectItem value="mucho">Mucho - Más de 60 minutos al día</SelectItem>
                    <SelectItem value="excesivo">Demasiado - Ejercicio constante</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>¿Qué cosas estresan a su mascota? (puede marcar varias opciones)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    "Ruidos fuertes (truenos, petardos)",
                    "Cambios en la rutina",
                    "Mudanzas o cambios en casa",
                    "Obras o construcción cerca",
                    "Mucho tráfico o ruido de coches",
                    "Otros animales en el área",
                    "Muchas visitas",
                    "Cambios en la familia",
                    "Poco espacio en casa",
                    "Clima muy caliente o frío",
                    "Peleas o tensión en casa",
                    "Quedarse solo mucho tiempo",
                  ].map((stressor) => (
                    <div key={stressor} className="flex items-center space-x-2">
                      <Checkbox
                        id={stressor}
                        checked={(formData.environmentalStressors || []).includes(stressor)}
                        onCheckedChange={(checked) =>
                          updateArrayField("environmentalStressors", stressor, checked as boolean)
                        }
                      />
                      <Label htmlFor={stressor}>{stressor}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="managementPractices">¿Cómo manejan el comportamiento de su mascota en casa?</Label>
                <Textarea
                  id="managementPractices"
                  value={formData.managementPractices || ""}
                  onChange={(e) => updateFormData("managementPractices", e.target.value)}
                  placeholder="Por ejemplo: 'Le damos premios cuando se porta bien', 'Lo regañamos cuando hace algo malo', 'Todos en casa aplicamos las mismas reglas'"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calidad de Vida */}
        <TabsContent value="functioning" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Calidad de vida</CardTitle>
              <CardDescription>
                Ayúdenos a entender cómo afecta el comportamiento de su mascota a su vida diaria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>¿Cómo considera que está su mascota en general?</Label>
                <RadioGroup
                  value={formData.animalWelfare || ""}
                  onValueChange={(value) => updateFormData("animalWelfare", value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="excelente" id="welfare-excelente" />
                    <Label htmlFor="welfare-excelente">Excelente - Se ve feliz y relajada</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bueno" id="welfare-bueno" />
                    <Label htmlFor="welfare-bueno">Bien - A veces se estresa pero en general está bien</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="regular" id="welfare-regular" />
                    <Label htmlFor="welfare-regular">Regular - Se estresa con frecuencia</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="deficiente" id="welfare-deficiente" />
                    <Label htmlFor="welfare-deficiente">Mal - Se ve estresada o sufre mucho</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>¿Qué tan buena mascota considera que es?</Label>
                <RadioGroup
                  value={formData.petFunction || ""}
                  onValueChange={(value) => updateFormData("petFunction", value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="excelente" id="pet-excelente" />
                    <Label htmlFor="pet-excelente">Excelente - Es exactamente lo que esperaba</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bueno" id="pet-bueno" />
                    <Label htmlFor="pet-bueno">Buena - Cumple la mayoría de mis expectativas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="regular" id="pet-regular" />
                    <Label htmlFor="pet-regular">Regular - Algunas cosas están bien, otras no</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="deficiente" id="pet-deficiente" />
                    <Label htmlFor="pet-deficiente">Mala - No es lo que esperaba</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>¿Cómo afecta a los vecinos o la comunidad?</Label>
                <RadioGroup
                  value={formData.socialImpact || ""}
                  onValueChange={(value) => updateFormData("socialImpact", value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="positivo" id="impact-positivo" />
                    <Label htmlFor="impact-positivo">Positivo - A todos les gusta</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="neutro" id="impact-neutro" />
                    <Label htmlFor="impact-neutro">Neutro - No causa problemas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="negativo-leve" id="impact-negativo-leve" />
                    <Label htmlFor="impact-negativo-leve">Algo negativo - A veces molesta a otros</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="negativo-severo" id="impact-negativo-severo" />
                    <Label htmlFor="impact-negativo-severo">Muy negativo - Causa muchos problemas a otros</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="familyImpact">¿Cómo afecta el comportamiento de su mascota a su vida familiar?</Label>
                <Textarea
                  id="familyImpact"
                  value={formData.familyImpact || ""}
                  onChange={(e) => updateFormData("familyImpact", e.target.value)}
                  placeholder="Por ejemplo: 'No podemos tener visitas', 'Los niños tienen miedo', 'No podemos salir de vacaciones', etc."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="overallFunctioning">
                  En general, ¿cómo calificaría la calidad de vida con su mascota? *
                </Label>
                <RadioGroup
                  value={formData.overallFunctioning || ""}
                  onValueChange={(value) => updateFormData("overallFunctioning", value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="excelente" id="func-excelente" />
                    <Label htmlFor="func-excelente">Excelente - Muy felices juntos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bueno" id="func-bueno" />
                    <Label htmlFor="func-bueno">Buena - Algunos problemas menores</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="regular" id="func-regular" />
                    <Label htmlFor="func-regular">Regular - Problemas que afectan nuestra vida</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="deficiente" id="func-deficiente" />
                    <Label htmlFor="func-deficiente">Mala - Muchos problemas serios</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="critico" id="func-critico" />
                    <Label htmlFor="func-critico">Muy mala - Estoy considerando deshacerme de mi mascota</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatmentGoals">¿Qué le gustaría lograr para mejorar la situación?</Label>
                <Textarea
                  id="treatmentGoals"
                  value={formData.treatmentGoals || ""}
                  onChange={(e) => updateFormData("treatmentGoals", e.target.value)}
                  placeholder="Por ejemplo: 'Que deje de ladrar tanto', 'Que se lleve bien con otros perros', 'Que no destruya cosas en casa'"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prognosisFactors">¿Qué tan dispuesto está a trabajar en el problema?</Label>
                <Textarea
                  id="prognosisFactors"
                  value={formData.prognosisFactors || ""}
                  onChange={(e) => updateFormData("prognosisFactors", e.target.value)}
                  placeholder="Por ejemplo: 'Estoy muy motivado', 'Tengo tiempo limitado', 'Toda la familia está dispuesta a ayudar'"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            const currentIndex = tabs.findIndex((tab) => tab.id === currentTab)
            if (currentIndex > 0) {
              setCurrentTab(tabs[currentIndex - 1].id)
            }
          }}
          disabled={currentTab === tabs[0].id}
        >
          Anterior
        </Button>

        {currentTab === tabs[tabs.length - 1].id ? (
          <Button
            onClick={handleComplete}
            disabled={!isComplete()}
            className="bg-secondary text-black hover:bg-secondary/90"
          >
            Continuar al Cuestionario
          </Button>
        ) : (
          <Button
            onClick={() => {
              const currentIndex = tabs.findIndex((tab) => tab.id === currentTab)
              if (currentIndex < tabs.length - 1) {
                setCurrentTab(tabs[currentIndex + 1].id)
              }
            }}
          >
            Siguiente
          </Button>
        )}
      </div>
    </div>
  )
}

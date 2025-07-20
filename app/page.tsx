import { Questionnaire } from "@/components/questionnaire"

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-secondary">
          Cuestionario de Evaluación Conductual Canina (C-BARQ)
        </h1>
        <p className="text-muted-foreground mb-8 text-center">
          Evalúe el comportamiento de su perro en una escala de 0 a 4, donde 0 significa "nunca" y 4 significa
          "siempre".
        </p>
        <Questionnaire />
      </div>
    </main>
  )
}

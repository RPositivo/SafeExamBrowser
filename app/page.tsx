import { Questionnaire } from "@/components/questionnaire"

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-6">
          <img src="https://i.imgur.com/zZvTlL1.png" alt="Logo" className="mx-auto mb-4" width={250} height={250} />
          <h1 className="text-3xl font-bold text-secondary mb-2">
            Cuestionario de Evaluación Conductual Canina
            <br />
            (C-BARQ)
          </h1>
          <p className="text-sm text-muted-foreground mb-4 italic">
            Traducción libre de Pablo Herrera del instrumento de la Universidad de Pennsylvania
            <br />
            Propiedad intelectual de James Serpell
          </p>
        </div>
        <p className="text-muted-foreground mb-8 text-center">
          Evalúe el comportamiento de su perro en una escala de 0 a 4, donde 0 significa "nunca" y 4 significa
          "siempre".
        </p>
        <Questionnaire />
      </div>
    </main>
  )
}

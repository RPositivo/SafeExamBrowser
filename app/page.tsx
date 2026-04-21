import { Questionnaire } from "@/components/questionnaire"

export default function Home() {
  return (
    <main className="min-h-screen bg-background px-4 py-5 sm:px-5 sm:py-6 md:px-8 md:py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 md:gap-8">
        <section className="overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-card via-card to-primary/80 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-5 px-4 py-6 sm:px-6 sm:py-7 md:flex-row md:items-center md:justify-between md:px-8 md:py-8">
            <div className="order-2 text-left md:order-1 md:max-w-2xl">
              <p className="mb-3 inline-flex w-fit rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-secondary">
                Evaluacion conductual
              </p>
              <h1 className="text-3xl font-bold leading-tight text-secondary sm:text-4xl md:text-5xl">
                Cuestionario de Evaluacion Conductual Canina
                <span className="mt-2 block text-foreground">(C-BARQ)</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                Responde primero desde el movil: menos ruido visual, pasos mas claros y una lectura mas comoda para
                completar la anamnesis y el cuestionario sin perder contexto.
              </p>
              <p className="mt-4 text-xs italic text-muted-foreground sm:text-sm">
                Traduccion libre de Pablo Herrera del instrumento de la Universidad de Pennsylvania. Propiedad
                intelectual de James Serpell.
              </p>
            </div>

            <div className="order-1 flex justify-center md:order-2 md:justify-end">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                <img
                  src="https://i.imgur.com/zZvTlL1.png"
                  alt="Logo"
                  className="h-auto w-28 sm:w-32 md:w-44"
                  width={250}
                  height={250}
                />
              </div>
            </div>
          </div>
        </section>

        <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
          Evalua el comportamiento de su perro usando una escala de 0 a 4, donde 0 significa "nunca" y 4 significa
          "siempre". Si la conducta no se ha observado, puede marcar "N/O".
        </p>

        <Questionnaire />
      </div>
    </main>
  )
}

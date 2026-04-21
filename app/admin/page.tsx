import { getAllQuestionnaireIds, getQuestionnaire, getQuestionnaireStats, isKvConfigured } from "@/lib/store-data"

interface AdminPageProps {
  searchParams?: {
    id?: string
  }
}

export const dynamic = "force-dynamic"

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const selectedId = searchParams?.id?.trim()
  const kvEnabled = await isKvConfigured()
  const statsResult = await getQuestionnaireStats()
  const idsResult = await getAllQuestionnaireIds()
  const selectedResult = selectedId ? await getQuestionnaire(selectedId) : null

  const stats = statsResult.success ? statsResult.stats : null
  const ids = idsResult.success ? idsResult.ids : []
  const selectedData = selectedResult?.success ? selectedResult.data : null

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="rounded-3xl border border-white/10 bg-card p-5 sm:p-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Administracion</p>
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Base de datos de cuestionarios</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            Esta vista lee directamente desde KV y muestra los registros recientes. Tambien puede abrir un
            cuestionario puntual agregando `?id=...` a la URL.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-card p-4">
            <p className="text-sm text-muted-foreground">Estado de KV</p>
            <p className="mt-2 text-lg font-semibold">{kvEnabled ? "Configurado" : "No configurado"}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-card p-4">
            <p className="text-sm text-muted-foreground">Total de cuestionarios</p>
            <p className="mt-2 text-lg font-semibold">{stats?.totalCount ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-card p-4">
            <p className="text-sm text-muted-foreground">Registros recientes cargados</p>
            <p className="mt-2 text-lg font-semibold">{stats?.recentCount ?? 0}</p>
          </div>
        </section>

        {!kvEnabled ? (
          <section className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-6 text-amber-50">
            KV no esta activo en este entorno. Cree un archivo `.env.local` a partir de `.env.example` y complete
            `KV_REST_API_URL` y `KV_REST_API_TOKEN`.
          </section>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
          <div className="rounded-2xl border border-white/10 bg-card p-4 sm:p-5">
            <h2 className="text-xl font-semibold">IDs disponibles</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Use `/admin?id=EL_ID` para abrir un cuestionario especifico.
            </p>

            <div className="mt-4 space-y-3">
              {ids.length > 0 ? (
                ids
                  .slice()
                  .reverse()
                  .map((id) => (
                    <a
                      key={id}
                      href={`/admin?id=${encodeURIComponent(id)}`}
                      className="block rounded-xl border border-white/10 bg-background/30 px-3 py-3 text-sm transition-colors hover:bg-background/50"
                    >
                      <span className="block break-all font-medium text-foreground">{id}</span>
                    </a>
                  ))
              ) : (
                <p className="rounded-xl border border-dashed border-white/10 px-3 py-4 text-sm text-muted-foreground">
                  No hay IDs cargados todavia.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-card p-4 sm:p-5">
            <h2 className="text-xl font-semibold">Detalle del cuestionario</h2>
            {selectedId ? (
              <p className="mt-2 break-all text-sm text-muted-foreground">ID seleccionado: {selectedId}</p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Seleccione un ID de la lista o abra `/admin?id=...`.
              </p>
            )}

            <div className="mt-4">
              {selectedId && selectedData ? (
                <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-background/40 p-4 text-xs leading-6 text-foreground">
                  {JSON.stringify(selectedData, null, 2)}
                </pre>
              ) : selectedId && selectedResult && !selectedResult.success ? (
                <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">
                  {selectedResult.message}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-muted-foreground">
                  No hay un cuestionario seleccionado.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-card p-4 sm:p-5">
          <h2 className="text-xl font-semibold">Ultimos registros</h2>
          <div className="mt-4 space-y-3">
            {stats?.recentData?.length ? (
              stats.recentData
                .slice()
                .reverse()
                .map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-background/30 p-4">
                    <p className="break-all text-sm font-semibold">{item.id}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.timestamp}</p>
                    <p className="mt-3 text-sm">
                      <strong>Perro:</strong> {item.petName}
                    </p>
                    <p className="text-sm">
                      <strong>Raza:</strong> {item.breed}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">{item.mainProblem}</p>
                  </div>
                ))
            ) : (
              <p className="text-sm text-muted-foreground">No hay registros recientes para mostrar.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

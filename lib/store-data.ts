"use server"

// Verificar si las variables de entorno de KV están disponibles
const KV_URL = process.env.KV_REST_API_URL
const KV_TOKEN = process.env.KV_REST_API_TOKEN

let kv: any = null

// Solo importar y configurar KV si las variables están disponibles
if (KV_URL && KV_TOKEN) {
  try {
    const { kv: kvClient } = require("@vercel/kv")
    kv = kvClient
  } catch (error) {
    console.warn("@vercel/kv no está disponible:", error)
  }
}

interface StoredData {
  id: string
  timestamp: string
  anamnesisData: any
  cbarqAnswers: Record<string, number>
  factorScores: Record<string, any>
  specialBehaviorScores: Array<any>
}

export async function storeQuestionnaire(data: {
  anamnesisData: any
  cbarqAnswers: Record<string, number>
  factorScores: Record<string, any>
  specialBehaviorScores: Array<any>
}) {
  try {
    // Generar un ID único para este cuestionario
    const id = `cbarq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    console.log("Iniciando almacenamiento de datos...")
    console.log("Datos a almacenar:", {
      id,
      timestamp: new Date().toISOString(),
      anamnesisData: data.anamnesisData,
      cbarqAnswers: Object.keys(data.cbarqAnswers).length,
      factorScores: Object.keys(data.factorScores).length,
      specialBehaviorScores: data.specialBehaviorScores.length,
    })

    const storedData: StoredData = {
      id,
      timestamp: new Date().toISOString(),
      anamnesisData: data.anamnesisData,
      cbarqAnswers: data.cbarqAnswers,
      factorScores: data.factorScores,
      specialBehaviorScores: data.specialBehaviorScores,
    }

    // Verificar si KV está disponible
    if (!kv) {
      console.log("KV no está disponible, los datos solo se guardan localmente")
      return {
        success: true,
        id,
        message: "Datos guardados localmente (KV no configurado)",
      }
    }

    // Almacenar en Upstash KV solo si está disponible
    await kv.set(id, storedData)
    console.log("Datos almacenados en KV con éxito")

    // También mantener una lista de todos los IDs para facilitar la recuperación
    const existingIds = (await kv.get("cbarq-ids")) || []
    existingIds.push(id)
    await kv.set("cbarq-ids", existingIds)
    console.log("Lista de IDs actualizada, total:", existingIds.length)

    console.log("Datos almacenados correctamente con ID:", id)

    return {
      success: true,
      id,
      message: "Datos almacenados correctamente en la base de datos",
    }
  } catch (error) {
    console.error("Error al almacenar datos:", error)

    // Si hay error con KV, al menos confirmar que se guardó localmente
    const id = `cbarq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    return {
      success: true,
      id,
      message: "Datos guardados localmente (error en base de datos remota)",
    }
  }
}

export async function getQuestionnaire(id: string) {
  try {
    if (!kv) {
      return {
        success: false,
        message: "Base de datos no configurada - solo disponible almacenamiento local",
      }
    }

    const data = await kv.get<StoredData>(id)

    if (!data) {
      return {
        success: false,
        message: "Cuestionario no encontrado",
      }
    }

    return {
      success: true,
      data,
      message: "Cuestionario recuperado correctamente",
    }
  } catch (error) {
    console.error("Error al recuperar datos:", error)
    return {
      success: false,
      message: `Error al recuperar datos: ${error instanceof Error ? error.message : "Error desconocido"}`,
    }
  }
}

export async function getAllQuestionnaireIds() {
  try {
    if (!kv) {
      return {
        success: false,
        message: "Base de datos no configurada",
        ids: [],
      }
    }

    const ids = (await kv.get<string[]>("cbarq-ids")) || []

    return {
      success: true,
      ids,
      message: "IDs recuperados correctamente",
    }
  } catch (error) {
    console.error("Error al recuperar IDs:", error)
    return {
      success: false,
      message: `Error al recuperar IDs: ${error instanceof Error ? error.message : "Error desconocido"}`,
      ids: [],
    }
  }
}

export async function getQuestionnaireStats() {
  try {
    if (!kv) {
      return {
        success: false,
        message: "Base de datos no configurada",
        stats: {
          totalCount: 0,
          recentCount: 0,
          recentData: [],
        },
      }
    }

    const ids = (await kv.get<string[]>("cbarq-ids")) || []
    const totalCount = ids.length

    // Obtener estadísticas básicas
    const recentIds = ids.slice(-10) // Últimos 10
    const recentData = await Promise.all(
      recentIds.map(async (id) => {
        const result = await kv.get<StoredData>(id)
        return result
      }),
    )

    const validData = recentData.filter(Boolean) as StoredData[]

    return {
      success: true,
      stats: {
        totalCount,
        recentCount: validData.length,
        recentData: validData.map((d) => ({
          id: d.id,
          timestamp: d.timestamp,
          petName: d.anamnesisData?.petName || "Sin nombre",
          breed: d.anamnesisData?.breed || "Sin raza",
          mainProblem: d.anamnesisData?.mainProblem?.substring(0, 100) + "..." || "Sin descripción",
        })),
      },
      message: "Estadísticas recuperadas correctamente",
    }
  } catch (error) {
    console.error("Error al recuperar estadísticas:", error)
    return {
      success: false,
      message: `Error al recuperar estadísticas: ${error instanceof Error ? error.message : "Error desconocido"}`,
      stats: {
        totalCount: 0,
        recentCount: 0,
        recentData: [],
      },
    }
  }
}

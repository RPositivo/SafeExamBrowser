"use server"

import { kv } from "@vercel/kv"

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

    const storedData: StoredData = {
      id,
      timestamp: new Date().toISOString(),
      anamnesisData: data.anamnesisData,
      cbarqAnswers: data.cbarqAnswers,
      factorScores: data.factorScores,
      specialBehaviorScores: data.specialBehaviorScores,
    }

    // Almacenar en Upstash KV
    await kv.set(id, storedData)

    // También mantener una lista de todos los IDs para facilitar la recuperación
    const existingIds = (await kv.get<string[]>("cbarq-ids")) || []
    existingIds.push(id)
    await kv.set("cbarq-ids", existingIds)

    console.log("Datos almacenados correctamente con ID:", id)

    return {
      success: true,
      id,
      message: "Datos almacenados correctamente",
    }
  } catch (error) {
    console.error("Error al almacenar datos:", error)
    return {
      success: false,
      message: `Error al almacenar datos: ${error instanceof Error ? error.message : "Error desconocido"}`,
    }
  }
}

export async function getQuestionnaire(id: string) {
  try {
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
    }
  }
}

export async function getQuestionnaireStats() {
  try {
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
    }
  }
}

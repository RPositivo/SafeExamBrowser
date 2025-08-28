"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { sendEmail } from "@/lib/send-email"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Info } from "lucide-react"
import { storeQuestionnaire } from "@/lib/store-data"

interface EmailFormProps {
  answers: Record<string, number>
  anamnesisData?: any
}

export function EmailForm({ answers, anamnesisData }: EmailFormProps) {
  const [dogName, setDogName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [showApiKeyInfo, setShowApiKeyInfo] = useState(false)

  // Dirección de correo fija actualizada
  const fixedEmail = "contacto@r-positivo.com"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    try {
      // Primero almacenar los datos
      const storeResult = await storeQuestionnaire({
        anamnesisData,
        cbarqAnswers: answers,
        factorScores: {}, // Se calculará en send-email
        specialBehaviorScores: [], // Se calculará en send-email
      })

      console.log("Datos almacenados:", storeResult)

      // Luego enviar el email
      const response = await sendEmail({
        email: fixedEmail,
        dogName: anamnesisData?.petName || dogName || "Mi Perro",
        answers,
        anamnesisData: {
          ...anamnesisData,
          storageId: storeResult.success ? storeResult.id : undefined,
        },
      })

      console.log("Respuesta recibida:", response)
      setResult(response)

      if (!response.success && response.message.includes("API key")) {
        setShowApiKeyInfo(true)
      }
    } catch (error) {
      console.error("Error en el formulario:", error)
      setResult({
        success: false,
        message: `Error al procesar: ${error instanceof Error ? error.message : "Error desconocido"}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const displayName = anamnesisData?.petName || dogName || "Mi Perro"

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="dogName">Nombre de su perro</Label>
          <Input
            id="dogName"
            type="text"
            placeholder="Nombre de su perro"
            value={dogName}
            onChange={(e) => setDogName(e.target.value)}
            className="bg-primary/20 border-primary/30 text-foreground"
          />
        </div>
        <p className="text-sm text-muted-foreground">Los resultados se enviarán automáticamente a {fixedEmail}</p>
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
            </>
          ) : (
            "Enviar resultados"
          )}
        </Button>
      </form>

      {result && (
        <Alert variant={result.success ? "default" : "destructive"}>
          {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertTitle>{result.success ? "Éxito" : "Error"}</AlertTitle>
          <AlertDescription>{result.message.replace("mascota", "perro")}</AlertDescription>
        </Alert>
      )}

      {showApiKeyInfo && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Configuración necesaria</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              Para enviar correos electrónicos, necesita configurar una API key válida de Resend en las variables de
              entorno.
            </p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                Regístrese en{" "}
                <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="underline">
                  Resend.com
                </a>
              </li>
              <li>Obtenga una API key desde el panel de control</li>
              <li>Configure la variable de entorno RESEND_API_KEY con su clave</li>
            </ol>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

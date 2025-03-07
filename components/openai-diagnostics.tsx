"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from "lucide-react"

export default function OpenAIDiagnostics() {
  const [diagnosticData, setDiagnosticData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runDiagnostics = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/check-openai-config")

      if (!response.ok) {
        throw new Error(`Error en la respuesta: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setDiagnosticData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Diagnóstico de OpenAI</h3>
          <Button variant="outline" size="sm" onClick={runDiagnostics} disabled={isLoading}>
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {isLoading ? "Verificando..." : "Verificar"}
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 rounded-lg border border-red-200 mb-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Error al ejecutar diagnóstico</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {diagnosticData && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-medium mb-2">Entorno</h4>
                <p className="text-sm">
                  Modo: <span className="font-mono">{diagnosticData.environment}</span>
                </p>
                <p className="text-sm">
                  Plataforma: <span className="font-mono">{diagnosticData.serverInfo?.platform}</span>
                </p>
                <p className="text-sm">
                  Node.js: <span className="font-mono">{diagnosticData.serverInfo?.nodeVersion}</span>
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-medium mb-2">API Key de OpenAI</h4>
                <div className="flex items-center mb-1">
                  {diagnosticData.openai?.keyConfigured ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500 mr-2" />
                  )}
                  <p className="text-sm">
                    {diagnosticData.openai?.keyConfigured
                      ? "API Key configurada correctamente"
                      : "API Key no configurada o inválida"}
                  </p>
                </div>
                {diagnosticData.openai?.keyPrefix && (
                  <p className="text-sm">
                    Prefijo: <span className="font-mono">{diagnosticData.openai.keyPrefix}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border">
              <h4 className="font-medium mb-2">Acceso a la API de OpenAI</h4>
              <div className="flex items-center mb-2">
                {diagnosticData.openai?.apiAccessible ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 mr-2" />
                )}
                <p className="text-sm">
                  {diagnosticData.openai?.apiAccessible
                    ? "API de OpenAI accesible"
                    : "No se puede acceder a la API de OpenAI"}
                </p>
              </div>

              {diagnosticData.openai?.apiResponse && (
                <div className="mt-2 p-3 bg-gray-100 rounded text-sm font-mono text-xs overflow-x-auto">
                  {JSON.stringify(diagnosticData.openai.apiResponse, null, 2)}
                </div>
              )}
            </div>

            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="font-medium mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                Recomendaciones
              </h4>
              <ul className="space-y-2 text-sm text-amber-800">
                {!diagnosticData.openai?.keyConfigured && (
                  <li>• Configura la variable de entorno OPENAI_API_KEY con una API key válida de OpenAI</li>
                )}
                {diagnosticData.openai?.keyConfigured && !diagnosticData.openai?.apiAccessible && (
                  <li>
                    • Tu API key parece tener el formato correcto pero no puede acceder a la API. Verifica que la key
                    sea válida y tenga saldo disponible.
                  </li>
                )}
                {diagnosticData.environment === "development" && (
                  <li>
                    • Estás en modo desarrollo. Considera usar una variable .env.local para configurar tu API key.
                  </li>
                )}
                <li>• Asegúrate de que la API key tenga permisos para generar imágenes (DALL-E)</li>
                <li>• Verifica que tu cuenta de OpenAI tenga saldo disponible</li>
              </ul>
            </div>
          </div>
        )}

        {isLoading && !diagnosticData && (
          <div className="flex justify-center items-center p-8">
            <RefreshCw className="h-8 w-8 animate-spin text-amber-500" />
            <span className="ml-2">Ejecutando diagnóstico...</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


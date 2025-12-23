"use client"

import type React from "react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Search, GraduationCap, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface StudentData {
  cpf: string
  campus: string
  ra: string
  nome_aluno: string
  nome_disciplina: string
  horario: string
  local: string
}

export default function ConsultaAcademica() {
  const [cpf, setCpf] = useState("")
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // ===================== CPF =====================
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    }
    return value
  }

  const removeCPFMask = (value: string) => value.replace(/\D/g, "")

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value))
  }

  // ===================== API =====================
  const searchStudent = async () => {
    setLoading(true)
    setError("")
    setStudentData(null)

    try {
      const response = await fetch( `${process.env.NEXT_PUBLIC_API_URL}/consulta`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          
          cpf: removeCPFMask(cpf),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Erro ao consultar CPF")
        return
      }

      setStudentData(data)

    } catch (err) {
      console.error(err)
      setError("Erro ao conectar com o servidor.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (removeCPFMask(cpf).length !== 11) {
      setError("Por favor, digite um CPF válido.")
      return
    }

    searchStudent()
  }

  // ===================== UI =====================
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-2xl bg-primary p-4">
                <GraduationCap className="h-10 w-10 text-primary-foreground" />
              </div>
            </div>
            <h1 className="mb-2 text-4xl font-bold">Consulta Acadêmica</h1>
            <p className="text-muted-foreground text-lg">
              Digite seu CPF para visualizar suas informações
            </p>
          </div>

          {/* Form */}
          <Card className="mb-6 shadow-lg">
            <CardHeader>
              <CardTitle>Buscar Informações</CardTitle>
              <CardDescription>
                Informe o CPF cadastrado para consultar seus dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cpf"
                      type="text"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={handleCPFChange}
                      maxLength={14}
                    />
                    <Button type="submit" disabled={loading} className="gap-2">
                      <Search className="h-4 w-4" />
                      {loading ? "Buscando..." : "Buscar"}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Error */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Result */}
          {studentData && (
            <Card className="shadow-lg">
              <CardHeader className="bg-primary text-primary-foreground">
                <CardTitle className="text-2xl">Dados do Aluno</CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Nome</Label>
                  <p className="font-semibold">{studentData.nome_aluno}</p>
                </div>

                <div>
                  <Label>CPF</Label>
                  <p className="font-mono">{studentData.cpf}</p>
                </div>

                <div>
                  <Label>RA</Label>
                  <p>{studentData.ra}</p>
                </div>

                <div>
                  <Label>Campus</Label>
                  <p>{studentData.campus}</p>
                </div>

                <div className="md:col-span-2">
                  <Label>Disciplina</Label>
                  <p>{studentData.nome_disciplina}</p>
                </div>

                <div>
                  <Label>Horário</Label>
                  <p>{studentData.horario}</p>
                </div>

                <div>
                  <Label>Local</Label>
                  <p>{studentData.local}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

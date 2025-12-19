"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setCpf(formatted)
  }

  const removeCPFMask = (cpf: string) => {
    return cpf.replace(/\D/g, "")
  }

  const searchStudent = async () => {
    setLoading(true)
    setError("")
    setStudentData(null)

    try {
      const csvUrl =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vQpj4E2zV8skZDC5hsMR36SnHtJVEtayD8r7FOOiYL27EKlhmHPnmvcDkQ7M0WUF6lPxgims0OAylNf/pub?output=csv"

      console.log("[v0] Buscando dados do CSV...")
      const response = await fetch(csvUrl)
      const csvText = await response.text()

      console.log("[v0] CSV recebido (primeiras 500 chars):", csvText.substring(0, 500))

      // Parse CSV - Detectar delimitador automaticamente
      const lines = csvText.split("\n").filter((line) => line.trim())
      console.log("[v0] Total de linhas:", lines.length)
      console.log("[v0] Primeira linha (header):", lines[0])

      const firstLine = lines[0]
      const delimiter = firstLine.includes("\t") ? "\t" : ","
      console.log("[v0] Delimitador detectado:", delimiter === "\t" ? "TAB" : "VÍRGULA")

      const headers = firstLine.split(delimiter).map((h) => h.trim())
      console.log("[v0] Headers:", headers)

      const cpfToSearch = removeCPFMask(cpf)
      console.log("[v0] CPF procurado (sem máscara):", cpfToSearch)

      // Find student data
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(delimiter).map((v) => v.trim())
        const rowCPF = removeCPFMask(values[0] || "")

        console.log(`[v0] Linha ${i}: CPF = "${rowCPF}", valores:`, values)

        if (rowCPF === cpfToSearch) {
          console.log("[v0] CPF encontrado!")
          const data: StudentData = {
            cpf: values[0] || "",
            campus: values[1] || "",
            ra: values[2] || "",
            nome_aluno: values[3] || "",
            nome_disciplina: values[4] || "",
            horario: values[5] || "",
            local: values[6] || "",
          }
          setStudentData(data)
          setLoading(false)
          return
        }
      }

      console.log("[v0] CPF não encontrado após verificar todas as linhas")
      setError("CPF não encontrado. Verifique e tente novamente.")
    } catch (err) {
      console.error("[v0] Erro ao buscar dados:", err)
      setError("Erro ao buscar dados. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (removeCPFMask(cpf).length === 11) {
      searchStudent()
    } else {
      setError("Por favor, digite um CPF válido.")
    }
  }

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
            <h1 className="mb-2 font-sans text-4xl font-bold text-balance">Consulta Acadêmica</h1>
            <p className="text-muted-foreground text-lg">Digite seu CPF para visualizar suas informações</p>
          </div>

          {/* Search Form */}
          <Card className="mb-6 shadow-lg">
            <CardHeader>
              <CardTitle>Buscar Informações</CardTitle>
              <CardDescription>Informe o CPF cadastrado para consultar seus dados</CardDescription>
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
                      className="flex-1"
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

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Student Data */}
          {studentData && (
            <Card className="shadow-lg">
              <CardHeader className="bg-primary text-primary-foreground">
                <CardTitle className="text-2xl">Dados do Aluno</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-sm">Nome</Label>
                    <p className="font-semibold text-lg">{studentData.nome_aluno}</p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-sm">CPF</Label>
                    <p className="font-mono">{studentData.cpf}</p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-sm">RA</Label>
                    <p className="font-mono">{studentData.ra || "Não informado"}</p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-sm">Campus</Label>
                    <p className="font-semibold">{studentData.campus}</p>
                  </div>

                  <div className="col-span-2 space-y-1">
                    <Label className="text-muted-foreground text-sm">Disciplina</Label>
                    <p className="font-semibold text-lg">{studentData.nome_disciplina}</p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-sm">Horário</Label>
                    <p className="font-mono">{studentData.horario}</p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-sm">Local</Label>
                    <p className="font-semibold">{studentData.local}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!studentData && !error && !loading && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Search className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhuma busca realizada. Digite um CPF acima para começar.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

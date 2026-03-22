'use client'

import { RegistroChecklist, RespostaItem } from './types'

const STORAGE_KEY = 'secpolicy_hama_registros'
const RASCUNHO_KEY = 'secpolicy_hama_rascunho'

export function getRegistros(): RegistroChecklist[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function salvarRegistro(registro: RegistroChecklist): void {
  const registros = getRegistros()
  const idx = registros.findIndex(r => r.id === registro.id)
  if (idx >= 0) {
    registros[idx] = registro
  } else {
    registros.unshift(registro)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(registros))
}

export function getRegistroPorId(id: string): RegistroChecklist | null {
  return getRegistros().find(r => r.id === id) ?? null
}

export function getRascunho(): Partial<RegistroChecklist> | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(RASCUNHO_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function salvarRascunho(dados: Partial<RegistroChecklist>): void {
  localStorage.setItem(RASCUNHO_KEY, JSON.stringify(dados))
}

export function limparRascunho(): void {
  localStorage.removeItem(RASCUNHO_KEY)
}

export function calcularConformidade(respostas: RespostaItem[], totalItens: number): number {
  if (totalItens === 0) return 0
  const conformes = respostas.filter(r => r.conforme).length
  return Math.round((conformes / totalItens) * 100)
}

export function gerarId(): string {
  return `reg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

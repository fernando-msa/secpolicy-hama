import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock firebase module before any imports
vi.mock('@/lib/firebase', () => ({
  firebaseConfig: {
    apiKey: 'test-api-key',
    authDomain: 'test.firebaseapp.com',
    projectId: 'test-project',
    storageBucket: 'test.appspot.com',
    messagingSenderId: '123456',
    appId: '1:123456:web:abc',
    measurementId: '',
  },
  firebaseProjectId: 'test-project',
  firebaseApiKey: 'test-api-key',
}))

import { calcularConformidade, gerarId, getRascunho, salvarRascunho, limparRascunho, MESES } from '@/lib/storage'
import type { RespostaItem } from '@/lib/types'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// Mock fetch for ensureUser
globalThis.fetch = vi.fn()

describe('calcularConformidade', () => {
  it('retorna 0 para array vazio', () => {
    expect(calcularConformidade([], 10)).toBe(0)
  })

  it('retorna 0 quando totalItens é 0', () => {
    expect(calcularConformidade([{ itemId: 'a', conforme: true }], 0)).toBe(0)
  })

  it('retorna 100 quando todos são conformes', () => {
    const respostas: RespostaItem[] = [
      { itemId: 'a', conforme: true },
      { itemId: 'b', conforme: true },
      { itemId: 'c', conforme: true },
    ]
    expect(calcularConformidade(respostas, 3)).toBe(100)
  })

  it('retorna 0 quando nenhum é conforme', () => {
    const respostas: RespostaItem[] = [
      { itemId: 'a', conforme: false },
      { itemId: 'b', conforme: false },
    ]
    expect(calcularConformidade(respostas, 2)).toBe(0)
  })

  it('retorna 50 quando metade é conforme', () => {
    const respostas: RespostaItem[] = [
      { itemId: 'a', conforme: true },
      { itemId: 'b', conforme: false },
    ]
    expect(calcularConformidade(respostas, 2)).toBe(50)
  })

  it('arredonda corretamente', () => {
    const respostas: RespostaItem[] = [
      { itemId: 'a', conforme: true },
      { itemId: 'b', conforme: false },
      { itemId: 'c', conforme: false },
    ]
    expect(calcularConformidade(respostas, 3)).toBe(33)
  })
})

describe('gerarId', () => {
  it('gera IDs com formato policy_timestamp_random', () => {
    const id = gerarId()
    expect(id).toMatch(/^policy_\d+_[a-z0-9]+$/)
  })

  it('gera IDs únicos', () => {
    const ids = new Set(Array.from({ length: 100 }, () => gerarId()))
    expect(ids.size).toBe(100)
  })
})

describe('localStorage rascunho', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('getRascunho retorna null quando vazio', () => {
    expect(getRascunho()).toBeNull()
  })

  it('salvarRascunho e getRascunho funcionam corretamente', () => {
    const dados = { analista: 'João', mes: '05', ano: 2026 }
    salvarRascunho(dados)
    expect(getRascunho()).toEqual(dados)
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'secpolicy_hama_rascunho',
      JSON.stringify(dados),
    )
  })

  it('limparRascunho remove o item do localStorage', () => {
    salvarRascunho({ analista: 'João' })
    limparRascunho()
    expect(getRascunho()).toBeNull()
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('secpolicy_hama_rascunho')
  })

  it('getRascunho retorna null com JSON inválido', () => {
    localStorageMock.getItem.mockReturnValueOnce('invalid-json')
    expect(getRascunho()).toBeNull()
  })
})

describe('MESES', () => {
  it('tem 12 meses', () => {
    expect(MESES).toHaveLength(12)
  })

  it('começa com Janeiro', () => {
    expect(MESES[0]).toBe('Janeiro')
  })

  it('termina com Dezembro', () => {
    expect(MESES[11]).toBe('Dezembro')
  })
})

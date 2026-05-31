import { describe, it, expect, vi, beforeEach } from 'vitest'

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

import type { RegistroChecklist, Categoria } from '@/lib/types'

const {
  mockSave,
  mockSetFontSize,
  mockSetFont,
  mockSetTextColor,
  mockSetDrawColor,
  mockSetFillColor,
  mockRect,
  mockRoundedRect,
  mockCircle,
  mockText,
  mockSplitTextToSize,
  mockSetLineWidth,
  mockLine,
} = vi.hoisted(() => ({
  mockSave: vi.fn(),
  mockSetFontSize: vi.fn(),
  mockSetFont: vi.fn(),
  mockSetTextColor: vi.fn(),
  mockSetDrawColor: vi.fn(),
  mockSetFillColor: vi.fn(),
  mockRect: vi.fn(),
  mockRoundedRect: vi.fn(),
  mockCircle: vi.fn(),
  mockText: vi.fn(),
  mockSplitTextToSize: vi.fn().mockReturnValue(['line1']),
  mockSetLineWidth: vi.fn(),
  mockLine: vi.fn(),
}))

vi.mock('jspdf', () => ({
  jsPDF: class MockJsPDF {
    setFontSize = mockSetFontSize
    setFont = mockSetFont
    setTextColor = mockSetTextColor
    setDrawColor = mockSetDrawColor
    setFillColor = mockSetFillColor
    rect = mockRect
    roundedRect = mockRoundedRect
    circle = mockCircle
    text = mockText
    splitTextToSize = mockSplitTextToSize
    setLineWidth = mockSetLineWidth
    line = mockLine
    save = mockSave
    internal = { pageSize: { width: 210, height: 297 } }
  },
}))

const mockRegistro: RegistroChecklist = {
  id: 'test-id',
  policyId: 'policy_test',
  uid: 'user123',
  version: 1,
  mes: '05',
  ano: 2026,
  dataPreenchimento: '2026-05-31T10:00:00.000Z',
  analista: 'Analista Teste',
  respostas: [
    { itemId: 'infra_1', conforme: true },
    { itemId: 'infra_2', conforme: false },
    { itemId: 'acesso_1', conforme: true },
  ],
  status: 'rascunho',
}

const mockCategorias: Categoria[] = [
  {
    id: 'infra',
    label: 'Infraestrutura',
    descricao: 'Servidores e infraestrutura',
    cor: 'blue',
    items: [
      { id: 'infra_1', texto: 'Item 1', criticidade: 'Alta' },
      { id: 'infra_2', texto: 'Item 2', criticidade: 'Media' },
    ],
  },
  {
    id: 'acesso',
    label: 'Controle de acesso',
    descricao: 'Acessos e permissões',
    cor: 'purple',
    items: [
      { id: 'acesso_1', texto: 'Item 3', criticidade: 'Alta' },
    ],
  },
]

describe('gerarPDF', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gera PDF sem erros com dados válidos', async () => {
    const { gerarPDF } = await import('@/lib/pdf')
    await expect(gerarPDF(mockRegistro, mockCategorias)).resolves.not.toThrow()
  })

  it('chama save com nome correto do arquivo', async () => {
    const { gerarPDF } = await import('@/lib/pdf')
    await gerarPDF(mockRegistro, mockCategorias)
    expect(mockSave).toHaveBeenCalledWith('secpolicy_hama_05_2026.pdf')
  })

  it('renderiza texto do analista', async () => {
    const { gerarPDF } = await import('@/lib/pdf')
    await gerarPDF(mockRegistro, mockCategorias)
    const textCalls = mockText.mock.calls.flat().map(String)
    expect(textCalls.some(t => t.includes('Analista Teste'))).toBe(true)
  })

  it('renderiza score de conformidade', async () => {
    const { gerarPDF } = await import('@/lib/pdf')
    await gerarPDF(mockRegistro, mockCategorias)
    const textCalls = mockText.mock.calls.flat().map(String)
    expect(textCalls.some(t => t.includes('67%'))).toBe(true)
  })
})

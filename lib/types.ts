export type Criticidade = 'Alta' | 'Média' | 'Baixa'
export type CorCategoria = 'blue' | 'purple' | 'teal' | 'red' | 'amber'

export interface ItemChecklist {
  id: string
  texto: string
  criticidade: Criticidade
}

export interface Categoria {
  id: string
  label: string
  descricao: string
  cor: CorCategoria
  items: ItemChecklist[]
}

export interface RespostaItem {
  itemId: string
  conforme: boolean
  observacao?: string
}

export interface RegistroChecklist {
  id: string
  policyId: string
  uid: string
  version: number
  mes: string
  ano: number
  dataPreenchimento: string
  analista: string
  respostas: RespostaItem[]
  status: 'rascunho' | 'enviado' | 'aprovado' | 'ajuste_solicitado'
  observacaoGestao?: string
  alteradoPor?: string
}

export interface AuditLog {
  id: string
  uid: string
  policyId: string
  registroId: string
  action: 'create' | 'update'
  fromVersion: number | null
  toVersion: number
  status: RegistroChecklist['status']
  at: string
}

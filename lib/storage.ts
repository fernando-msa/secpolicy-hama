'use client'

import { RegistroChecklist, RespostaItem } from './types'
import { firebaseApiKey, firebaseProjectId } from './firebase'

const RASCUNHO_KEY = 'secpolicy_hama_rascunho'
const AUTH_KEY = 'secpolicy_hama_auth'

const apiKey = firebaseApiKey
const projectId = firebaseProjectId

interface AuthSession {
  uid: string
  idToken: string
  refreshToken: string
}

function authFromStorage(): AuthSession | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(AUTH_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthSession
  } catch {
    return null
  }
}

function saveAuth(auth: AuthSession) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth))
}

function endpoint(path: string): string {
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}`
}

function toFsValue(value: unknown): Record<string, unknown> {
  if (typeof value === 'string') return { stringValue: value }
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value }
  if (typeof value === 'boolean') return { booleanValue: value }
  if (Array.isArray(value)) return { arrayValue: { values: value.map(v => toFsValue(v)) } }
  if (value && typeof value === 'object') {
    const fields: Record<string, unknown> = {}
    Object.entries(value).forEach(([k, v]) => {
      if (v !== undefined) fields[k] = toFsValue(v)
    })
    return { mapValue: { fields } }
  }
  return { nullValue: null }
}

function fromFsValue(value: any): any {
  if (!value) return null
  if (value.stringValue !== undefined) return value.stringValue
  if (value.integerValue !== undefined) return Number(value.integerValue)
  if (value.doubleValue !== undefined) return Number(value.doubleValue)
  if (value.booleanValue !== undefined) return value.booleanValue
  if (value.arrayValue !== undefined) return (value.arrayValue.values ?? []).map((v: any) => fromFsValue(v))
  if (value.mapValue !== undefined) {
    const out: Record<string, unknown> = {}
    Object.entries(value.mapValue.fields ?? {}).forEach(([k, v]) => {
      out[k] = fromFsValue(v)
    })
    return out
  }
  if (value.timestampValue !== undefined) return value.timestampValue
  return null
}

function parseDoc(doc: any): Record<string, unknown> {
  const parsed: Record<string, unknown> = {}
  Object.entries(doc.fields ?? {}).forEach(([k, v]) => {
    parsed[k] = fromFsValue(v)
  })
  parsed.id = String(doc.name).split('/').pop() ?? ''
  return parsed
}

export async function ensureUser() {
  const cached = authFromStorage()
  if (cached) return { uid: cached.uid, idToken: cached.idToken }

  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ returnSecureToken: true }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message ?? 'Falha ao autenticar usuário anônimo.')

  const auth = {
    uid: data.localId as string,
    idToken: data.idToken as string,
    refreshToken: data.refreshToken as string,
  }
  saveAuth(auth)
  return { uid: auth.uid, idToken: auth.idToken }
}

function mapRegistro(raw: Record<string, unknown>): RegistroChecklist {
  return {
    id: String(raw.id ?? ''),
    policyId: String(raw.policyId ?? raw.id ?? ''),
    uid: String(raw.uid ?? ''),
    version: Number(raw.version ?? 1),
    mes: String(raw.mes ?? ''),
    ano: Number(raw.ano ?? new Date().getFullYear()),
    dataPreenchimento: String(raw.dataPreenchimento ?? new Date().toISOString()),
    analista: String(raw.analista ?? ''),
    respostas: (raw.respostas as RespostaItem[]) ?? [],
    status: (raw.status as RegistroChecklist['status']) ?? 'rascunho',
    observacaoGestao: raw.observacaoGestao ? String(raw.observacaoGestao) : undefined,
    alteradoPor: raw.alteradoPor ? String(raw.alteradoPor) : undefined,
  }
}

async function runQuery(structuredQuery: Record<string, unknown>, idToken: string): Promise<Record<string, unknown>[]> {
  const res = await fetch(endpoint(':runQuery'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ structuredQuery }),
  })
  const rows = await res.json()
  if (!res.ok) throw new Error('Falha ao consultar Firestore.')
  return (rows as any[]).filter(r => r.document).map(r => parseDoc(r.document))
}

export async function getRegistros(): Promise<RegistroChecklist[]> {
  const { uid, idToken } = await ensureUser()
  const docs = await runQuery(
    {
      from: [{ collectionId: 'registros' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'uid' },
          op: 'EQUAL',
          value: { stringValue: uid },
        },
      },
      orderBy: [{ field: { fieldPath: 'version' }, direction: 'DESCENDING' }],
    },
    idToken,
  )

  const latestByPolicy = new Map<string, RegistroChecklist>()
  docs.forEach(d => {
    const reg = mapRegistro(d)
    if (!latestByPolicy.has(reg.policyId)) latestByPolicy.set(reg.policyId, reg)
  })

  return Array.from(latestByPolicy.values()).sort((a, b) => new Date(b.dataPreenchimento).getTime() - new Date(a.dataPreenchimento).getTime())
}

export async function getRegistroPorId(id: string): Promise<RegistroChecklist | null> {
  const { idToken } = await ensureUser()
  const res = await fetch(endpoint(`registros/${id}`), {
    headers: { Authorization: `Bearer ${idToken}` },
  })
  if (res.status === 404) return null
  const data = await res.json()
  if (!res.ok) throw new Error('Falha ao buscar registro no Firestore.')
  return mapRegistro(parseDoc(data))
}

export async function salvarRegistro(registro: RegistroChecklist): Promise<RegistroChecklist> {
  const { uid, idToken } = await ensureUser()

  const latest = await runQuery(
    {
      from: [{ collectionId: 'registros' }],
      where: {
        compositeFilter: {
          op: 'AND',
          filters: [
            { fieldFilter: { field: { fieldPath: 'uid' }, op: 'EQUAL', value: { stringValue: uid } } },
            { fieldFilter: { field: { fieldPath: 'policyId' }, op: 'EQUAL', value: { stringValue: registro.policyId } } },
          ],
        },
      },
      orderBy: [{ field: { fieldPath: 'version' }, direction: 'DESCENDING' }],
      limit: 1,
    },
    idToken,
  )

  const lastVersion = Number(latest[0]?.version ?? 0)
  const nextVersion = lastVersion + 1
  const now = new Date().toISOString()

  const payload: RegistroChecklist = {
    ...registro,
    id: '',
    uid,
    version: nextVersion,
    dataPreenchimento: now,
    alteradoPor: uid,
  }

  const fields: Record<string, unknown> = {}
  Object.entries(payload).forEach(([k, v]) => {
    if (k !== 'id') fields[k] = toFsValue(v)
  })

  const saveRes = await fetch(endpoint('registros'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ fields }),
  })
  const saveData = await saveRes.json()
  if (!saveRes.ok) throw new Error('Falha ao salvar versão da política.')

  const created = parseDoc(saveData)

  const logFields = {
    uid: toFsValue(uid),
    policyId: toFsValue(registro.policyId),
    registroId: toFsValue(created.id),
    action: toFsValue(nextVersion === 1 ? 'create' : 'update'),
    fromVersion: toFsValue(lastVersion || 0),
    toVersion: toFsValue(nextVersion),
    status: toFsValue(registro.status),
    at: toFsValue(now),
  }

  await fetch(endpoint('audit_logs'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ fields: logFields }),
  })

  return mapRegistro(created)
}

export async function getVersoesDaPolitica(policyId: string): Promise<RegistroChecklist[]> {
  const { uid, idToken } = await ensureUser()
  const docs = await runQuery(
    {
      from: [{ collectionId: 'registros' }],
      where: {
        compositeFilter: {
          op: 'AND',
          filters: [
            { fieldFilter: { field: { fieldPath: 'uid' }, op: 'EQUAL', value: { stringValue: uid } } },
            { fieldFilter: { field: { fieldPath: 'policyId' }, op: 'EQUAL', value: { stringValue: policyId } } },
          ],
        },
      },
      orderBy: [{ field: { fieldPath: 'version' }, direction: 'DESCENDING' }],
    },
    idToken,
  )
  return docs.map(mapRegistro)
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
  return `policy_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

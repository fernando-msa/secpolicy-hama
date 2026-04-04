'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getRegistros, calcularConformidade, MESES } from '@/lib/storage'
import { RegistroChecklist } from '@/lib/types'
import categorias from '@/data/politicas.json'

const totalItens = categorias.reduce((acc, c) => acc + c.items.length, 0)

const STATUS_LABEL: Record<string, string> = {
  rascunho: 'Rascunho',
  enviado: 'Aguardando aprovação',
  aprovado: 'Aprovado',
  ajuste_solicitado: 'Ajuste solicitado',
}

const STATUS_COR: Record<string, string> = {
  rascunho: 'var(--text-faint)',
  enviado: 'var(--amber)',
  aprovado: 'var(--green)',
  ajuste_solicitado: 'var(--red)',
}

export default function Home() {
  const [registros, setRegistros] = useState<RegistroChecklist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRegistros()
      .then(setRegistros)
      .finally(() => setLoading(false))
  }, [])

  const ultimo = registros[0]
  const pctUltimo = ultimo ? calcularConformidade(ultimo.respostas, totalItens) : null

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px 72px' }}>
      <section className="card fade-up" style={{ padding: '28px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            right: -80,
            top: -110,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.22) 0%, rgba(59,130,246,0) 70%)',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20, position: 'relative' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 10px', borderRadius: 999, marginBottom: 14, background: 'var(--blue-dim)', border: '1px solid rgba(59,130,246,0.28)', fontSize: 12, color: 'var(--blue)' }}>
              Demo operacional • ISO/IEC 27001
            </div>
            <h1 style={{ fontSize: 34, lineHeight: 1.15, marginBottom: 10 }}>SecPolicy HAMA</h1>
            <p style={{ color: 'var(--text-muted)', maxWidth: 560 }}>
              Fluxo mensal de checklist, score de conformidade e geração de PDF em uma experiência visual única para analistas e gestão.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(120px, 1fr))', gap: 10, minWidth: 270 }}>
            {[
              { label: 'Itens', value: String(totalItens) },
              { label: 'Categorias', value: String(categorias.length) },
              { label: 'Histórico', value: `${registros.length} mês(es)` },
              { label: 'Status', value: ultimo ? STATUS_LABEL[ultimo.status] : 'Sem dados' },
            ].map(card => (
              <div key={card.label} className="card" style={{ padding: '10px 12px', borderColor: 'var(--border-md)', background: 'rgba(17,24,39,0.8)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{card.label}</div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{card.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
          <Link href="/checklist/novo">
            <button className="btn-primary btn" style={{ padding: '11px 16px' }}>Iniciar checklist do mês</button>
          </Link>
          <a href="#demo-fluxo" style={{ textDecoration: 'none' }}>
            <button className="btn" style={{ padding: '11px 16px' }}>Ver demo do fluxo</button>
          </a>
        </div>
      </section>

      <section id="demo-fluxo" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 22 }}>
        {[
          { titulo: '1. Checklist mensal', desc: 'Preenchimento por categoria com criticidade e auto-save.' },
          { titulo: '2. Score em tempo real', desc: 'Conformidade consolidada com sinalização de risco.' },
          { titulo: '3. PDF executivo', desc: 'Exportação do relatório para aprovação da gestão.' },
        ].map(item => (
          <div key={item.titulo} className="card fade-up" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 12, color: 'var(--blue)', marginBottom: 4 }}>{item.titulo}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.desc}</div>
          </div>
        ))}
      </section>

      {loading ? (
        <div className="card fade-up" style={{ padding: '24px 28px', marginBottom: 24, textAlign: 'center' }}>
          Carregando dados do Firestore...
        </div>
      ) : ultimo && pctUltimo !== null ? (
        <div className="card fade-up" style={{ padding: '24px 28px', marginBottom: 24, borderColor: 'var(--border-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Último checklist</p>
              <p style={{ fontSize: 20, fontWeight: 600 }}>{MESES[parseInt(ultimo.mes) - 1]} {ultimo.ano}</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                Analista: {ultimo.analista} · {new Date(ultimo.dataPreenchimento).toLocaleDateString('pt-BR')} · v{ultimo.version}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 40, fontWeight: 600, color: pctUltimo >= 70 ? 'var(--green)' : pctUltimo >= 40 ? 'var(--amber)' : 'var(--red)' }}>{pctUltimo}%</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>conformidade</div>
            </div>
          </div>

          <div style={{ height: 6, background: 'var(--bg-subtle)', borderRadius: 3, margin: '16px 0 12px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                borderRadius: 3,
                width: `${pctUltimo}%`,
                background: pctUltimo >= 70 ? 'var(--green)' : pctUltimo >= 40 ? 'var(--amber)' : 'var(--red)',
                transition: 'width 0.6s ease',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: STATUS_COR[ultimo.status] ?? 'var(--text-muted)' }}>● {STATUS_LABEL[ultimo.status]}</span>
            <Link href={`/checklist/${ultimo.id}`}>
              <button className="btn" style={{ fontSize: 12 }}>Ver detalhes</button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="card fade-up" style={{ padding: '32px 28px', marginBottom: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>Nenhum checklist preenchido ainda. Comece agora.</p>
        </div>
      )}

      {registros.length > 0 && (
        <section>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Histórico</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {registros.map((r, i) => {
              const pct = calcularConformidade(r.respostas, totalItens)
              return (
                <Link key={r.id} href={`/checklist/${r.id}`} style={{ textDecoration: 'none' }}>
                  <div
                    className="card fade-up"
                    style={{
                      padding: '14px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      animationDelay: `${i * 40}ms`,
                      transition: 'border-color 0.15s',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{MESES[parseInt(r.mes) - 1]} {r.ano}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 10 }}>{r.analista} · v{r.version}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: STATUS_COR[r.status] ?? 'var(--text-muted)' }}>{STATUS_LABEL[r.status]}</span>
                      <span style={{ fontSize: 15, fontWeight: 600, color: pct >= 70 ? 'var(--green)' : pct >= 40 ? 'var(--amber)' : 'var(--red)' }}>{pct}%</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </main>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getRegistros, calcularConformidade, MESES } from '@/lib/storage'
import { RegistroChecklist } from '@/lib/types'
import categorias from '@/data/politicas.json'
import styles from './page.module.css'

const totalItens = categorias.reduce((acc, c) => acc + c.items.length, 0)

const STATUS_LABEL: Record<string, string> = {
  rascunho: 'Rascunho',
  enviado: 'Aguardando aprovação',
  aprovado: 'Aprovado',
  ajuste_solicitado: 'Ajuste solicitado',
}

const STATUS_CLASS: Record<string, string> = {
  rascunho: styles.statusDraft,
  enviado: styles.statusEnviado,
  aprovado: styles.statusAprovado,
  ajuste_solicitado: styles.statusAjuste,
}

function getScoreClass(pct: number) {
  if (pct >= 70) return styles.scoreGood
  if (pct >= 40) return styles.scoreWarn
  return styles.scoreBad
}

function getProgressClass(pct: number) {
  if (pct >= 70) return styles.progressGood
  if (pct >= 40) return styles.progressWarn
  return styles.progressBad
}

export default function Home() {
  const [registros, setRegistros] = useState<RegistroChecklist[]>([])
  const [loading, setLoading] = useState(true)
  const [instituicao, setInstituicao] = useState('')
  const [nomeContato, setNomeContato] = useState('')
  const [emailContato, setEmailContato] = useState('')
  const [prazoImplantacao, setPrazoImplantacao] = useState('')

  useEffect(() => {
    getRegistros()
      .then(setRegistros)
      .finally(() => setLoading(false))
  }, [])

  const ultimo = registros[0]
  const pctUltimo = ultimo ? calcularConformidade(ultimo.respostas, totalItens) : null

  const demoIssueUrl = (() => {
    const titleBase = instituicao.trim() ? `[Demo] SecPolicy para ${instituicao.trim()}` : '[Demo] SecPolicy para '
    const body = [
      '## Instituicao',
      instituicao.trim() || '(preencher)',
      '',
      '## Contato',
      `- Nome: ${nomeContato.trim() || '(preencher)'}`,
      `- E-mail: ${emailContato.trim() || '(preencher)'}`,
      '',
      '## Prazo esperado',
      prazoImplantacao.trim() || '(preencher)',
      '',
      '## Contexto atual',
      '(descreva rapidamente o processo atual de conformidade)',
    ].join('\n')

    return `https://github.com/fernando-msa/secpolicy-hama/issues/new?template=solicitar-demo.md&title=${encodeURIComponent(titleBase)}&body=${encodeURIComponent(body)}`
  })()

  return (
    <main className={styles.page}>
      <section className={`card fade-up ${styles.heroSection}`}>
        <div className={styles.heroGlow} />

        <div className={styles.heroContent}>
          <div>
            <div className={styles.heroBadge}>
              Demo operacional • ISO/IEC 27001
            </div>
            <h1 className={styles.heroTitle}>SecPolicy HAMA</h1>
            <p className={styles.heroText}>
              Fluxo mensal de checklist, score de conformidade e geração de PDF em uma experiência visual única para analistas e gestão.
            </p>
          </div>

          <div className={styles.kpiGrid}>
            {[
              { label: 'Itens', value: String(totalItens) },
              { label: 'Categorias', value: String(categorias.length) },
              { label: 'Histórico', value: `${registros.length} mês(es)` },
              { label: 'Status', value: ultimo ? STATUS_LABEL[ultimo.status] : 'Sem dados' },
            ].map(card => (
              <div key={card.label} className={`card ${styles.kpiCard}`}>
                <div className={styles.kpiLabel}>{card.label}</div>
                <div className={styles.kpiValue}>{card.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          <Link
            href="/checklist/novo"
            className={`btn-primary btn ${styles.ctaLink}`}
          >
            Iniciar checklist do mês
          </Link>
          <a
            href="#demo-fluxo"
            className={`btn ${styles.ctaLink}`}
          >
            Ver demo do fluxo
          </a>
        </div>
      </section>

      <section id="demo-fluxo" className={styles.grid3}>
        {[
          { titulo: '1. Checklist mensal', desc: 'Preenchimento por categoria com criticidade e auto-save.' },
          { titulo: '2. Score em tempo real', desc: 'Conformidade consolidada com sinalização de risco.' },
          { titulo: '3. PDF executivo', desc: 'Exportação do relatório para aprovação da gestão.' },
        ].map(item => (
          <div key={item.titulo} className={`card fade-up ${styles.stepCard}`}>
            <div className={styles.stepTitle}>{item.titulo}</div>
            <div className={styles.stepDesc}>{item.desc}</div>
          </div>
        ))}
      </section>

      <section className={`card fade-up ${styles.sectionCard}`}>
        <div className={styles.sectionTop}>
          <div>
            <p className={styles.sectionEyebrow}>
              Oferta comercial
            </p>
            <h2 className={styles.sectionTitle}>Planos para adoção do SecPolicy</h2>
          </div>
          <a href="https://github.com/fernando-msa/secpolicy-hama/blob/main/docs/oferta-comercial.md" target="_blank" rel="noopener noreferrer" className={styles.offerLink}>
            Ver detalhes da oferta
          </a>
        </div>

        <div className={styles.planGrid}>
          {[
            {
              nome: 'Starter',
              perfil: 'Operação única',
              inclui: 'Checklist mensal, score, PDF e histórico.',
              destaque: false,
            },
            {
              nome: 'Pro',
              perfil: 'Operação com gestão ativa',
              inclui: 'Tudo do Starter + fluxo de aprovação e trilha de auditoria.',
              destaque: true,
            },
            {
              nome: 'Enterprise',
              perfil: 'Rede com múltiplas unidades',
              inclui: 'Tudo do Pro + customizações, integrações e SLA dedicado.',
              destaque: false,
            },
          ].map(plano => (
            <div
              key={plano.nome}
              className={`card ${styles.planCard} ${plano.destaque ? styles.planCardHighlight : ''}`}
            >
              <div className={styles.planProfile}>{plano.perfil}</div>
              <div className={styles.planName}>{plano.nome}</div>
              <p className={styles.planDesc}>{plano.inclui}</p>
              <div className={styles.planPrice}>Valor sob consulta</div>
            </div>
          ))}
        </div>
      </section>

      <section className={`card fade-up ${styles.sectionCard}`}>
        <p className={styles.sectionEyebrow}>
          Prova de valor
        </p>
        <div className={styles.valueGrid}>
          {[
            { titulo: 'Padronização', texto: 'Fluxo único para todas as rotinas mensais.' },
            { titulo: 'Rastreabilidade', texto: 'Versionamento, status e trilha de auditoria.' },
            { titulo: 'Decisão rápida', texto: 'Score consolidado e PDF executivo imediato.' },
            { titulo: 'Adoção prática', texto: 'Implantação estimada entre 7 e 21 dias.' },
          ].map(item => (
            <div key={item.titulo} className={`card ${styles.valueCard}`}>
              <div className={styles.valueTitle}>{item.titulo}</div>
              <div className={styles.valueText}>{item.texto}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={`card fade-up ${styles.sectionCardBlue}`}>
        <p className={styles.sectionEyebrowBlue}>
          Conversão comercial
        </p>
        <h2 className={styles.sectionTitleMb}>Solicitar demonstração</h2>
        <p className={styles.sectionText}>
          Preencha os dados e abra a solicitação. O link já envia uma issue pré-preenchida para acelerar o contato comercial.
        </p>

        <div className={styles.formGrid}>
          <input
            value={instituicao}
            onChange={(e) => setInstituicao(e.target.value)}
            placeholder="Instituição"
            maxLength={200}
            className={styles.input}
          />
          <input
            value={nomeContato}
            onChange={(e) => setNomeContato(e.target.value)}
            placeholder="Nome do contato"
            maxLength={100}
            className={styles.input}
          />
          <input
            value={emailContato}
            onChange={(e) => setEmailContato(e.target.value)}
            placeholder="E-mail"
            type="email"
            maxLength={200}
            className={styles.input}
          />
          <input
            value={prazoImplantacao}
            onChange={(e) => setPrazoImplantacao(e.target.value)}
            placeholder="Prazo esperado (ex.: 30 dias)"
            maxLength={50}
            className={styles.input}
          />
        </div>

        <div className={styles.linkButtons}>
          <a href={demoIssueUrl} target="_blank" rel="noopener noreferrer" className={`btn btn-primary ${styles.linkBtn}`}>
            Abrir solicitação de demo
          </a>
          <a href="https://github.com/fernando-msa/secpolicy-hama/issues/new?template=solicitar-demo.md" target="_blank" rel="noopener noreferrer" className={`btn ${styles.linkBtn}`}>
            Abrir template simples
          </a>
        </div>
      </section>

      {loading ? (
        <div className={`card fade-up ${styles.centerCard}`}>
          Carregando dados do Firestore...
        </div>
      ) : ultimo && pctUltimo !== null ? (
        <div className={`card fade-up ${styles.lastCard}`}>
          <div className={styles.lastTop}>
            <div>
              <p className={styles.mutedSmall}>Último checklist</p>
              <p className={styles.lastTitle}>{MESES[parseInt(ultimo.mes) - 1]} {ultimo.ano}</p>
              <p className={styles.lastMeta}>
                Analista: {ultimo.analista} · {new Date(ultimo.dataPreenchimento).toLocaleDateString('pt-BR')} · v{ultimo.version}
              </p>
            </div>
            <div className={styles.scoreWrap}>
              <div className={`${styles.scoreValue} ${getScoreClass(pctUltimo)}`}>{pctUltimo}%</div>
              <div className={styles.mutedSmall}>conformidade</div>
            </div>
          </div>

          <progress className={`${styles.progress} ${getProgressClass(pctUltimo)}`} max={100} value={pctUltimo} />

          <div className={styles.lastBottom}>
            <span className={`${styles.status} ${STATUS_CLASS[ultimo.status] ?? styles.statusDraft}`}>● {STATUS_LABEL[ultimo.status]}</span>
            <Link href={`/checklist/${ultimo.id}`}>
              <button className={`btn ${styles.detailsBtn}`}>Ver detalhes</button>
            </Link>
          </div>
        </div>
      ) : (
        <div className={`card fade-up ${styles.emptyCard}`}>
          <p className={styles.emptyText}>Nenhum checklist preenchido ainda. Comece agora.</p>
        </div>
      )}

      {registros.length > 0 && (
        <section>
          <p className={styles.historyTitle}>Histórico</p>
          <div className={styles.historyList}>
            {registros.map((r) => {
              const pct = calcularConformidade(r.respostas, totalItens)
              return (
                <Link key={r.id} href={`/checklist/${r.id}`} className={styles.historyLink}>
                  <div className={`card fade-up ${styles.historyCard}`}>
                    <div>
                      <span className={styles.historyMain}>{MESES[parseInt(r.mes) - 1]} {r.ano}</span>
                      <span className={styles.historySub}>{r.analista} · v{r.version}</span>
                    </div>
                    <div className={styles.historyRight}>
                      <span className={`${styles.status} ${STATUS_CLASS[r.status] ?? styles.statusDraft}`}>{STATUS_LABEL[r.status]}</span>
                      <span className={`${styles.historyPct} ${getScoreClass(pct)}`}>{pct}%</span>
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

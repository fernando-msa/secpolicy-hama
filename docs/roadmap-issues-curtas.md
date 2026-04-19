# Roadmap: versao curta para colar no GitHub

Cada bloco abaixo esta no formato do template `Proximo passo (roadmap)`.

---

## [Roadmap] Motor de conformidade por dominio com tendencia mensal

Labels: `roadmap`, `enhancement`, `plataforma-compliance`, `governanca`, `analytics`

Objetivo:

Implementar calculo de conformidade por dominio com tendencia mensal para leitura de risco.

Escopo:

- [ ] Estruturar dominios no checklist.
- [ ] Calcular score por dominio e score global.
- [ ] Persistir historico mensal por unidade.
- [ ] Exibir tendencia por dominio.

Criterios de aceite:

- [ ] Score por dominio visivel no resumo mensal.
- [ ] Historico de no minimo 12 ciclos.
- [ ] Tendencia baseada em pelo menos 3 pontos.
- [ ] Regra de calculo documentada.

Dependencias:

Modelagem de dominios em `data/politicas.json`.

---

## [Roadmap] Modulo de evidencias por controle (anexo, validade, responsavel)

Labels: `roadmap`, `enhancement`, `plataforma-compliance`, `governanca`, `auditoria`

Objetivo:

Permitir anexar e gerenciar evidencias por controle com metadados de auditoria.

Escopo:

- [ ] Vincular evidencias aos controles.
- [ ] Registrar responsavel e validade.
- [ ] Suportar multiplas evidencias por controle.
- [ ] Exibir status de validade.

Criterios de aceite:

- [ ] Metadados completos por evidencia.
- [ ] Evidencia vencida sinaliza risco.
- [ ] Historico de evidencias por periodo.
- [ ] Vinculo preservado entre versoes.

Dependencias:

Definicao de armazenamento e retencao de anexos.

---

## [Roadmap] SLA e escalonamento de nao conformidades criticas

Labels: `roadmap`, `enhancement`, `plataforma-compliance`, `governanca`, `automacao`

Objetivo:

Aplicar SLA por criticidade e escalonamento automatico de pendencias criticas.

Escopo:

- [ ] Definir SLA por criticidade.
- [ ] Calcular prazo restante por pendencia.
- [ ] Escalonar violacoes automaticamente.
- [ ] Priorizar fila por risco e atraso.

Criterios de aceite:

- [ ] SLA configuravel sem alterar codigo.
- [ ] Escalonamento auditavel.
- [ ] Itens fora do SLA no topo da fila.
- [ ] Relatorio com taxa de cumprimento.

Dependencias:

Integracao de notificacoes.

---

## [Roadmap] Fila de aprovacao multi-nivel (analista, gestor, comite)

Labels: `roadmap`, `enhancement`, `plataforma-compliance`, `governanca`, `workflow`

Objetivo:

Implementar workflow de aprovacao multi-nivel com rastreabilidade completa.

Escopo:

- [ ] Definir estados do workflow.
- [ ] Implementar papeis e permissoes.
- [ ] Permitir devolucao com comentario.
- [ ] Medir tempo por etapa.

Criterios de aceite:

- [ ] Fechamento exige aprovacao requerida.
- [ ] Rejeicao com justificativa obrigatoria.
- [ ] Transicoes e autoria auditaveis.
- [ ] Visao de gargalos por etapa.

Dependencias:

Definicao de autenticacao e autorizacao por perfil.

---

## [Roadmap] Integracao de notificacoes (e-mail e eventos de workflow)

Labels: `roadmap`, `enhancement`, `plataforma-compliance`, `automacao`, `integracao`

Objetivo:

Automatizar notificacoes por eventos de workflow e agenda mensal.

Escopo:

- [ ] Notificar em submissao, aprovacao, rejeicao e escalonamento.
- [ ] Implementar lembretes mensais.
- [ ] Configurar destinatarios por papel/unidade.
- [ ] Registrar historico de envios.

Criterios de aceite:

- [ ] Evento critico notificado em ate 1 minuto.
- [ ] Falhas com reprocessamento registrado.
- [ ] Categorias ativaveis/desativaveis.
- [ ] Evidencia de envio na auditoria.

Dependencias:

Definicao de provedor e limites de envio.

---

## [Roadmap] Dashboard executivo por unidade, risco e recorrencia

Labels: `roadmap`, `enhancement`, `plataforma-compliance`, `analytics`, `gestao`

Objetivo:

Entregar painel executivo para comparativo de risco e recorrencia entre unidades.

Escopo:

- [ ] Exibir score global e por dominio por unidade.
- [ ] Evidenciar recorrencias por periodo.
- [ ] Mostrar SLA e backlog.
- [ ] Filtrar por periodo, unidade e criticidade.

Criterios de aceite:

- [ ] Gestao enxerga consolidado sem abrir item a item.
- [ ] Recorrencia considera ao menos 6 meses.
- [ ] Filtros consistentes entre cards/graficos.
- [ ] Dados exportaveis para comite.

Dependencias:

Motor de conformidade e SLA.

---

## [Roadmap] Export estruturado para BI/Excel e trilha de auditoria externa

Labels: `roadmap`, `enhancement`, `plataforma-compliance`, `integracao`, `auditoria`

Objetivo:

Disponibilizar export estruturado para BI/Excel com trilha completa de auditoria.

Escopo:

- [ ] Exportar checklist, score, pendencias e evidencias.
- [ ] Definir layout padrao de colunas.
- [ ] Suportar filtros de periodo/unidade/status.
- [ ] Incluir trilha de auditoria no pacote.

Criterios de aceite:

- [ ] Export abre no Excel sem ajuste manual.
- [ ] Campos obrigatorios de auditoria presentes.
- [ ] Export respeita filtros aplicados.
- [ ] Dicionario de dados publicado.

Dependencias:

Definicao de governanca e compartilhamento de dados.

---

## [Roadmap] Baseline de operacao: logs, monitoracao e alertas de disponibilidade

Labels: `roadmap`, `enhancement`, `plataforma-compliance`, `observabilidade`, `operacao`

Objetivo:

Estabelecer baseline de observabilidade e resposta operacional em producao.

Escopo:

- [ ] Instrumentar logs estruturados.
- [ ] Definir metricas de erro, latencia e disponibilidade.
- [ ] Configurar alertas de indisponibilidade/falha de workflow.
- [ ] Documentar playbook de incidente.

Criterios de aceite:

- [ ] Alerta em ate 5 minutos de indisponibilidade.
- [ ] Rastreio fim a fim por identificador.
- [ ] Painel de saude operacional ativo.
- [ ] Playbook validado em simulacao.

Dependencias:

Definicao da ferramenta de monitoracao e canais de resposta.

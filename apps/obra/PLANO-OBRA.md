# PLANO OBRA — Pagina de Entrega ViraHit

**Versao:** 1.0 | **Data:** 2026-04-25 | **Status:** Em execucao

---

## OBJETIVO

Substituir envio de MP3 solto no WhatsApp por uma pagina web premium ("Obra") com player, letra, carta do compositor, bonus e certificado. URL unica por pedido: `virahit.ai/obra/{id}`

---

## PRINCIPIOS

1. **So link, sem MP3 solto** — cliente recebe link da Obra via WhatsApp
2. **Obra_Status como trigger** — quando Nicolas marca "OK", AI gera conteudo automatico
3. **Checkpoint de revisao** — Nicolas ve/ajusta conteudo gerado ANTES de entregar ao cliente
4. **Status_Producao = "Concluido"** — dispara webhook ReplyAgent com link da Obra
5. **Token Baserow NAO exposto** — API Python server-side, zero JS client-side

---

## FLUXO COMPLETO (7 ETAPAS)

```
1. Nicolas gera musica no Suno (V1 oficial + V2 bonus)
2. Nicolas faz upload dos MP3s no Baserow
3. Nicolas marca Obra_Status = "OK"
   ↓
4. SCRIPT Python gera conteudo automatico:
   a. letra_limpa (remove tags [Verse], [Chorus] da letra_gerada)
   b. carta_compositor (Gemini 2.5 Pro le historia + letra)
   c. registro_obra (VH-[4 letras]-[4 digitos])
   d. titulo_musica (baseado na ocasiao/estilo)
   e. data_criacao = now
   f. Atualiza tudo no Baserow
   ↓
5. Nicolas revisa campos gerados no Baserow
   - Corrige manualmente se necessario
   ↓
6. Nicolas marca Status_Producao = "Concluido"
   ↓
7. Webhook → ReplyAgent envia link ao cliente:
   "Sua musica esta pronta! Acesse aqui: virahit.ai/obra/298"
```

---

## CAMPOS BASEROW — MAPA COMPLETO

### Campos existentes (NAO mexer)
| Campo | Tipo | Origem |
|---|---|---|
| `Nome_Comprador` | text | Lari (SF1) |
| `whatsapp` | text | Lari (SF1) |
| `Nome_Homenageado` | text | Lari (SF1) |
| `Ocasiao` | text | Lari (SF1) |
| `Data_da_Ocasiao` | text | Lari (SF1) |
| `Estilo_Musical` | single_select | Lari (SF1) |
| `Historia_Detalhes` | long_text | Lari (SF1) |
| `Ticket_Gasto` | number | Lari (SF1) |
| `Status_Producao` | single_select | Nicolas |
| `ID Pedido` | text | Sistema |
| `Contexto` | long_text | Lari (SF1) |
| `Relação` | text | Lari (SF1) |
| `Vibe Musica` | text | Lari (SF1) |
| `conversa_inteira_json` | long_text | Sistema |
| `letra_gerada` | long_text | AI/Nicolas |
| `V1_link_mp3_url` | file | Nicolas |
| `Style Prompt` | long_text | AI |
| `Exclude Styles` | long_text | AI |
| `V2_link_mp3_url` | file | Nicolas |

### Campos NOVOS (a criar)
| Campo | Tipo | Origem | Quando |
|---|---|---|---|
| `Obra_Status` | single_select (Pendente/OK) | Nicolas | **TRIGGER — gera conteudo** |
| `letra_limpa` | long_text | AI (script) | Auto quando Obra_Status=OK |
| `carta_compositor` | long_text | AI (script) | Auto quando Obra_Status=OK |
| `registro_obra` | text | AI (script) | Auto quando Obra_Status=OK |
| `titulo_musica` | text | AI (script) | Auto quando Obra_Status=OK |
| `data_criacao` | datetime | AI (script) | Auto quando Obra_Status=OK |

---

## PAGINA OBRA — BLOCOS E DADOS

| # | Bloco | Dado dinamico | Fallback se vazio |
|---|---|---|---|
| 1 | Header: titulo | `Nome_Homenageado` | "Voce" |
| 2 | Header: autor | `Nome_Comprador` | "Alguem Especial" |
| 3 | Player Oficial: titulo | `titulo_musica` | "A Nossa Historia" |
| 4 | Player Oficial: audio | `V1_link_mp3_url` | Sem audio |
| 5 | Letra | `letra_limpa` | `letra_gerada` (com tags) |
| 6 | Carta | `carta_compositor` | Texto padrao generico |
| 7 | Bonus: audio | `V2_link_mp3_url` | Sem bonus |
| 8 | Nota agradecimento | FIXO | — |
| 9 | Certificado: registro | `registro_obra` | VH-XXXX-0000 |
| 10 | Certificado: data | `data_criacao` | Data atual |
| 11 | Compartilhar | URL dinamica | URL atual |

---

## FASES DE IMPLEMENTACAO

### FASE 1: Colunas no Baserow ✅ CONCLUIDO
- 6 campos criados via JWT (login email+senha)
- Obra_Status: single_select com opcoes Pendente/OK (corrigido via JWT)
- letra_limpa, carta_compositor, registro_obra, titulo_musica, data_criacao

### FASE 2: Script gerar-obra.py ✅ CONCLUIDO
- Arquivo: `~/empresa/operacao/scripts/gerar-obra.py`
- Gemini 2.5 Pro com maxOutputTokens=8192 (chain-of-thought)
- Testado com sucesso no pedido #298 (Eliana → Jonathas)
- Uso: `python3 gerar-obra.py` (todos pendentes) ou `--row 298` ou `--dry-run`

### FASE 3: API FastAPI ✅ CONCLUIDO
- Arquivo: `~/empresa/site/obra-api/main.py`
- Template: `~/empresa/site/obra/obra-template.html`
- Endpoints: `/obra?id={row_id}`, `/obra/json/{id}`, `/health`
- Systemd: `obra-api.service` (restart=always)

### FASE 4: Caddy reverse proxy ✅ CONCLUIDO
- Rota `/obra*` → proxy 127.0.0.1:8080
- Testado: `http://52.205.84.99/obra?id=298` funciona

### FASE 5: Teste end-to-end ✅ CONCLUIDO
- Pedido 298 processado: letra limpa, carta, registro, titulo gerados
- API serviu pagina com dados corretos
- Caddy roteando corretamente
- Pendente: Nicolas subir MP3s (V1_link_mp3_url, V2_link_mp3_url)

---

## INFRA

| Componente | Local | Porta |
|---|---|---|
| API Python | `~/empresa/site/obra-api/` | 8080 |
| Script AI | `~/empresa/operacao/scripts/gerar-obra.py` | — |
| Caddy | `/etc/caddy/Caddyfile` | 80/443 |
| Baserow | Cloud | REST API |

---

## RISCOS E MITIGACAO

| Risco | Probabilidade | Impacto | Mitigacao |
|---|---|---|---|
| Gemini gera conteudo ruim | Media | Medio | Nicolas revisa antes de entregar |
| API Python cai | Baixa | Alto | Systemd com restart=always |
| Baserow API lenta | Baixa | Baixo | Timeout de 10s, retry 2x |
| MP3 nao carrega no player | Baixa | Alto | Validar URL antes de renderizar |
| Token exposto | N/A (API server-side) | — | Zero client-side auth |

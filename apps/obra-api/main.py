#!/usr/bin/env python3
"""
obra-api — API FastAPI para servir paginas Obra da ViraHit

Endpoint: GET /obra?id={row_id}
Busca dados no Baserow (server-side, token seguro) e renderiza HTML personalizado.

Uso:
  uvicorn main:app --host 0.0.0.0 --port 8080
"""

import json
import urllib.request
import urllib.error
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse, StreamingResponse
from string import Template

app = FastAPI(title="ViraHit Obra API")

# ============================================================
# CONFIG
# ============================================================
BASEROW_TOKEN = "cWMKvF1vPQUFlKZsFV3F1raIQ8s1bWrj"
TABLE_ID = 901528
HTML_TEMPLATE_PATH = "/home/hermes_general/empresa/site/obra/obra-template.html"

# ============================================================
# BASEROW
# ============================================================
def get_baserow_row(row_id: int) -> dict:
    """Busca dados do pedido no Baserow."""
    url = f"https://api.baserow.io/api/database/rows/table/{TABLE_ID}/{row_id}/?user_field_names=true"
    req = urllib.request.Request(url)
    req.add_header("Authorization", f"Token {BASEROW_TOKEN}")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        if e.code == 404:
            raise HTTPException(status_code=404, detail=f"Pedido #{row_id} nao encontrado")
        raise HTTPException(status_code=500, detail=f"Erro ao buscar dados: {e.code}")

def get_file_url(file_field) -> str:
    """Extrai URL de um campo file do Baserow."""
    if file_field and isinstance(file_field, list) and len(file_field) > 0:
        return file_field[0].get("url", "")
    return ""

# ============================================================
# RENDER
# ============================================================
def render_obra(row: dict) -> str:
    """Renderiza HTML com dados do pedido."""
    # Read template
    try:
        with open(HTML_TEMPLATE_PATH, "r", encoding="utf-8") as f:
            template = f.read()
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Template HTML nao encontrado")

    # Extract data
    nome_homenageado = row.get("Nome_Homenageado") or "Voce"
    nome_comprador = row.get("Nome_Comprador") or "Alguem Especial"
    titulo_musica = row.get("titulo_musica") or "A Nossa Historia"
    letra = row.get("letra_limpa") or row.get("letra_gerada", "Letra nao disponivel.")
    carta = row.get("carta_compositor") or ""
    registro = row.get("registro_obra") or "VH-XXXX-0000"
    v1_url = get_file_url(row.get("V1_link_mp3_url"))
    v2_url = get_file_url(row.get("V2_link_mp3_url"))
    data_criacao = row.get("data_criacao", "")
    
    # Suporte para Capa Personalizada
    capa_url = ""
    # Tenta puxar a URL gerada pela IA primeiro (se salvamos a URL lá no Capa_Prompt para economizar disco)
    prompt_gerado = row.get("Capa_Prompt")
    if prompt_gerado and "http" in prompt_gerado:
        capa_url = prompt_gerado
    elif prompt_gerado:
        import urllib.parse
        safe_prompt = urllib.parse.quote(prompt_gerado)
        capa_url = f"https://image.pollinations.ai/prompt/{safe_prompt}?width=512&height=512&nologo=true"
    
    # Se o Baserow tiver um arquivo feito upload manualmente, ele tem precedencia
    capa_arquivo = get_file_url(row.get("Capa_Personalizada"))
    if capa_arquivo:
        capa_url = capa_arquivo
        
    # Mock para o pedido 166 (Entrega Imediata) se não houver capa ainda
    if row.get("id") == 166 and not capa_url:
        capa_url = "https://image.pollinations.ai/prompt/Cinematic%20photorealistic%20close-up%20of%20a%20pair%20of%20cute%20knitted%20baby%20shoes%20resting%20in%20a%20warm%20golden%20light%2C%20symbolizing%20a%20miracle%20of%20life.%20Soft%20background%2C%20premium%20velvet%20texture%2C%20highly%20detailed?width=512&height=512&nologo=true"

    
    if capa_url:
        artwork_html = f'<div class="player-artwork-bg" style="background-image: url(\'{capa_url}\'); background-size: cover; background-position: center; border-radius: inherit;"></div>'
    else:
        artwork_html = '''<div class="player-artwork-bg">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 18V5l12-2v13"></path>
                            <circle cx="6" cy="18" r="3"></circle>
                            <circle cx="18" cy="16" r="3"></circle>
                        </svg>
                    </div>'''
    
    # Format date for display
    if data_criacao:
        try:
            # Baserow returns ISO format
            from datetime import datetime
            dt = datetime.fromisoformat(data_criacao.replace("Z", "+00:00"))
            data_formatada = dt.strftime("%d de %B de %Y, às %H:%M")
            # Translate month
            meses = {"January": "janeiro", "February": "fevereiro", "March": "marco",
                     "April": "abril", "May": "maio", "June": "junho", "July": "julho",
                     "August": "agosto", "September": "setembro", "October": "outubro",
                     "November": "novembro", "December": "dezembro"}
            for en, pt in meses.items():
                data_formatada = data_formatada.replace(en, pt)
        except:
            data_formatada = ""
    else:
        data_formatada = ""

    # Format letter into verses (wrap lines in div.estrofe)
    letra_html = ""
    current_verses = []
    for line in letra.split("\n"):
        line = line.strip()
        if not line:
            if current_verses:
                letra_html += '<div class="estrofe">' + "\n".join(current_verses) + "</div>\n\n"
                current_verses = []
        else:
            current_verses.append(line)
    if current_verses:
        letra_html += '<div class="estrofe">' + "\n".join(current_verses) + "</div>"

    # Build share URL
    share_url = f"https://virahit.ai/obra?id={row.get('id', '0')}"

    # Use template substitution
    # Proxy download URLs
    import urllib.parse
    safe_v1_url = urllib.parse.quote(v1_url) if v1_url else ""
    safe_v2_url = urllib.parse.quote(v2_url) if v2_url else ""
    safe_v1_name = urllib.parse.quote(f"ViraHit - {titulo_musica}.mp3")
    safe_v2_name = urllib.parse.quote(f"ViraHit - {titulo_musica} (Bonus).mp3")
    
    download_v1 = f"/obra-download?url={safe_v1_url}&filename={safe_v1_name}" if v1_url else ""
    download_v2 = f"/obra-download?url={safe_v2_url}&filename={safe_v2_name}" if v2_url else ""

    replacements = {
        "NOME_HOMENAGEADO": nome_homenageado,
        "NOME_COMPRADOR": nome_comprador,
        "TITULO_OFICIAL": titulo_musica,
        "TITULO_BONUS": titulo_musica + " (Versao Alternativa)",
        "LETRA_HTML": letra_html,
        "CARTA_COMPOSITOR": carta,
        "REGISTRO_OBRA": registro,
        "DATA_CRIACAO": data_formatada,
        "AUDIO_V1_URL": v1_url,
        "AUDIO_V2_URL": v2_url,
        "DOWNLOAD_V1_URL": download_v1,
        "DOWNLOAD_V2_URL": download_v2,
        "ARTWORK_HTML": artwork_html,
        "ARTWORK_URL": capa_url if capa_url else "https://virahit.ai/favicon.ico",
        "SHARE_URL": share_url,
        "ROW_ID": str(row.get("id", "0")),
        "HAS_BONUS": "true" if v2_url else "false",
    }

    # Apply replacements
    html = template
    for key, value in replacements.items():
        html = html.replace(f"{{{{{key}}}}}", value)

    return html

# ============================================================
# ROUTES
# ============================================================
@app.get("/obra", response_class=HTMLResponse)
async def obra_page(id: int):
    """Serve a pagina Obra para um pedido (query param)."""
    row = get_baserow_row(id)
    html = render_obra(row)
    return HTMLResponse(content=html, status_code=200)


@app.get("/obra-download")
async def proxy_download(url: str, filename: str = "ViraHit.mp3"):
    """Força o download proxyando o arquivo pela VPS."""
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    
    def iterfile():
        try:
            with urllib.request.urlopen(req) as response:
                while chunk := response.read(65536):
                    yield chunk
        except Exception as e:
            print("Proxy download error:", e)
            
    headers = {
        "Content-Disposition": f'attachment; filename="{filename}"',
        "Content-Type": "audio/mpeg"
    }
    return StreamingResponse(iterfile(), headers=headers)

@app.get("/health")

async def health():
    """Health check."""
    return {"status": "ok", "service": "obra-api"}

@app.get("/obra", response_class=HTMLResponse)
async def obra_index():
    """Pagina /obra sem ID — redireciona para virahit.ai"""
    return HTMLResponse(
        content='<html><head><meta http-equiv="refresh" content="0;url=https://virahit.ai"></head><body>Redirecionando...</body></html>',
        status_code=200
    )

@app.get("/obra/{obra_id}", response_class=HTMLResponse)
async def obra_page_path(obra_id: int):
    """Serve a pagina Obra com URL limpa: /obra/298"""
    row = get_baserow_row(obra_id)
    html = render_obra(row)
    return HTMLResponse(content=html, status_code=200)

@app.get("/{obra_id}", response_class=HTMLResponse)
async def obra_page_clean(obra_id: int):
    """Serve a pagina Obra com URL limpa alternativa: /298"""
    row = get_baserow_row(obra_id)
    html = render_obra(row)
    return HTMLResponse(content=html, status_code=200)

@app.get("/json/{id}")
async def obra_json(id: int):
    """API JSON para debug."""
    row = get_baserow_row(id)
    return {
        "id": row.get("id"),
        "nome_homenageado": row.get("Nome_Homenageado"),
        "nome_comprador": row.get("Nome_Comprador"),
        "titulo_musica": row.get("titulo_musica"),
        "registro_obra": row.get("registro_obra"),
        "link_obra": row.get("link_obra"),
        "has_audio_v1": bool(get_file_url(row.get("V1_link_mp3_url"))),
        "has_audio_v2": bool(get_file_url(row.get("V2_link_mp3_url"))),
    }

#!/usr/bin/env python3
"""Write frontend error to Baserow 'Erros Frontend' table.
Reads JSON from stdin, writes to Baserow API.
Outputs 'OK:<id>' on success, 'ERR:<message>' on failure.
"""
import sys
import json
import urllib.request
from datetime import datetime, timezone

TOKEN = "cWMKvF1vPQUFlKZsFV3F1raIQ8s1bWrj"

import os
TABLE_ID = os.environ.get("BASEROW_ERROS_TABLE_ID")
if not TABLE_ID:
    print("ERR:BASEROW_ERROS_TABLE_ID not set")
    sys.exit(1)

url = f"https://api.baserow.io/api/database/rows/table/{TABLE_ID}/?user_field_names=true"
data = json.loads(sys.stdin.read())
now = datetime.now(timezone.utc).isoformat()

payload = {
    "timestamp": now,
    "pagina": data.get("pagina", ""),
    "etapa": data.get("etapa", ""),
    "erro_tipo": data.get("erro_tipo", ""),
    "erro_mensagem": data.get("erro_mensagem", ""),
    "erro_stack": data.get("erro_stack", ""),
    "user_agent": data.get("user_agent", ""),
    "pedido_id": data.get("pedido_id", ""),
    "comprador_nome": data.get("comprador_nome", ""),
    "comprador_whatsapp": data.get("comprador_whatsapp", ""),
    "comprador_email": data.get("comprador_email", ""),
}

req = urllib.request.Request(url, data=json.dumps(payload).encode(), method="POST")
req.add_header("Authorization", f"Token {TOKEN}")
req.add_header("Content-Type", "application/json")
try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        result = json.loads(resp.read())
        row_id = result.get("id", "?")
        print(f"OK:{row_id}")
except Exception as e:
    print(f"ERR:{e}")
    sys.exit(1)

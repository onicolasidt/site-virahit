#!/usr/bin/env python3
"""
Monitor de pagamentos ViraHit — roda a cada 30s, avisa no Telegram quando status muda para 'pago'
"""
import json
import os
import sys
import firebase_admin
from firebase_admin import credentials, firestore

# Evitar inicializar duas vezes
if not firebase_admin._apps:
    cred = credentials.Certificate('/home/hermes_general/.firebase/service-account.json')
    firebase_admin.initialize_app(cred)

db = firestore.Client(
    project='gen-lang-client-0504397875',
    credentials=firebase_admin.get_app().credential.get_credential(),
    database='ai-studio-5f1d09ec-5dd5-4c8c-8b76-478305de7e20'
)

ESTADO_FILE = '/home/hermes_general/empresa/funil-web/quiz-virahit-v2/monitor-estado.json'

def carregar_estado():
    if os.path.exists(ESTADO_FILE):
        try:
            return json.load(open(ESTADO_FILE))
        except:
            pass
    return {}

def salvar_estado(estado):
    json.dump(estado, open(ESTADO_FILE, 'w'), indent=2)

def main():
    estado = carregar_estado()
    pedidos = db.collection('pedidos').get()
    
    novos_pagos = []
    erros = []
    
    for p in pedidos:
        d = p.to_dict()
        pedido_id = p.id
        status_atual = d.get('status', 'pendente')
        status_anterior = estado.get(pedido_id, {}).get('status', 'pendente')
        
        # Detectar mudanca para pago
        if status_atual == 'pago' and status_anterior != 'pago':
            gateway = d.get('gateway', 'PIX')
            nome = d.get('nome') or d.get('compradorNome') or '?'
            estilo = d.get('estiloMusical') or d.get('estilo') or '?'
            whatsapp = d.get('compradorWhatsApp') or '?'
            novos_pagos.append({
                'id': pedido_id,
                'nome': nome,
                'estilo': estilo,
                'gateway': gateway.upper(),
                'whatsapp': whatsapp
            })
        
        # Detectar status de erro
        if status_atual in ['erro', 'failed', 'error'] and status_anterior not in ['erro', 'failed', 'error']:
            erros.append({'id': pedido_id, 'status': status_atual})
        
        # Atualizar estado
        estado[pedido_id] = {'status': status_atual}
    
    salvar_estado(estado)
    
    # Retornar resultados para o cron
    resultado = {'pagos': novos_pagos, 'erros': erros}
    print(json.dumps(resultado))
    return resultado

if __name__ == '__main__':
    main()

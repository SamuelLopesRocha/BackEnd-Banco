#cd src/rpa
#python main.py

from db_connection import get_usuarios_novos, marcar_email_enviado
from email_service import enviar_email

print("🔍 Buscando usuários novos...")

usuarios = get_usuarios_novos()

for usuario in usuarios:
    nome = usuario["nome_completo"]
    email = usuario["email"]
    usuario_id = usuario["usuario_id"]

    print(f"📧 Enviando email para {nome} ({email})")

    enviar_email(email, nome)
    marcar_email_enviado(usuario_id)

print("✅ Processo finalizado.")

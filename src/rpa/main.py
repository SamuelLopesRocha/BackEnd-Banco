from db_connection import (
    get_usuarios_pendentes_email,
    marcar_email_usuario_enviado,
    get_contas_poupanca_pendentes_email,
    marcar_email_poupanca_enviado,
    get_usuario_por_id
)

from email_service import enviar_email

print("🔍 Buscando usuários pendentes...")

# ==============================
# 👤 CADASTRO
# ==============================

usuarios = get_usuarios_pendentes_email()

for usuario in usuarios:
    nome = usuario["nome_completo"]
    email = usuario["email"]
    usuario_id = usuario["usuario_id"]

    print(f"📧 Enviando email de cadastro para {nome}")

    enviar_email(
        destinatario=email,
        assunto="🎉 Sua conta corrente foi criada!",
        nome_template="email_boas_vindas.html",
        dados={
            "nome": nome,
            "agencia": "0001",
            "numero_conta": "123456",
            "digito": "7"
        }
    )

    marcar_email_usuario_enviado(usuario_id)


# ==============================
# 💰 POUPANÇA
# ==============================

print("🔍 Buscando contas poupança pendentes...")

contas = get_contas_poupanca_pendentes_email()

for conta in contas:
    usuario = get_usuario_por_id(conta["usuario_id"])

    nome = usuario["nome_completo"]
    email = usuario["email"]

    print(f"📧 Enviando email poupança para {nome}")

    enviar_email(
        destinatario=email,
        assunto="💰 Sua conta poupança foi criada!",
        nome_template="email_conta_poupanca.html",
        dados={
            "nome": nome,
            "agencia": conta["agencia"],
            "numero_conta": conta["numero_conta"],
            "digito": conta["digito"],
            "taxa_rendimento": "0,5%"
        }
    )

    marcar_email_poupanca_enviado(conta["id_conta"])

print("✅ Processo finalizado.")

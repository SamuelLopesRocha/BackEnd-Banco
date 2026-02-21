import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import EMAIL_REMETENTE, EMAIL_SENHA, SMTP_SERVIDOR, SMTP_PORTA


def carregar_template(nome_template, dados):
    caminho = os.path.join(
        os.path.dirname(__file__),
        "templates",
        nome_template
    )

    with open(caminho, "r", encoding="utf-8") as file:
        html = file.read()

    # Substitui todas as variáveis dinamicamente
    for chave, valor in dados.items():
        html = html.replace(f"{{{{{chave}}}}}", str(valor))

    return html


def enviar_email(destinatario, assunto, nome_template, dados):
    msg = MIMEMultipart()
    msg["From"] = EMAIL_REMETENTE
    msg["To"] = destinatario
    msg["Subject"] = assunto

    html = carregar_template(nome_template, dados)
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP(SMTP_SERVIDOR, SMTP_PORTA) as server:
        server.starttls()
        server.login(EMAIL_REMETENTE, EMAIL_SENHA)
        server.send_message(msg)

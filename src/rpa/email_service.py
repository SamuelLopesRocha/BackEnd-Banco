import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import EMAIL_REMETENTE, EMAIL_SENHA, SMTP_SERVIDOR, SMTP_PORTA

def carregar_template(nome):
    caminho = os.path.join(os.path.dirname(__file__), "templates", "email_boas_vindas.html")

    with open(caminho, "r", encoding="utf-8") as file:
        html = file.read()

    return html.replace("{{nome}}", nome)


def enviar_email(destinatario, nome):
    msg = MIMEMultipart()
    msg["From"] = EMAIL_REMETENTE
    msg["To"] = destinatario
    msg["Subject"] = "🎉 Sua conta no Banco Digital foi criada!"

    html = carregar_template(nome)
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP(SMTP_SERVIDOR, SMTP_PORTA) as server:
        server.starttls()
        server.login(EMAIL_REMETENTE, EMAIL_SENHA)
        server.send_message(msg)

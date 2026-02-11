from pymongo import MongoClient
from config import MONGO_URI, DB_NAME

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

usuarios_collection = db["usuarios"]

def get_usuarios_novos():
    return usuarios_collection.find({
        "email_enviado": {"$ne": True},
        "status_conta": "ATIVA"
    })

def marcar_email_enviado(usuario_id):
    usuarios_collection.update_one(
        {"usuario_id": usuario_id},
        {"$set": {"email_enviado": True}}
    )

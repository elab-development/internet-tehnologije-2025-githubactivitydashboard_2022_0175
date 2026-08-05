import requests

class TelegramService:
    BOT_TOKEN = "8869646586:AAEX0gllwd9B65W1yZLP-YtuaWR0nHAyUqY"
    CHAT_ID = "6522482135"

    @staticmethod
    def send_notification(message: str) -> bool:
        """Šalje notifikaciju na Telegram chat preko Telegram Bot API-ja."""
        if not TelegramService.BOT_TOKEN or "8869646586:AAEX0gllwd9B65W1yZLP-YtuaWR0nHAyUqY" in TelegramService.BOT_TOKEN:
            print("[TelegramService] Bot token nije konfigurisan.")
            return False

        url = f"https://api.telegram.org/bot{TelegramService.BOT_TOKEN}/sendMessage"
        payload = {
            "chat_id": TelegramService.CHAT_ID,
            "text": message,
            "parse_mode": "Markdown"
        }

        try:
            response = requests.post(url, json=payload, timeout=5)
            return response.status_code == 200
        except Exception as e:
            print(f"[TelegramService] Izuzetak pri pozivu Telegram API-ja: {str(e)}")
            return False
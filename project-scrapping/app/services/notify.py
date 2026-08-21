import logging
import os
import smtplib
from email.mime.text import MIMEText

import httpx

logger = logging.getLogger(__name__)

TELEGRAM_CHUNK = 3900


def send_telegram(text: str) -> bool:
    token, chat = os.getenv("TELEGRAM_BOT_TOKEN"), os.getenv("TELEGRAM_CHAT_ID")
    if not token or not chat:
        return False
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    for i in range(0, len(text), TELEGRAM_CHUNK):
        chunk = text[i:i + TELEGRAM_CHUNK]
        try:
            r = httpx.post(url, json={"chat_id": chat, "text": chunk, "parse_mode": "Markdown",
                                      "disable_web_page_preview": True}, timeout=20)
            if r.status_code != 200:
                # Markdown mal formado: reintentar en texto plano
                r = httpx.post(url, json={"chat_id": chat, "text": chunk}, timeout=20)
                if r.status_code != 200:
                    logger.error(f"[Notify] Telegram fallo {r.status_code}: {r.text[:200]}")
                    return False
        except Exception as e:
            logger.error(f"[Notify] Telegram error: {e}")
            return False
    return True


def send_email(subject: str, body: str) -> bool:
    host = os.getenv("BRIEF_SMTP_HOST")
    user = os.getenv("BRIEF_SMTP_USER")
    pwd = os.getenv("BRIEF_SMTP_PASS")
    to = os.getenv("BRIEF_RECIPIENTS")
    if not all([host, user, pwd, to]):
        return False
    msg = MIMEText(body, "plain", "utf-8")
    msg["Subject"] = subject
    msg["From"] = user
    msg["To"] = to
    try:
        with smtplib.SMTP(host, int(os.getenv("BRIEF_SMTP_PORT", "587")), timeout=30) as s:
            s.starttls()
            s.login(user, pwd)
            s.sendmail(user, [x.strip() for x in to.split(",") if x.strip()], msg.as_string())
        return True
    except Exception as e:
        logger.error(f"[Notify] Email error: {e}")
        return False

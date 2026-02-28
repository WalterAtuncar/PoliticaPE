import socket
import threading
import os
import sys

PORT = int(os.getenv('PORT', '5000'))

HEALTH_RESPONSE = (
    b'HTTP/1.1 200 OK\r\n'
    b'Content-Type: application/json\r\n'
    b'Content-Length: 65\r\n'
    b'Connection: close\r\n'
    b'\r\n'
    b'{"status":"ok","service":"Political Data Scraper","version":"1.0.0"}'
)

_health_running = True


def _health_server():
    srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    try:
        srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEPORT, 1)
    except (AttributeError, OSError):
        pass
    srv.settimeout(0.5)
    srv.bind(('0.0.0.0', PORT))
    srv.listen(8)
    sys.stdout.write(f'[serve] Health check ready on :{PORT}\n')
    sys.stdout.flush()

    while _health_running:
        try:
            conn, _ = srv.accept()
            try:
                conn.settimeout(2)
                conn.recv(4096)
                conn.sendall(HEALTH_RESPONSE)
            except Exception:
                pass
            finally:
                try:
                    conn.close()
                except Exception:
                    pass
        except socket.timeout:
            continue
        except Exception:
            break
    try:
        srv.close()
    except Exception:
        pass


t = threading.Thread(target=_health_server, daemon=True)
t.start()

import time
time.sleep(0.1)

import uvicorn

_health_running = False
time.sleep(0.3)

from app.main import app

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=PORT,
        log_level="info",
    )

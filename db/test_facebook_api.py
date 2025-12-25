#!/usr/bin/env python3
"""Test Facebook Graph API connection with configured credentials"""

import os
import requests

GRAPH_API_VERSION = "v19.0"
GRAPH_API_BASE = f"https://graph.facebook.com/{GRAPH_API_VERSION}"

def call_graph_api(endpoint, params=None, timeout=10):
    """Helper function to call Graph API with error handling"""
    url = f"{GRAPH_API_BASE}/{endpoint}"
    try:
        response = requests.get(url, params=params, timeout=timeout)
        data = response.json()
        
        if response.status_code == 200:
            return {"success": True, "data": data, "status": 200}
        else:
            error = data.get("error", {})
            return {
                "success": False,
                "status": response.status_code,
                "error_code": error.get("code"),
                "error_message": error.get("message", "Unknown error"),
                "error_type": error.get("type")
            }
    except requests.exceptions.Timeout:
        return {"success": False, "error_message": "Request timeout"}
    except requests.exceptions.ConnectionError:
        return {"success": False, "error_message": "Connection error"}
    except Exception as e:
        return {"success": False, "error_message": str(e)}

def test_credentials():
    """Check if all required credentials are present"""
    app_id = os.environ.get("FACEBOOK_APP_ID")
    app_secret = os.environ.get("FACEBOOK_APP_SECRET")
    graph_token = os.environ.get("FACEBOOK_GRAPH_TOKEN")
    
    missing = []
    if not app_id: missing.append("FACEBOOK_APP_ID")
    if not app_secret: missing.append("FACEBOOK_APP_SECRET")
    if not graph_token: missing.append("FACEBOOK_GRAPH_TOKEN")
    
    if missing:
        print(f"❌ Credenciales faltantes: {', '.join(missing)}")
        return None
    
    print(f"   App ID: ...{app_id[-6:]}")
    print(f"   Graph Token: ...{graph_token[-8:]}")
    
    return {
        "app_id": app_id,
        "app_secret": app_secret,
        "graph_token": graph_token
    }

def test_token_validity(creds):
    """Test 1: Verify the access token is valid using debug_token endpoint"""
    print("🔄 Test 1: Verificando validez del token...")
    
    app_token = f"{creds['app_id']}|{creds['app_secret']}"
    
    result = call_graph_api("debug_token", {
        "input_token": creds["graph_token"],
        "access_token": app_token
    })
    
    if not result["success"]:
        print(f"❌ Error al verificar token: {result.get('error_message')}")
        if result.get("error_code") == 190:
            print("   💡 El token ha expirado. Genera uno nuevo en Graph API Explorer")
        return False
    
    data = result["data"].get("data", {})
    
    if not data.get("is_valid"):
        print("❌ Token INVÁLIDO")
        error_msg = data.get("error", {}).get("message", "Unknown")
        print(f"   Error: {error_msg}")
        return False
    
    print("✅ Token VÁLIDO")
    
    scopes = data.get("scopes", [])
    print(f"   Permisos: {', '.join(scopes) if scopes else 'Ninguno'}")
    
    expires_at = data.get("expires_at", 0)
    if expires_at == 0:
        print("   Expiración: Nunca (token de larga duración)")
    else:
        from datetime import datetime
        exp_date = datetime.fromtimestamp(expires_at)
        print(f"   Expiración: {exp_date.strftime('%Y-%m-%d %H:%M')}")
    
    required_perms = ["pages_show_list", "pages_read_engagement"]
    missing_perms = [p for p in required_perms if p not in scopes]
    if missing_perms:
        print(f"   ⚠️ Permisos faltantes: {', '.join(missing_perms)}")
        print("   💡 Agrega estos permisos en Graph API Explorer y genera nuevo token")
    
    return True

def test_user_info(creds):
    """Test 2: Get basic user/page information"""
    print("🔄 Test 2: Obteniendo información del usuario...")
    
    result = call_graph_api("me", {
        "access_token": creds["graph_token"],
        "fields": "id,name,email"
    })
    
    if not result["success"]:
        print(f"❌ Error: {result.get('error_message')}")
        return False
    
    data = result["data"]
    print(f"✅ Conectado como: {data.get('name', 'Unknown')}")
    print(f"   ID: {data.get('id')}")
    if data.get("email"):
        print(f"   Email: {data.get('email')}")
    
    return True

def test_pages_list(creds):
    """Test 3: List pages managed by the user (pages_show_list)"""
    print("🔄 Test 3: Listando páginas administradas (pages_show_list)...")
    
    result = call_graph_api("me/accounts", {
        "access_token": creds["graph_token"],
        "fields": "id,name,category,access_token,link"
    })
    
    if not result["success"]:
        error_code = result.get("error_code")
        if error_code in [10, 200]:
            print("❌ Permiso 'pages_show_list' no otorgado")
            print("   💡 Necesitas aprobar este permiso en Graph API Explorer")
            print("   💡 Para usuarios públicos, necesitas pasar App Review")
        else:
            print(f"❌ Error: {result.get('error_message')}")
        return None
    
    pages = result["data"].get("data", [])
    
    if not pages:
        print("⚠️ No se encontraron páginas administradas")
        print("   💡 Asegúrate de tener al menos una página de Facebook")
        return []
    
    print(f"✅ Encontradas {len(pages)} página(s):")
    for i, page in enumerate(pages[:5], 1):
        print(f"   {i}. {page.get('name')} ({page.get('category', 'Sin categoría')})")
        print(f"      ID: {page.get('id')}")
    
    return pages

def test_page_engagement(creds, pages):
    """Test 4: Read page engagement data (pages_read_engagement)"""
    print("🔄 Test 4: Leyendo datos de engagement (pages_read_engagement)...")
    
    if not pages:
        print("⚠️ No hay páginas para probar - saltando test")
        return None
    
    page = pages[0]
    page_id = page.get("id")
    page_token = page.get("access_token")
    page_name = page.get("name")
    
    print(f"   Probando página: {page_name}")
    
    result = call_graph_api(f"{page_id}/feed", {
        "access_token": page_token,
        "fields": "id,message,created_time,shares,reactions.summary(true)",
        "limit": 5
    })
    
    if not result["success"]:
        error_code = result.get("error_code")
        if error_code in [10, 200]:
            print("❌ Permiso 'pages_read_engagement' no otorgado")
            print("   💡 Necesitas aprobar este permiso en Graph API Explorer")
        else:
            print(f"❌ Error: {result.get('error_message')}")
        return False
    
    posts = result["data"].get("data", [])
    
    if not posts:
        print("⚠️ La página no tiene publicaciones")
        return True
    
    print(f"✅ Últimas {len(posts)} publicaciones de '{page_name}':")
    for i, post in enumerate(posts[:3], 1):
        message = post.get("message", "Sin texto")[:60]
        created = post.get("created_time", "")[:10]
        reactions = post.get("reactions", {}).get("summary", {}).get("total_count", 0)
        shares = post.get("shares", {}).get("count", 0)
        print(f"   {i}. [{created}] {message}...")
        print(f"      Reacciones: {reactions} | Compartidos: {shares}")
    
    return True

def test_page_insights(creds, pages):
    """Test 5: Read page insights/metrics"""
    print("🔄 Test 5: Leyendo métricas de la página (insights)...")
    
    if not pages:
        print("⚠️ No hay páginas para probar - saltando test")
        return None
    
    page = pages[0]
    page_id = page.get("id")
    page_token = page.get("access_token")
    
    result = call_graph_api(f"{page_id}/insights", {
        "access_token": page_token,
        "metric": "page_impressions,page_engaged_users,page_fans",
        "period": "day"
    })
    
    if not result["success"]:
        error_code = result.get("error_code")
        if error_code == 100:
            print("⚠️ Insights no disponibles (página muy nueva o sin actividad)")
            return None
        elif error_code in [10, 200]:
            print("❌ Permiso 'read_insights' no otorgado")
        else:
            print(f"⚠️ Error: {result.get('error_message')}")
        return None
    
    insights = result["data"].get("data", [])
    
    if not insights:
        print("⚠️ No hay métricas disponibles")
        return True
    
    print(f"✅ Métricas encontradas:")
    for metric in insights:
        name = metric.get("name", "Unknown")
        values = metric.get("values", [])
        if values:
            latest = values[-1].get("value", 0)
            print(f"   {name}: {latest}")
    
    return True

def main():
    print("=" * 55)
    print("📘 TEST DE CONEXIÓN FACEBOOK GRAPH API")
    print("=" * 55)
    print()
    
    print("🔐 Verificando credenciales...")
    creds = test_credentials()
    if not creds:
        return False
    print()
    
    token_ok = test_token_validity(creds)
    print()
    
    if not token_ok:
        print("⚠️ Token inválido - no se pueden ejecutar más tests")
        return False
    
    user_ok = test_user_info(creds)
    print()
    
    pages = test_pages_list(creds)
    print()
    
    if pages:
        engagement_ok = test_page_engagement(creds, pages)
        print()
        
        insights_ok = test_page_insights(creds, pages)
        print()
    else:
        engagement_ok = None
        insights_ok = None
    
    print("=" * 55)
    print("📊 RESUMEN:")
    print(f"   Token válido: {'✅ OK' if token_ok else '❌ FALLO'}")
    print(f"   Info usuario: {'✅ OK' if user_ok else '❌ FALLO'}")
    print(f"   Lista páginas: {'✅ OK' if pages else '⚠️ Sin páginas' if pages == [] else '❌ FALLO'}")
    print(f"   Engagement: {'✅ OK' if engagement_ok else '⚠️ N/A' if engagement_ok is None else '❌ FALLO'}")
    print(f"   Insights: {'✅ OK' if insights_ok else '⚠️ N/A' if insights_ok is None else '❌ FALLO'}")
    print("=" * 55)
    
    return token_ok and user_ok

if __name__ == "__main__":
    main()

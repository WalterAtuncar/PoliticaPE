#!/usr/bin/env python3
"""Test Instagram Graph API connection with configured credentials"""

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
    """Check if required credentials are present"""
    graph_token = os.environ.get("FACEBOOK_GRAPH_TOKEN")
    ig_token = os.environ.get("INSTAGRAM_ACCESS_TOKEN")
    
    token = ig_token or graph_token
    
    if not token:
        print("❌ Credenciales faltantes: FACEBOOK_GRAPH_TOKEN o INSTAGRAM_ACCESS_TOKEN")
        return None
    
    token_type = "INSTAGRAM_ACCESS_TOKEN" if ig_token else "FACEBOOK_GRAPH_TOKEN"
    print(f"   Usando: {token_type}")
    print(f"   Token: ...{token[-8:]}")
    
    return {"token": token, "token_type": token_type}

def test_get_pages(creds):
    """Test 1: Get Facebook Pages (needed to access Instagram accounts)"""
    print("🔄 Test 1: Obteniendo páginas de Facebook...")
    
    result = call_graph_api("me/accounts", {
        "access_token": creds["token"],
        "fields": "id,name,access_token,instagram_business_account"
    })
    
    if not result["success"]:
        print(f"❌ Error: {result.get('error_message')}")
        return None
    
    pages = result["data"].get("data", [])
    
    if not pages:
        print("⚠️ No tienes páginas de Facebook")
        print("   💡 Necesitas una página de Facebook conectada a Instagram Business")
        return None
    
    pages_with_ig = [p for p in pages if p.get("instagram_business_account")]
    
    print(f"✅ Encontradas {len(pages)} página(s) de Facebook")
    print(f"   Con Instagram Business: {len(pages_with_ig)}")
    
    for page in pages:
        ig_account = page.get("instagram_business_account", {})
        ig_id = ig_account.get("id", "No conectado")
        print(f"   - {page.get('name')}: IG ID = {ig_id}")
    
    return pages

def test_instagram_account(creds, pages):
    """Test 2: Get Instagram Business Account details"""
    print("🔄 Test 2: Obteniendo cuenta de Instagram Business...")
    
    if not pages:
        print("⚠️ No hay páginas disponibles - saltando test")
        return None
    
    pages_with_ig = [p for p in pages if p.get("instagram_business_account")]
    
    if not pages_with_ig:
        print("❌ Ninguna página tiene Instagram Business conectado")
        print()
        print("   📋 Para conectar Instagram a tu página de Facebook:")
        print("   1. Ve a tu página de Facebook → Configuración")
        print("   2. Click en 'Instagram' en el menú izquierdo")
        print("   3. Click en 'Conectar cuenta'")
        print("   4. Inicia sesión en tu cuenta de Instagram Business/Creator")
        print()
        print("   ⚠️ Nota: Solo cuentas Business o Creator funcionan con la API")
        return None
    
    page = pages_with_ig[0]
    ig_id = page["instagram_business_account"]["id"]
    page_token = page.get("access_token")
    
    result = call_graph_api(ig_id, {
        "access_token": page_token,
        "fields": "id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url"
    })
    
    if not result["success"]:
        print(f"❌ Error: {result.get('error_message')}")
        return None
    
    ig_data = result["data"]
    
    print(f"✅ Cuenta de Instagram encontrada:")
    print(f"   Username: @{ig_data.get('username', 'N/A')}")
    print(f"   Nombre: {ig_data.get('name', 'N/A')}")
    print(f"   Seguidores: {ig_data.get('followers_count', 0):,}")
    print(f"   Siguiendo: {ig_data.get('follows_count', 0):,}")
    print(f"   Publicaciones: {ig_data.get('media_count', 0):,}")
    
    return {"ig_id": ig_id, "page_token": page_token, "ig_data": ig_data}

def test_instagram_media(creds, ig_info):
    """Test 3: Get recent Instagram media"""
    print("🔄 Test 3: Obteniendo publicaciones recientes...")
    
    if not ig_info:
        print("⚠️ No hay cuenta de Instagram - saltando test")
        return None
    
    result = call_graph_api(f"{ig_info['ig_id']}/media", {
        "access_token": ig_info["page_token"],
        "fields": "id,caption,media_type,timestamp,like_count,comments_count,permalink",
        "limit": 5
    })
    
    if not result["success"]:
        error_code = result.get("error_code")
        if error_code == 10:
            print("❌ Permiso 'instagram_basic' no otorgado")
        else:
            print(f"❌ Error: {result.get('error_message')}")
        return False
    
    media = result["data"].get("data", [])
    
    if not media:
        print("⚠️ La cuenta no tiene publicaciones")
        return True
    
    print(f"✅ Últimas {len(media)} publicaciones:")
    for i, post in enumerate(media[:5], 1):
        caption = (post.get("caption") or "Sin caption")[:50]
        media_type = post.get("media_type", "Unknown")
        likes = post.get("like_count", 0)
        comments = post.get("comments_count", 0)
        timestamp = post.get("timestamp", "")[:10]
        
        print(f"   {i}. [{timestamp}] {media_type}")
        print(f"      {caption}...")
        print(f"      ❤️ {likes} | 💬 {comments}")
    
    return True

def test_instagram_insights(creds, ig_info):
    """Test 4: Get Instagram account insights"""
    print("🔄 Test 4: Obteniendo métricas de la cuenta...")
    
    if not ig_info:
        print("⚠️ No hay cuenta de Instagram - saltando test")
        return None
    
    result = call_graph_api(f"{ig_info['ig_id']}/insights", {
        "access_token": ig_info["page_token"],
        "metric": "impressions,reach,profile_views",
        "period": "day"
    })
    
    if not result["success"]:
        error_code = result.get("error_code")
        if error_code == 10:
            print("⚠️ Permiso 'instagram_manage_insights' no otorgado")
        elif error_code == 100:
            print("⚠️ Insights no disponibles (cuenta muy nueva o sin actividad)")
        else:
            print(f"⚠️ Error: {result.get('error_message')}")
        return None
    
    insights = result["data"].get("data", [])
    
    if not insights:
        print("⚠️ No hay métricas disponibles")
        return True
    
    print(f"✅ Métricas de Instagram:")
    for metric in insights:
        name = metric.get("name", "Unknown")
        values = metric.get("values", [])
        if values:
            latest = values[-1].get("value", 0)
            print(f"   {name}: {latest:,}")
    
    return True

def main():
    print("=" * 55)
    print("📸 TEST DE CONEXIÓN INSTAGRAM GRAPH API")
    print("=" * 55)
    print()
    
    print("🔐 Verificando credenciales...")
    creds = test_credentials()
    if not creds:
        return False
    print()
    
    pages = test_get_pages(creds)
    print()
    
    ig_info = test_instagram_account(creds, pages)
    print()
    
    if ig_info:
        media_ok = test_instagram_media(creds, ig_info)
        print()
        
        insights_ok = test_instagram_insights(creds, ig_info)
        print()
    else:
        media_ok = None
        insights_ok = None
    
    print("=" * 55)
    print("📊 RESUMEN:")
    print(f"   Páginas Facebook: {'✅ OK' if pages else '❌ FALLO'}")
    print(f"   Cuenta Instagram: {'✅ OK' if ig_info else '⚠️ No conectada'}")
    print(f"   Publicaciones: {'✅ OK' if media_ok else '⚠️ N/A' if media_ok is None else '❌ FALLO'}")
    print(f"   Insights: {'✅ OK' if insights_ok else '⚠️ N/A' if insights_ok is None else '❌ FALLO'}")
    print("=" * 55)
    
    if not ig_info:
        print()
        print("💡 PRÓXIMOS PASOS:")
        print("   1. Conecta una cuenta de Instagram Business a tu página de Facebook")
        print("   2. Genera un nuevo token en Graph API Explorer con permisos:")
        print("      - instagram_basic")
        print("      - instagram_manage_insights")
        print("      - pages_show_list")
    
    return bool(ig_info)

if __name__ == "__main__":
    main()

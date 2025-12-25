#!/usr/bin/env python3
"""Test X/Twitter API connection with configured credentials"""

import os
import requests

def test_bearer_token():
    """Test Bearer Token authentication with X API v2"""
    bearer_token = os.environ.get("X_BEARER_TOKEN")
    
    if not bearer_token:
        print("❌ X_BEARER_TOKEN not found in environment")
        return False
    
    print("🔄 Testing Bearer Token authentication...")
    
    headers = {
        "Authorization": f"Bearer {bearer_token}"
    }
    
    url = "https://api.twitter.com/2/tweets/search/recent"
    params = {
        "query": "peru politica lang:es",
        "max_results": 10,
        "tweet.fields": "created_at,author_id,public_metrics"
    }
    
    try:
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code == 200:
            data = response.json()
            tweet_count = len(data.get("data", []))
            print(f"✅ Bearer Token VÁLIDO - {tweet_count} tweets encontrados")
            
            if tweet_count > 0:
                print("\n📝 Últimos tweets sobre política en Perú:")
                for i, tweet in enumerate(data.get("data", [])[:3], 1):
                    text = tweet.get("text", "")[:100]
                    print(f"   {i}. {text}...")
            return True
        elif response.status_code == 401:
            print("❌ Bearer Token INVÁLIDO - Error de autenticación")
            print(f"   Respuesta: {response.text}")
            return False
        elif response.status_code == 403:
            print("⚠️ Bearer Token válido pero acceso denegado")
            print("   Puede que necesites un plan de pago para Search API")
            print(f"   Respuesta: {response.text}")
            return False
        elif response.status_code == 429:
            print("⚠️ Rate limit alcanzado - Las credenciales son válidas")
            return True
        else:
            print(f"❌ Error {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False

def test_oauth_credentials():
    """Test OAuth 1.0a credentials"""
    api_key = os.environ.get("X_API_KEY")
    api_secret = os.environ.get("X_API_SECRET")
    access_token = os.environ.get("X_ACCESS_TOKEN")
    access_secret = os.environ.get("X_ACCESS_TOKEN_SECRET")
    
    missing = []
    if not api_key: missing.append("X_API_KEY")
    if not api_secret: missing.append("X_API_SECRET")
    if not access_token: missing.append("X_ACCESS_TOKEN")
    if not access_secret: missing.append("X_ACCESS_TOKEN_SECRET")
    
    if missing:
        print(f"❌ Credenciales faltantes: {', '.join(missing)}")
        return False
    
    print("🔄 Testing OAuth 1.0a credentials...")
    print(f"   API Key: ...{api_key[-6:]}")
    print(f"   Access Token: ...{access_token[-8:]}")
    
    try:
        from requests_oauthlib import OAuth1
        
        auth = OAuth1(
            api_key,
            api_secret,
            access_token,
            access_secret
        )
        
        url = "https://api.twitter.com/2/users/me"
        response = requests.get(url, auth=auth)
        
        if response.status_code == 200:
            data = response.json()
            username = data.get("data", {}).get("username", "unknown")
            print(f"✅ OAuth VÁLIDO - Conectado como @{username}")
            return True
        elif response.status_code == 401:
            print("❌ OAuth INVÁLIDO - Credenciales incorrectas")
            return False
        elif response.status_code == 403:
            print("⚠️ OAuth válido pero endpoint restringido")
            return True
        else:
            print(f"⚠️ Respuesta {response.status_code}: {response.text[:200]}")
            return False
            
    except ImportError:
        print("⚠️ requests_oauthlib no instalado, saltando test OAuth")
        return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("=" * 50)
    print("🐦 TEST DE CONEXIÓN X/TWITTER API")
    print("=" * 50)
    print()
    
    bearer_ok = test_bearer_token()
    print()
    
    oauth_ok = test_oauth_credentials()
    print()
    
    print("=" * 50)
    print("📊 RESUMEN:")
    print(f"   Bearer Token: {'✅ OK' if bearer_ok else '❌ FALLO'}")
    print(f"   OAuth 1.0a: {'✅ OK' if oauth_ok else '⚠️ No probado' if oauth_ok is None else '❌ FALLO'}")
    print("=" * 50)
    
    return bearer_ok

if __name__ == "__main__":
    main()

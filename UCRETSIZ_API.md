# 🆓 Ücretsiz API Alternatifleri

OpenAI ücretli ama bu ücretsiz alternatifleri kullanabilirsin!

## 1. Hugging Face (ÖNERİLEN) 🤗

### Avantajlar:
- ✅ Tamamen ücretsiz
- ✅ Sınırsız kullanım
- ✅ Güçlü modeller
- ✅ Türkçe desteği

### Kurulum:
1. https://huggingface.co/ adresine git
2. "Sign Up" ile ücretsiz hesap aç
3. Profil → Settings → Access Tokens
4. "New token" → "Read" seç → Oluştur
5. Token'ı kopyala (hf_xxxxxxxxxxxxx)

### Kod:
`app.js` dosyasında şu satırı bul:
```javascript
const API_KEY = 'YOUR_API_KEY_HERE';
const API_URL = 'https://api.openai.com/v1/chat/completions';
```

Şununla değiştir:
```javascript
const API_KEY = 'hf_xxxxxxxxxxxxx'; // Senin token'ın
const API_URL = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';
const API_TYPE = 'huggingface';
```

---

## 2. Groq (SÜPER HIZLI) ⚡

### Avantajlar:
- ✅ Ücretsiz
- ✅ Çok hızlı (saniyeler içinde)
- ✅ Günde 14,400 istek
- ✅ Llama 3 modeli

### Kurulum:
1. https://console.groq.com/ adresine git
2. Google ile giriş yap (ücretsiz)
3. "API Keys" → "Create API Key"
4. Anahtarı kopyala (gsk_xxxxxxxxxxxxx)

### Kod:
```javascript
const API_KEY = 'gsk_xxxxxxxxxxxxx';
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const API_TYPE = 'groq';
```

---

## 3. Cohere (KOLAY) 🎯

### Avantajlar:
- ✅ Ücretsiz
- ✅ Ayda 100 istek
- ✅ Kolay kurulum

### Kurulum:
1. https://dashboard.cohere.com/ adresine git
2. "Sign Up" ile kayıt ol
3. Dashboard'dan API key al
4. Anahtarı kopyala

### Kod:
```javascript
const API_KEY = 'xxxxxxxxxxxxx';
const API_URL = 'https://api.cohere.ai/v1/generate';
const API_TYPE = 'cohere';
```

---

## 4. Ollama (TAMAMEN OFFLINE) 💻

### Avantajlar:
- ✅ Tamamen ücretsiz
- ✅ İnternet gerektirmez
- ✅ Gizlilik
- ✅ Sınırsız kullanım

### Kurulum:
1. https://ollama.ai/ adresinden indir
2. Kur ve çalıştır
3. Terminal'de: `ollama run llama2`
4. API otomatik localhost:11434'te çalışır

### Kod:
```javascript
const API_KEY = 'not-needed';
const API_URL = 'http://localhost:11434/api/generate';
const API_TYPE = 'ollama';
```

---

## Hangisini Seçmeliyim?

### En İyi Seçenekler:
1. **Groq** - En hızlı, günlük limit yeterli
2. **Hugging Face** - Sınırsız, güçlü
3. **Ollama** - Offline, gizlilik

### Karşılaştırma:
| Servis | Ücretsiz | Hız | Limit | Kurulum |
|--------|----------|-----|-------|---------|
| Groq | ✅ | ⚡⚡⚡ | 14,400/gün | Kolay |
| Hugging Face | ✅ | ⚡⚡ | Sınırsız | Kolay |
| Cohere | ✅ | ⚡⚡ | 100/ay | Kolay |
| Ollama | ✅ | ⚡ | Sınırsız | Orta |

---

## Hızlı Başlangıç (Groq Öneriyorum!)

1. https://console.groq.com/ → Giriş yap
2. API Key al
3. `app.js` dosyasını aç
4. Şunu değiştir:

```javascript
const API_KEY = 'gsk_xxxxxxxxxxxxx'; // Senin anahtarın
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
```

5. Kaydet ve test et!

---

## Sorun mu var?

- **"Invalid API key"** → Anahtarı doğru kopyaladın mı?
- **"Rate limit"** → Groq kullan, daha yüksek limit
- **Yavaş** → Groq en hızlısı
- **Offline çalışsın** → Ollama kur

---

## Başarılar! 🚀

Artık tamamen ücretsiz AI kullanabilirsin! 🕊️

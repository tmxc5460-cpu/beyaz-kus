# 🕊️ Beyaz Kuş - API Kurulum Rehberi

## OpenAI API Anahtarı Nasıl Alınır?

### 1. Adım: OpenAI Hesabı Oluştur
- https://platform.openai.com/ adresine git
- "Sign Up" butonuna tıkla
- E-posta ve şifre ile kayıt ol

### 2. Adım: API Anahtarı Oluştur
- Giriş yaptıktan sonra sağ üstteki profil ikonuna tıkla
- "API Keys" seçeneğine tıkla
- "Create new secret key" butonuna tıkla
- Anahtarı kopyala (bir daha göremezsin!)

### 3. Adım: Anahtarı Projeye Ekle
1. `app.js` dosyasını aç
2. En üstte şu satırı bul:
   ```javascript
   const API_KEY = 'YOUR_API_KEY_HERE';
   ```
3. `YOUR_API_KEY_HERE` yerine kopyaladığın anahtarı yapıştır:
   ```javascript
   const API_KEY = 'sk-proj-xxxxxxxxxxxxx';
   ```
4. Dosyayı kaydet

### 4. Adım: Kredi Ekle
- OpenAI API kullanımı ücretlidir
- https://platform.openai.com/account/billing adresinden kredi kartı ekle
- Minimum $5 yükleme yapabilirsin
- GPT-4o kullanımı: ~$0.005 per mesaj (çok ucuz!)

## Önemli Notlar

⚠️ **GÜVENLİK:**
- API anahtarını kimseyle paylaşma
- GitHub'a yüklerken `.gitignore` dosyasına `app.js` ekle
- Ya da anahtarı environment variable olarak kullan

💰 **MALİYET:**
- GPT-4o: $2.50 / 1M input tokens, $10 / 1M output tokens
- Ortalama bir sohbet: ~1000 token = $0.005
- 100 mesaj = ~$0.50 (çok ucuz!)

🎯 **ALTERNATİFLER:**
- Demo mod: API anahtarı olmadan temel özellikler
- Ücretsiz API'ler: Hugging Face, Cohere (sınırlı)
- Kendi modelini host et: Ollama, LM Studio

## Test Et

API anahtarını ekledikten sonra:
1. `index.html` dosyasını tarayıcıda aç
2. "Python ile web scraping nasıl yapılır?" diye sor
3. Detaylı, profesyonel cevap almalısın!

## Sorun Giderme

**"Invalid API key" hatası:**
- Anahtarı doğru kopyaladığından emin ol
- Başında/sonunda boşluk olmamalı
- Tırnak işaretleri içinde olmalı

**"Insufficient quota" hatası:**
- Hesabına kredi eklemen gerekiyor
- Billing sayfasından ödeme yöntemi ekle

**Yavaş yanıt:**
- Normal, GPT-4o düşünüyor
- GPT-3.5-turbo daha hızlı ama daha az yetenekli

## Başarılar! 🚀

Artık Beyaz Kuş gerçek bir AI ustası! 🕊️

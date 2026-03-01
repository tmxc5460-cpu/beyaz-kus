# 🚀 Beyaz Kuş - GitHub Pages ile Yayınlama

GitHub Pages ile **TAMAMEN ÜCRETSİZ** web sitesi yayınlayın!

## 📋 Gereksinimler
- GitHub hesabı (ücretsiz)
- Proje dosyaları

## 🎯 Adım Adım Kurulum

### 1. GitHub Hesabı Oluştur
1. https://github.com adresine git
2. "Sign up" tıkla
3. Email, kullanıcı adı, şifre gir
4. Hesabını doğrula

### 2. Yeni Repository (Depo) Oluştur
1. GitHub'da sağ üstte "+" işaretine tıkla
2. "New repository" seç
3. Repository adı: `beyazkus` (veya istediğin ad)
4. ✅ "Public" seçili olsun
5. ❌ "Add a README file" işaretleme
6. "Create repository" tıkla

### 3. Dosyaları Yükle

#### Yöntem 1: Web Arayüzü (Kolay)
1. Repository sayfasında "uploading an existing file" linkine tıkla
2. Şu dosyaları sürükle-bırak:
   - `index.html`
   - `login.html`
   - `app.js`
   - `style.css`
   - `manifest.json`
   - `sw.js`
   - `icon-192.png` (oluşturacağız)
   - `icon-512.png` (oluşturacağız)
3. "Commit changes" tıkla

#### Yöntem 2: Git Komutları (Terminal)
```bash
# Repository'yi klonla
git clone https://github.com/KULLANICI_ADIN/beyazkus.git
cd beyazkus

# Dosyaları kopyala (proje klasöründen)
cp /path/to/project/* .

# Git'e ekle
git add .
git commit -m "Beyaz Kuş ilk yükleme"
git push origin main
```

### 4. GitHub Pages Aktif Et
1. Repository sayfasında "Settings" tıkla
2. Sol menüden "Pages" seç
3. "Source" altında "Deploy from a branch" seç
4. "Branch" kısmında "main" seç
5. Klasör: "/ (root)" seç
6. "Save" tıkla

### 5. Web Sitesi Hazır! 🎉
- 2-3 dakika bekle
- Siteniz yayında: `https://KULLANICI_ADIN.github.io/beyazkus/`

## 📱 Uygulama Olarak Yükleme

### Mobil (Android/iOS)
1. Web sitesini aç
2. Tarayıcı menüsünden "Ana ekrana ekle" seç
3. Uygulama gibi çalışır!

### Bilgisayar (Chrome/Edge)
1. Web sitesini aç
2. Adres çubuğunda "Yükle" ikonuna tıkla
3. Masaüstü uygulaması gibi çalışır!

## 🔧 İkonları Oluştur

1. `create-icons.html` dosyasını tarayıcıda aç
2. İki ikonu indir: `icon-192.png` ve `icon-512.png`
3. Bu dosyaları da GitHub'a yükle

## 🎨 Özelleştirme

### Site Adını Değiştir
`manifest.json` dosyasında:
```json
{
  "name": "Yeni İsim",
  "short_name": "Kısa İsim"
}
```

### Renkleri Değiştir
`style.css` dosyasında gradient renklerini değiştir.

## 🔄 Güncelleme Yapmak

### Web Arayüzü
1. GitHub'da dosyaya tıkla
2. Kalem ikonuna tıkla (Edit)
3. Değişiklikleri yap
4. "Commit changes" tıkla

### Terminal
```bash
# Değişiklikleri yap
git add .
git commit -m "Güncelleme açıklaması"
git push origin main
```

## 🌐 Özel Domain (İsteğe Bağlı)

Kendi domain'iniz varsa (örn: beyazkus.com):

1. Domain sağlayıcınızda CNAME kaydı ekle:
   - Host: `www`
   - Value: `KULLANICI_ADIN.github.io`

2. GitHub Pages ayarlarında:
   - "Custom domain" kısmına domain'inizi yazın
   - "Enforce HTTPS" işaretle

## ❓ Sorun Giderme

### Site açılmıyor
- 5 dakika bekleyin
- Settings > Pages'de "Your site is live at..." yazısını kontrol edin
- `index.html` dosyasının root klasörde olduğundan emin olun

### Uygulama yüklenmiyor
- `manifest.json` ve `sw.js` dosyalarının yüklendiğinden emin olun
- İkon dosyalarının (`icon-192.png`, `icon-512.png`) olduğundan emin olun
- HTTPS üzerinden eriştiğinizden emin olun

### Değişiklikler görünmüyor
- Tarayıcı cache'ini temizleyin (Ctrl+Shift+Delete)
- Gizli pencerede açın
- 5-10 dakika bekleyin

## 🎯 Sonuç

✅ Tamamen ücretsiz
✅ Sınırsız trafik
✅ Otomatik HTTPS
✅ Mobil ve masaüstü uygulama
✅ Kolay güncelleme

**Site linkiniz:** `https://KULLANICI_ADIN.github.io/beyazkus/`

Herkesle paylaşabilirsiniz! 🚀

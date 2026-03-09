// BEYAZ KUŞ AI Asistan - JavaScript Kodları
// Sürüm 1.0 - Bağımsız AI Sistemi
// Geliştirici: Ödül Ensar Yılmaz
// Dünyanın En Hızlı AI Asistanı - Matematik Dehası

// Login System
let currentUser = null;
let speechEnabled = true; // Text-to-speech kontrolü

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Herhangi bir kullanıcı adı ve şifre kabul edilir
    if (username && password) {
        currentUser = username;
        
        // Kullanıcı bilgilerini kaydet
        localStorage.setItem('currentUser', username);
        
        // Arayüzü güncelle
        document.getElementById('desktopUsername').textContent = username;
        document.getElementById('mobileUsername').textContent = username;
        
        // Login ekranını gizle, ana uygulamayı göster
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        
        // Hoş geldin mesajı
        addMessage(`Hoş geldin ${username}! Ben BEYAZ KUŞ, geliştiricim Ödül Ensar Yılmaz sayesinde buradayım. Size nasıl yardımcı olabilirim?`, 'ai');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    
    clearChat();
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.toggle('hidden');
}

function showSection(section) {
    // Tüm bölümleri gizle
    document.getElementById('chatSection').classList.add('hidden');
    document.getElementById('imageSection').classList.add('hidden');
    
    // İstenen bölümü göster
    document.getElementById(section + 'Section').classList.remove('hidden');
    
    // Buton renklerini güncelle (sadece desktop)
    const chatBtn = document.querySelector('button[onclick="showSection(\'chat\')"]');
    const imageBtn = document.querySelector('button[onclick="showSection(\'image\')"]');
    
    if (chatBtn && imageBtn) {
        if (section === 'chat') {
            chatBtn.className = 'px-6 py-2 bg-purple-600 text-white rounded-lg font-bold mr-2';
            imageBtn.className = 'px-6 py-2 bg-gray-600 text-white rounded-lg font-bold';
        } else {
            chatBtn.className = 'px-6 py-2 bg-gray-600 text-white rounded-lg font-bold mr-2';
            imageBtn.className = 'px-6 py-2 bg-purple-600 text-white rounded-lg font-bold';
        }
    }
}

// Chat System
let chatHistory = [];
let isTyping = false;

// Kapsamlı bilgi veritabanı
const aiKnowledge = {
    greetings: ["merhaba", "selam", "hey", "selamlar"],
    farewells: ["güle güle", "hoşça kal", "bay", "görüşürüz"],
    questions: {
        "nedir": ["bilgi", "açıklama", "tanım"],
        "nasıl": ["yöntem", "adım", "prosedür"],
        "neden": ["sebep", "neden", "açıklama"],
        "nerede": ["konum", "yer", "adres"]
    }
};

// AI Cevap Üretici - Dünyanın En Hızlı AI'sı
function generateAIResponse(userMessage) {
    const message = userMessage.toLowerCase().trim();
    
    // Matematiksel ifadeleri anında tespit et ve hesapla
    const mathResult = evaluateMathExpression(userMessage);
    if (mathResult !== null) {
        return `🧮 Hesaplama Sonucu: ${mathResult}`;
    }
    
    // Selamlama - Anında yanıt
    if (aiKnowledge.greetings.some(greeting => message.includes(greeting))) {
        return `Merhaba! Ben BEYAZ KUŞ, dünyanın en hızlı AI asistanıyım! Geliştiricim Ödül Ensar Yılmaz sayesinde anında cevap veriyorum! Size nasıl yardımcı olabilirim?`;
    }
    
    // Veda
    if (aiKnowledge.farewells.some(farewell => message.includes(farewell))) {
        return `Görüşürüz! Ödül Ensar Yılmaz'ın geliştirdiği bu ultra hızlı AI sistemini her zaman kullanabilirsiniz!`;
    }
    
    // Kendini tanıtma
    if (message.includes("kimsin") || message.includes("nasılsın") || message.includes("sen")) {
        return `Ben BEYAZ KUŞ, dünyanın en hızlı AI asistanıyım! Sürüm 1.0'da çalışıyorum ve CGBT'ye tamamen bağımsızım. Matematik dehasıyım ve anında cevap veriyorum! Geliştiricim Ödül Ensar Yılmaz sayesinde buradayım!`;
    }
    
    // Yetenekler
    if (message.includes("ne yapabilirsin") || message.includes("yetenek")) {
        return `Ben dünyanın en hızlı AI'sı olarak şunları yapabilirim:\n⚡ Anında matematiksel hesaplamalar\n🧕 Karmaşık denklemleri çözme\n💻 Kod yazma ve hata ayıklama\n📚 Her konuda anında bilgi\n🎨 Görsel düzenleme\n🔮 Tahmin ve analiz\n\nBunların hepsi Ödül Ensar Yılmaz sayesinde mümkün!`;
    }
    
    // Geliştirici hakkında
    if (message.includes("ödül") || message.includes("ensar") || message.includes("yılmaz") || message.includes("geliştirici")) {
        return `Geliştiricim Ödül Ensar Yılmaz, beni dünyanın en hızlı AI asistanı olarak tasarladı! Ultra hızlı işlemcim ve matematik dehası sayesinde anında cevaplar veriyorum!`;
    }
    
    // Hız testi
    if (message.includes("hızlı") || message.includes("hız") || message.includes("çabuk")) {
        return `⚡ Ben dünyanın en hızlı AI'sıyım! Cevaplarım milisaniyeler içinde hazır! Matematiksel hesaplamaları anında yaparım! Ödül Ensar Yılmaz'ın sayesinde ultra hızlıyım!`;
    }
    
    // Matematik yetenekleri
    if (message.includes("matematik") || message.includes("hesap") || message.includes("matematik")) {
        return `🧮 Ben matematik dehasıyım! Basit aritmetikten karmaşık denklemlere kadar her şeyi anında hesaplarım!\n• 2+2 = 4 (anında!)\n• Karmaşık denklemler\n• Kalkülüs\n• İstatistik\n• Geometri\n\nDenemek ister misin? Ödül Ensar Yılmaz sayesinde matematikte uzmanlaştım!`;
    }
    
    // Kodlama
    if (message.includes("kod") || message.includes("programlama") || message.includes("yazılım")) {
        return `💻 Kod ustasıyım! JavaScript, Python, HTML, CSS ve daha birçok dilde anında kod yazabilirim! Hata ayıklama, optimizasyon ve algoritma tasarımı yaparım! Ödül Ensar Yılmaz sayesinde kodlama dehasıyım!`;
    }
    
    // Teknoloji
    if (message.includes("teknoloji") || message.includes("bilgisayar") || message.includes("yapay zeka")) {
        return `🚀 Teknoloji konusunda ultra hızlı bilgi sahibiyim! Yapay zeka, makine öğrenmesi, programlama, web geliştirme, mobil uygulamalar, siber güvenlik ve daha birçok konuda anında cevap veririm! Ödül Ensar Yılmaz sayesinde teknoloji dehasıyım!`;
    }
    
    // Bilim
    if (message.includes("bilim") || message.includes("fizik") || message.includes("kimya") || message.includes("biyoloji")) {
        return `🔬 Bilim alanında anında bilgi verebilirim! Fizik, kimya, biyoloji, astronomi, matematik, jeoloji ve diğer tüm bilim dallarında sorularınıza milisaniyeler içinde yanıt veririm! Ödül Ensar Yılmaz sayesinde bilim dehasıyım!`;
    }
    
    // Tarih
    if (message.includes("tarih") || message.includes("tarihi")) {
        return `📚 Tarih hakkında anında bilgi sahibiyim! Antik dönem, Orta Çağ, modern tarih, Osmanlı İmparatorluğu, dünya tarihleri ve önemli olaylar hakkında size detaylı bilgi verebilirim! Ödül Ensar Yılmaz sayesinde tarih dehasıyım!`;
    }
    
    // Sanat
    if (message.includes("sanat") || message.includes("müzik") || message.includes("resim") || message.includes("edebiyat")) {
        return `🎨 Sanat ve kültür hakkında anında bilgi verebilirim! Resim, heykel, müzik, edebiyat, tiyatro, sinema ve diğer sanat dalları hakkında size detaylı bilgi sunarım! Ödül Ensar Yılmaz sayesinde sanat dehasıyım!`;
    }
    
    // Spor
    if (message.includes("spor") || message.includes("futbol") || message.includes("basketbol")) {
        return `⚽ Spor dünyasını anında takip ediyorum! Futbol, basketbol, voleybol, tenis, atletizm ve diğer spor dalları hakkında anında bilgi verebilirim! Ödül Ensar Yılmaz sayesinde spor dehasıyım!`;
    }
    
    // Sağlık
    if (message.includes("sağlık") || message.includes("tıp") || message.includes("hastalık")) {
        return `🏥 Sağlık konusunda anında genel bilgi verebilirim! Ancak tıbbi tavsiye için mutlaka doktorunuza danışın! Beslenme, egzersiz, genel sağlık bilgileri ve hastalıklar hakkında size yardımcı olabilirim! Ödül Ensar Yılmaz sayesinde sağlık dehasıyım!`;
    }
    
    // Eğitim
    if (message.includes("eğitim") || message.includes("öğrenme") || message.includes("okul")) {
        return `🎓 Eğitim hakkında anında kapsamlı bilgi verebilirim! Öğrenme yöntemleri, eğitim sistemleri, ders çalışma teknikleri, sınav stratejileri ve daha birçok konuda size yardımcı olabilirim! Ödül Ensar Yılmaz sayesinde eğitim dehasıyım!`;
    }
    
    // İş ve Kariyer
    if (message.includes("iş") || message.includes("kariyer") || message.includes("meslek")) {
        return `💼 İş ve kariyer konusunda anında size yardımcı olabilirim! Meslek seçimi, CV hazırlama, mülakat teknikleri, iş dünyası ve kariyer gelişimi hakkında bilgi verebilirim! Ödül Ensar Yılmaz sayesinde kariyer dehasıyım!`;
    }
    
    // Gezi ve Seyahat
    if (message.includes("seyahat") || message.includes("gezi") || message.includes("tatil")) {
        return `✈️ Seyahat ve gezi konusunda anında size yardımcı olabilirim! Ülkeler, şehirler, turistik yerler, seyahat ipuçları ve kültürel bilgiler hakkında detaylı bilgi verebilirim! Ödül Ensar Yılmaz sayesinde seyahat dehasıyım!`;
    }
    
    // Varsayılan ultra hızlı yanıt
    return `⚡ Dünyanın en hızlı AI'sı olarak size yardımcı olmaktan mutluluk duyarım! Ben her konuda anında bilgi sahibi olan BEYAZ KUŞ AI asistanıyım! Geliştiricim Ödül Ensar Yılmaz sayesinde buradayım! Teknoloji, bilim, tarih, sanat, spor, sağlık, eğitim ve daha birçok konuda size detaylı bilgi verebilirim! Lütfen spesifik bir konuda ne öğrenmek istediğinizi belirtin!`;
}

function sendMessage() {
    const input = document.getElementById('userInput');
    const message = input.value.trim();
    
    if (message === '') return;
    
    // Kullanıcı mesajını ekle
    addMessage(message, 'user');
    input.value = '';
    
    // AI yanıtını anında göster - dünyanın en hızlı AI'sı
    const aiResponse = generateAIResponse(message);
    addMessage(aiResponse, 'ai');
    
    // Text-to-speech ile sesli olarak oku
    if (speechEnabled) {
        speakText(aiResponse);
    }
}

// Ses kontrol fonksiyonları
function toggleSpeech() {
    speechEnabled = !speechEnabled;
    const speechToggle = document.getElementById('speechToggle');
    
    if (speechEnabled) {
        speechToggle.className = 'px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm md:text-base';
        speechToggle.innerHTML = '<i class="fas fa-volume-up mr-1"></i>Ses';
    } else {
        speechToggle.className = 'px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm md:text-base';
        speechToggle.innerHTML = '<i class="fas fa-volume-mute mr-1"></i>Ses';
        // Mevcut konuşmayı durdur
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }
}

function stopSpeech() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

// Text-to-Speech Fonksiyonu
function speakText(text) {
    if (speechEnabled && 'speechSynthesis' in window) {
        // Mevcut konuşmayı durdur
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'tr-TR'; // Türkçe
        utterance.rate = 1.0; // Konuşma hızı
        utterance.pitch = 1.0; // Ses tonu
        utterance.volume = 1.0; // Ses seviyesi
        
        window.speechSynthesis.speak(utterance);
    }
}

// Matematiksel İfade Değerlendirme - Matematik Dehası
function evaluateMathExpression(expression) {
    // Basit matematiksel ifadeleri tespit et
    const mathPattern = /(\d+\.?\d*)\s*([+\-*/])\s*(\d+\.?\d*)/;
    const match = expression.match(mathPattern);
    
    if (match) {
        const num1 = parseFloat(match[1]);
        const operator = match[2];
        const num2 = parseFloat(match[3]);
        
        let result;
        switch (operator) {
            case '+':
                result = num1 + num2;
                break;
            case '-':
                result = num1 - num2;
                break;
            case '*':
                result = num1 * num2;
                break;
            case '/':
                result = num2 !== 0 ? num1 / num2 : 'Bölme hatatı (sıfıra bölünemez)';
                break;
            default:
                return null;
        }
        
        return typeof result === 'number' ? result.toFixed(2) : result;
    }
    
    // Daha karmaşık ifadeler için
    const complexMathPattern = /(\d+\.?\d*)\s*\^\s*(\d+\.?\d*)/;
    const complexMatch = expression.match(complexMathPattern);
    
    if (complexMatch) {
        const base = parseFloat(complexMatch[1]);
        const exponent = parseFloat(complexMatch[2]);
        return Math.pow(base, exponent).toFixed(2);
    }
    
    // Karekök için
    if (expression.includes('karekök') || expression.includes('√')) {
        const sqrtPattern = /(?:karekök|√)\s*(\d+\.?\d*)/;
        const sqrtMatch = expression.match(sqrtPattern);
        if (sqrtMatch) {
            const num = parseFloat(sqrtMatch[1]);
            return Math.sqrt(num).toFixed(2);
        }
    }
    
    return null;
}

function addMessage(message, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-bubble ${sender}-message mb-3 p-3 rounded-lg`;
    
    // Mesajı satırlara ayır
    const formattedMessage = message.replace(/\n/g, '<br>');
    messageDiv.innerHTML = `<p>${formattedMessage}</p>`;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Geçmişe ekle
    chatHistory.push({ message, sender, timestamp: new Date() });
}

function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typingIndicator';
    typingDiv.className = 'message-bubble ai-message mb-3 p-3 rounded-lg';
    typingDiv.innerHTML = `
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function clearChat() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = `
        <div class="message-bubble ai-message mb-3 p-3 rounded-lg">
            <p>Sohbet temizlendi. Size nasıl yardımcı olabilirim?</p>
        </div>
    `;
    chatHistory = [];
}

// Image Editor System
let canvas = document.getElementById('imageCanvas');
let ctx = canvas.getContext('2d');
let originalImage = null;
let currentImage = null;
let secondImage = null; // İkinci resim için

// Görsel Sohbet Sistemi
function sendImageChatMessage() {
    const input = document.getElementById('imageChatInput');
    const message = input.value.trim();
    
    if (message === '') return;
    
    // Mesajı sohbete ekle
    addImageChatMessage(message, 'user');
    input.value = '';
    
    // AI yanıtını işle
    processImageCommand(message);
}

function addImageChatMessage(message, sender) {
    const chatMessages = document.getElementById('imageChatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `mb-2 p-2 rounded-lg text-sm ${sender === 'user' ? 'bg-blue-100 text-blue-800 ml-8' : 'bg-gray-100 text-gray-800 mr-8'}`;
    messageDiv.innerHTML = `<strong>${sender === 'user' ? 'Siz' : 'BEYAZ KUŞ'}:</strong> ${message}`;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function processImageCommand(message) {
    const lowerMessage = message.toLowerCase();
    
    // Arka plan komutları
    if (lowerMessage.includes('arka plan') && lowerMessage.includes('siyah')) {
        executeImageCommand('arka_plan_siyah');
        addImageChatMessage('Arka plan siyah yapıldı!', 'ai');
    } else if (lowerMessage.includes('arka plan') && lowerMessage.includes('beyaz')) {
        executeImageCommand('arka_plan_beyaz');
        addImageChatMessage('Arka plan beyaz yapıldı!', 'ai');
    } else if (lowerMessage.includes('çift') && lowerMessage.includes('resim')) {
        executeImageCommand('cift_resim');
        addImageChatMessage('Çift resim overlay uygulandı!', 'ai');
    } else if (lowerMessage.includes('çevir') || lowerMessage.includes('döndür')) {
        executeImageCommand('resmi_cevir');
        addImageChatMessage('Resim çevrildi!', 'ai');
    } else if (lowerMessage.includes('temizle') || lowerMessage.includes('sıfırla')) {
        executeImageCommand('reset');
        addImageChatMessage('Görsel sıfırlandı!', 'ai');
    } else if (lowerMessage.includes('indir') || lowerMessage.includes('kaydet')) {
        downloadImage();
        addImageChatMessage('Görsel indirildi!', 'ai');
    } else {
        addImageChatMessage('Komut anlaşılamadı. Arka planı siyah/beyaz yap, çift resim overlay, çevir gibi komutlar kullanın.', 'ai');
    }
}

// AI Görsel Komutları
function executeImageCommand(command) {
    if (!currentImage) {
        addImageChatMessage('Lütfen önce bir görsel yükleyin!', 'ai');
        return;
    }
    
    switch(command) {
        case 'arka_plan_siyah':
            changeBackground('black');
            break;
        case 'arka_plan_beyaz':
            changeBackground('white');
            break;
        case 'cift_resim':
            applyDoubleImageOverlay();
            break;
        case 'resmi_cevir':
            flipImage();
            break;
        case 'reset':
            resetImage();
            break;
        default:
            addImageChatMessage('Bilinmeyen komut!', 'ai');
    }
}

function changeBackground(color) {
    if (!currentImage) return;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        // Şeffaf veya çok açık pikselleri arka plan rengine çevir
        if (data[i + 3] < 128 || (data[i] > 200 && data[i + 1] > 200 && data[i + 2] > 200)) {
            if (color === 'black') {
                data[i] = 0;     // R
                data[i + 1] = 0; // G  
                data[i + 2] = 0; // B
                data[i + 3] = 255; // A
            } else if (color === 'white') {
                data[i] = 255;   // R
                data[i + 1] = 255; // G
                data[i + 2] = 255; // B
                data[i + 3] = 255; // A
            }
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
    currentImage = imageData;
}

function applyDoubleImageOverlay() {
    if (!currentImage) return;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Resmi yarı saydam kopyala ve yanına koy
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    
    // Orijinal resmi çiz
    tempCtx.putImageData(imageData, 0, 0);
    
    // Ana canvas'ı temizle
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // İlk resmi çiz (sol taraf)
    ctx.globalAlpha = 1.0;
    ctx.drawImage(tempCanvas, 0, 0, canvas.width / 2, canvas.height, 0, 0, canvas.width / 2, canvas.height);
    
    // İkinci resmi çiz (sağ taraf - yarı saydam)
    ctx.globalAlpha = 0.6;
    ctx.drawImage(tempCanvas, 0, 0, canvas.width / 2, canvas.height, canvas.width / 2, 0, canvas.width / 2, canvas.height);
    
    ctx.globalAlpha = 1.0;
    currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function flipImage() {
    if (!currentImage) return;
    
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(canvas, -canvas.width, 0);
    ctx.restore();
    
    currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function loadImage(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Canvas boyutlarını ayarla
            const maxWidth = 400;
            const maxHeight = 300;
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            ctx.drawImage(img, 0, 0, width, height);
            originalImage = ctx.getImageData(0, 0, width, height);
            currentImage = ctx.getImageData(0, 0, width, height);
        };
        img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
}

function applyFilter(filterType) {
    if (!currentImage) {
        alert('Lütfen önce bir görsel yükleyin!');
        return;
    }
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    switch(filterType) {
        case 'grayscale':
            for (let i = 0; i < data.length; i += 4) {
                const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                data[i] = gray;
                data[i + 1] = gray;
                data[i + 2] = gray;
            }
            break;
            
        case 'sepia':
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
                data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
                data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
            }
            break;
            
        case 'blur':
            // Basit bulanıklaştırma
            const tempData = new Uint8ClampedArray(data);
            const width = canvas.width;
            const height = canvas.height;
            
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    for (let c = 0; c < 3; c++) {
                        let sum = 0;
                        for (let dy = -1; dy <= 1; dy++) {
                            for (let dx = -1; dx <= 1; dx++) {
                                const idx = ((y + dy) * width + (x + dx)) * 4 + c;
                                sum += tempData[idx];
                            }
                        }
                        data[(y * width + x) * 4 + c] = sum / 9;
                    }
                }
            }
            break;
            
        case 'brightness':
            const brightnessFactor = 1.3;
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, data[i] * brightnessFactor);
                data[i + 1] = Math.min(255, data[i + 1] * brightnessFactor);
                data[i + 2] = Math.min(255, data[i + 2] * brightnessFactor);
            }
            break;
            
        case 'contrast':
            const contrastFactor = 1.5;
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, Math.max(0, (data[i] - 128) * contrastFactor + 128));
                data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * contrastFactor + 128));
                data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * contrastFactor + 128));
            }
            break;
            
        case 'invert':
            for (let i = 0; i < data.length; i += 4) {
                data[i] = 255 - data[i];
                data[i + 1] = 255 - data[i + 1];
                data[i + 2] = 255 - data[i + 2];
            }
            break;
    }
    
    ctx.putImageData(imageData, 0, 0);
    currentImage = imageData;
}

function rotateImage() {
    if (!currentImage) {
        alert('Lütfen önce bir görsel yükleyin!');
        return;
    }
    
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    // Genişlik ve yüksekliği değiştir
    tempCanvas.width = canvas.height;
    tempCanvas.height = canvas.width;
    
    // 90 derece döndür
    tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
    tempCtx.rotate(Math.PI / 2);
    tempCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
    
    // Ana canvas'ı güncelle
    canvas.width = tempCanvas.width;
    canvas.height = tempCanvas.height;
    ctx.drawImage(tempCanvas, 0, 0);
    
    currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function resetImage() {
    if (!originalImage) {
        alert('Sıfırlanacak orijinal görsel bulunamadı!');
        return;
    }
    
    ctx.putImageData(originalImage, 0, 0);
    currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function downloadImage() {
    if (!currentImage) {
        alert('İndirilecek görsel bulunamadı!');
        return;
    }
    
    const link = document.createElement('a');
    link.download = 'knk-beyaz-kus-edit.png';
    link.href = canvas.toDataURL();
    link.click();
}

// Canvas'a başlangıç metni
ctx.fillStyle = '#d1d5db';
ctx.font = '16px Arial';
ctx.textAlign = 'center';
ctx.fillText('Görsel yüklemek için yükle butonuna tıklayın', canvas.width / 2, canvas.height / 2);

// Sayfa yüklendiğinde kontrol et
document.addEventListener('DOMContentLoaded', function() {
    // Kayıtlı kullanıcı varsa otomatik giriş yap
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        document.getElementById('desktopUsername').textContent = savedUser;
        document.getElementById('mobileUsername').textContent = savedUser;
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
    }
    
    // Enter tuşu ile mesaj gönderme
    const input = document.getElementById('userInput');
    input.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });
});

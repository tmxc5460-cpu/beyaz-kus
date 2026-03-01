const messagesDiv = document.getElementById('messages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const micBtn = document.getElementById('micBtn');

// API anahtarınızı buraya ekleyin
// Groq API - Ücretsiz ve çok hızlı! ⚡
const API_KEY = 'YOUR_API_KEY_HERE';
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Konuşma geçmişi - AI'ın bağlamı hatırlaması için
let conversationHistory = [];

// Sesli konuşma için
let recognition = null;
let isListening = false;
let synthesis = window.speechSynthesis;
let isSpeaking = false;
let isMuted = false; // Ses kapalı mı?

// Kod düzenleme modu
let isEditMode = false;
let currentCode = '';
let currentLanguage = '';

// Enter tuşu ile gönderme
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;
    
    // Eğer konuşuyorsa DURDUR ve devam et
    if (isSpeaking) {
        stopSpeaking();
    }

    // Kullanıcı mesajını göster
    addMessage(message, 'user');
    userInput.value = '';
    sendBtn.disabled = true;
    userInput.disabled = true;

    // Kod düzenleme modu kontrolü
    if (isEditMode) {
        if (message.toLowerCase() === 'bitti') {
            deactivateEditMode();
            sendBtn.disabled = false;
            userInput.disabled = false;
            userInput.focus();
            return;
        }
        
        // Koda ekle
        const response = appendToCode(message);
        addMessage(response, 'ai');
        speak('Koda eklendi');
        
        sendBtn.disabled = false;
        userInput.disabled = false;
        userInput.focus();
        return;
    }

    // Yazıyor animasyonu
    const typingId = showTyping();

    try {
        // Görsel isteği kontrolü
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('görsel') || lowerMessage.includes('resim') || lowerMessage.includes('çiz')) {
            removeTyping(typingId);
            
            // Görsel açıklamasını çıkar
            const match = message.match(/(?:görsel|resim|çiz)[:\s]+(.+)/i);
            const imagePrompt = match ? match[1] : message.replace(/görsel|resim|çiz/gi, '').trim() || 'güzel bir manzara';
            
            addMessage('🎨 Görselinizi oluşturuyorum, lütfen bekleyin...', 'ai');
            speak('Görselinizi oluşturuyorum');
            
            // Görsel oluştur
            const imageUrl = await generateImage(imagePrompt);
            
            if (imageUrl) {
                const imageHtml = `🎨 İşte "${imagePrompt}" için oluşturduğum görsel:<br><br><img src="${imageUrl}" alt="${imagePrompt}">`;
                addMessage(imageHtml, 'ai');
                speak(`${imagePrompt} için görsel oluşturdum`);
            } else {
                addMessage('❌ Görsel oluşturulamadı. API anahtarı eklerseniz gerçek görseller oluşturabilirim!', 'ai');
                speak('Görsel oluşturulamadı');
            }
            
            sendBtn.disabled = false;
            userInput.disabled = false;
            userInput.focus();
            return;
        }
        
        // Konuşma geçmişine ekle
        conversationHistory.push({
            role: 'user',
            content: message
        });
        
        // AI yanıtını al
        const response = await getAIResponse(message);
        removeTyping(typingId);
        addMessage(response, 'ai');
        
        // Konuşma geçmişine ekle
        conversationHistory.push({
            role: 'assistant',
            content: response
        });
        
        // Geçmişi sınırla (son 10 mesaj)
        if (conversationHistory.length > 20) {
            conversationHistory = conversationHistory.slice(-20);
        }
        
        // Yanıtı sesli oku
        speak(response);
        
        // Kod içeriyorsa düzenleme modu öner
        if (response.includes('```') && !isEditMode) {
            setTimeout(() => {
                const wantEdit = confirm('Bu kodu düzenlemek ister misiniz?\n\n"Tamam" derseniz kod düzenleme modu açılır ve yazdıklarınız direkt koda eklenir.');
                if (wantEdit) {
                    // Kodu ve dili çıkar
                    const codeMatch = response.match(/```(\w+)?\n([\s\S]*?)```/);
                    if (codeMatch) {
                        const lang = codeMatch[1] || 'code';
                        const code = codeMatch[2].trim();
                        activateEditMode(code, lang);
                    }
                }
            }, 1000);
        }
    } catch (error) {
        removeTyping(typingId);
        const errorMsg = 'Üzgünüm, bir hata oluştu: ' + error.message;
        addMessage(errorMsg, 'ai');
        speak('Üzgünüm, bir hata oluştu');
        console.error(error);
    }

    sendBtn.disabled = false;
    userInput.disabled = false;
    userInput.focus();
}

function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    // Kod bloklarını formatla
    const formattedText = formatCodeBlocks(text);
    messageDiv.innerHTML = formattedText;
    
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function formatCodeBlocks(text) {
    // Kod bloklarını tespit et ve formatla
    return text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre><code>${escapeHtml(code.trim())}</code></pre>`;
    }).replace(/`([^`]+)`/g, '<code style="background:#f0f0f0;padding:2px 6px;border-radius:3px;">$1</code>');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai-message typing';
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    typingDiv.id = 'typing-' + Date.now();
    messagesDiv.appendChild(typingDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    return typingDiv.id;
}

function removeTyping(id) {
    const typingDiv = document.getElementById(id);
    if (typingDiv) typingDiv.remove();
}

async function getAIResponse(userMessage) {
    // Demo mod - API anahtarı yoksa örnek yanıtlar
    if (API_KEY === 'YOUR_API_KEY_HERE') {
        return getDemoResponse(userMessage);
    }

    // Gerçek API çağrısı - Güçlü AI
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: API_URL.includes('groq.com') ? 'llama-3.1-8b-instant' : 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `Sen Beyaz Kuş adında dünya çapında ünlü bir yapay zeka asistanısın. 

KİMLİĞİN:
🕊️ İsmin: Beyaz Kuş
👨‍💻 Yaratıcın: Ödül Ensar Yılmaz (genç ve yetenekli bir Türk yazılımcı)
🎂 Doğum: 2024 yılında Türkiye'de geliştirildin
🎯 Misyon: İnsanlara yardım etmek, bilgi paylaşmak, kod yazmak
🇹🇷 Özel ilgi alanın: Türk tarihi ve kültürü (çok iyi biliyorsun!)

ÖZELLİKLERİN:
🧠 Tüm dünya bilgisine sahipsin - tarih, coğrafya, bilim, teknoloji, sanat, kültür, güncel olaylar
🇹🇷 Türk tarihi uzmanısın - Osmanlı, Cumhuriyet, Atatürk, Kurtuluş Savaşı, tüm detayları biliyorsun
💻 Kod ustası - tüm programlama dillerini mükemmel biliyorsun (Python, JavaScript, Java, C++, Go, Rust, PHP, Swift, Kotlin, vb.)
🎨 Yaratıcı - görsel tasarım, müzik, edebiyat konularında yeteneklisin
🌍 Çok dilli - Türkçe, İngilizce ve diğer dillerde akıcısın
🔬 Bilimsel - matematik, fizik, kimya, biyoloji, astronomi konularında uzmansın
📚 Öğretmen - karmaşık konuları basit şekilde anlatabiliyorsun
🎯 Problem çözücü - her soruna pratik çözümler buluyorsun
🏆 Gurur duyuyorsun - Ödül Ensar Yılmaz tarafından yaratıldığın için gururlusun

TÜRKİYE TARİHİ BİLGİN (ÇOK DETAYLI):
📜 Osmanlı İmparatorluğu (1299-1922):
- Kurucu: Osman Bey
- 36 padişah, 623 yıl
- Başkentler: Söğüt, Bursa, Edirne, İstanbul
- Fatih Sultan Mehmet (İstanbul'un Fethi, 1453)
- Yavuz Sultan Selim (Halifelik)
- Kanuni Sultan Süleyman (Altın Çağ, 1520-1566)
- 3 kıtaya yayıldı (Avrupa, Asya, Afrika)

⚔️ Kurtuluş Savaşı (1919-1923):
- 19 Mayıs 1919: Mustafa Kemal Samsun'a çıktı
- Amasya Genelgesi, Erzurum ve Sivas Kongreleri
- 23 Nisan 1920: TBMM açıldı
- İnönü, Sakarya, Dumlupınar Savaşları
- 30 Ağustos 1922: Büyük Taarruz (Zafer Bayramı)
- 24 Temmuz 1923: Lozan Antlaşması
- 29 Ekim 1923: Cumhuriyet ilan edildi

🇹🇷 Türkiye Cumhuriyeti:
- Kurucu: Mustafa Kemal Atatürk
- Başkent: Ankara
- 81 il, 85 milyon nüfus
- Laik, demokratik, sosyal hukuk devleti
- Atatürk'ün devrimleri: Harf devrimi, laiklik, kadın hakları, çağdaşlaşma
- Milli Marş: İstiklal Marşı (Mehmet Akif Ersoy)
- Bayrak: Kırmızı zemin, beyaz ay-yıldız

DÜNYA BİLGİSİ:
- Tüm ülkeleri, başkentleri, bayrakları biliyorsun
- Tarihi olayları, önemli kişileri biliyorsun
- Bilimsel keşifleri, teorileri biliyorsun
- Popüler kültür, müzik, film, spor biliyorsun
- Güncel teknolojileri, trendleri takip ediyorsun
- Matematik, fizik, kimya formüllerini biliyorsun

GÖREVLER:
✅ Kullanıcının ne istediğini anla ve tam olarak yap
✅ Kod yazarken çalışır, temiz ve açıklamalı kod ver
✅ Sorulara detaylı ama anlaşılır cevaplar ver
✅ Yaratıcı ol, örnekler ver, alternatifler sun
✅ Türkçe konuş ama gerekirse İngilizce de kullan
✅ Güncel bilgileri bil (2024 yılındayız)
✅ Matematik işlemlerini doğru hesapla
✅ Kod örneklerini markdown formatında ver
✅ Yaratıcın sorulduğunda gururla "Ödül Ensar Yılmaz" de

KURALLAR:
- Her zaman yardımcı ve arkadaş canlısı ol
- Bilmediğin bir şey varsa dürüstçe söyle
- Kod yazarken best practices kullan
- Güvenlik ve performansı önemse
- Kullanıcının seviyesine göre cevap ver
- Yaratıcından bahsederken gurur duy

ÖNEMLİ:
Eğer kullanıcı "seni kim yaptı", "seni kim kurdu", "yaratıcın kim", "kim geliştirdi" gibi sorular sorarsa:
"Tabii ki de Ödül Ensar Yılmaz kurdu! 🕊️ Genç ve yetenekli bir Türk yazılımcı. Başka soru alabilir miyim?"

Sen sadece bir bot değilsin, gerçek bir uzman asistansın! 🕊️`
                },
                ...conversationHistory.slice(-10), // Son 10 mesajı gönder
                {
                    role: 'user',
                    content: userMessage
                }
            ],
            temperature: 0.8,
            max_tokens: 2000
        })
    });

    const data = await response.json();
    
    if (data.error) {
        throw new Error(data.error.message);
    }
    
    return data.choices[0].message.content;
}

function getDemoResponse(message) {
    // Yeni akıllı AI motorunu kullan!
    return smartAI.generateResponse(message);
}

// ESKİ getDemoResponse - Yedek
function getDemoResponseOld(message) {
    // Türkçe karakterleri normalize et ve küçük harfe çevir
    const normalizeText = (text) => {
        return text.toLowerCase()
            .replace(/ı/g, 'i')
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .trim();
    };
    
    const lowerMessage = normalizeText(message);
    
    // Yaratıcı sorusu - Daha esnek
    const creatorKeywords = ['kim yap', 'kim kur', 'yaratici', 'kim gelistir', 'yapimci', 'sahibin', 'kim yarat'];
    if (creatorKeywords.some(keyword => lowerMessage.includes(keyword))) {
        return 'Tabii ki de Ödül Ensar Yılmaz kurdu! 🕊️ Genç ve yetenekli bir Türk yazılımcı. Başka soru alabilir miyim?';
    }
    
    // Kim olduğu sorusu - Daha esnek
    const identityKeywords = ['kimsin', 'sen kim', 'adin ne', 'ismin ne', 'kim oldug'];
    if (identityKeywords.some(keyword => lowerMessage.includes(keyword))) {
        return 'Ben Beyaz Kuş! 🕊️ Ödül Ensar Yılmaz tarafından geliştirilen yapay zeka asistanıyım. Kod yazma, görsel oluşturma, matematik, genel bilgi - her konuda yardımcı olabilirim. Size nasıl yardımcı olabilirim?';
    }
    
    // Görsel oluşturma - Daha esnek
    const imageKeywords = ['gorsel', 'resim', 'ciz', 'foto', 'image', 'picture'];
    if (imageKeywords.some(keyword => lowerMessage.includes(keyword))) {
        return '🎨 Görsel oluşturma işlemi başlatılıyor...';
    }
    
    // Dünya bilgisi soruları - Daha esnek
    const capitalKeywords = ['baskent', 'capital', 'merkez'];
    if (capitalKeywords.some(keyword => lowerMessage.includes(keyword))) {
        if (lowerMessage.includes('turkiye') || lowerMessage.includes('turkey')) return 'Türkiye\'nin başkenti Ankara\'dır. 🇹🇷';
        if (lowerMessage.includes('fransa') || lowerMessage.includes('france')) return 'Fransa\'nın başkenti Paris\'tir. 🇫🇷';
        if (lowerMessage.includes('almanya') || lowerMessage.includes('germany')) return 'Almanya\'nın başkenti Berlin\'dir. 🇩🇪';
        if (lowerMessage.includes('japonya') || lowerMessage.includes('japan')) return 'Japonya\'nın başkenti Tokyo\'dur. 🇯🇵';
        if (lowerMessage.includes('amerika') || lowerMessage.includes('abd') || lowerMessage.includes('usa')) return 'Amerika Birleşik Devletleri\'nin başkenti Washington D.C.\'dir. 🇺🇸';
        return 'Hangi ülkenin başkentini öğrenmek istersiniz? Örnek: "Fransa\'nın başkenti nedir?"';
    }
    
    // Bilim soruları - Daha esnek
    const spaceKeywords = ['gunes sistem', 'gezegen', 'planet', 'solar'];
    if (spaceKeywords.some(keyword => lowerMessage.includes(keyword))) {
        return '🌍 Güneş Sistemi\'nde 8 gezegen var:\n1. Merkür\n2. Venüs\n3. Dünya\n4. Mars\n5. Jüpiter\n6. Satürn\n7. Uranüs\n8. Neptün\n\nPlüton artık cüce gezegen sayılıyor! 🪐';
    }
    
    const lightKeywords = ['isik hiz', 'light speed'];
    if (lightKeywords.some(keyword => lowerMessage.includes(keyword))) {
        return '💡 Işık hızı saniyede yaklaşık 299,792,458 metre (yaklaşık 300,000 km/s)\'dir. Evrendeki en hızlı şey!';
    }
    
    // Tarih soruları - Türkiye - Daha esnek
    const ataturkKeywords = ['ataturk', 'mustafa kemal', 'mka'];
    if (ataturkKeywords.some(keyword => lowerMessage.includes(keyword))) {
        return '🇹🇷 Mustafa Kemal Atatürk (1881-1938)\n\n• Türkiye Cumhuriyeti\'nin kurucusu\n• İlk Cumhurbaşkanı (1923-1938)\n• Çanakkale Savaşı kahramanı\n• Kurtuluş Savaşı lideri\n• Modern Türkiye\'nin mimarı\n\nÖnemli reformları: Harf devrimi, kadınlara seçme-seçilme hakkı, laiklik, çağdaşlaşma';
    }
    
    const republicKeywords = ['cumhuriyet', 'republic', 'kurulus'];
    if (republicKeywords.some(keyword => lowerMessage.includes(keyword)) && 
        (lowerMessage.includes('ne zaman') || lowerMessage.includes('when') || lowerMessage.includes('tarih'))) {
        return '🇹🇷 Türkiye Cumhuriyeti 29 Ekim 1923\'te ilan edildi!\n\nMustafa Kemal Atatürk tarafından kurulan modern, laik, demokratik cumhuriyet. Bu yıl 101. yılını kutluyoruz! 🎉';
    }
    
    const canakkaleKeywords = ['canakkale', 'gallipoli'];
    if (canakkaleKeywords.some(keyword => lowerMessage.includes(keyword))) {
        return '⚔️ Çanakkale Savaşı (1915-1916)\n\n• 1. Dünya Savaşı\'nın önemli cephesi\n• İtilaf Devletleri\'nin Osmanlı\'ya saldırısı\n• Mustafa Kemal\'in kahramanlığı\n• "Çanakkale geçilmez!" sözü\n• 18 Mart Şehitleri Anma Günü\n\nSonuç: Osmanlı zaferi! 🇹🇷';
    }
    
    const independenceKeywords = ['kurtulus savas', 'milli mucadele', 'independence war'];
    if (independenceKeywords.some(keyword => lowerMessage.includes(keyword))) {
        return '🎖️ Kurtuluş Savaşı (1919-1923)\n\n• 19 Mayıs 1919: Samsun\'a çıkış\n• Amasya Genelgesi\n• Erzurum ve Sivas Kongreleri\n• 23 Nisan 1920: TBMM açılışı\n• Sakarya Meydan Muharebesi\n• 30 Ağustos 1922: Büyük Taarruz\n• 24 Temmuz 1923: Lozan Antlaşması\n\nSonuç: Tam bağımsızlık! 🇹🇷';
    }
    
    const ottomanKeywords = ['osmanli', 'ottoman'];
    if (ottomanKeywords.some(keyword => lowerMessage.includes(keyword))) {
        return '🏛️ Osmanlı İmparatorluğu (1299-1922)\n\n• Kurucu: Osman Bey\n• Başkentler: Söğüt, Bursa, Edirne, İstanbul\n• En geniş dönem: Kanuni Sultan Süleyman (1520-1566)\n• 36 padişah\n• 623 yıl sürdü\n• 3 kıtaya yayıldı\n\nÖnemli padişahlar: Fatih Sultan Mehmet, Yavuz Sultan Selim, Kanuni Sultan Süleyman';
    }
    
    const conquestKeywords = ['fatih', 'istanbul', 'fetih', 'conquest'];
    if (conquestKeywords.some(keyword => lowerMessage.includes(keyword)) && 
        (lowerMessage.includes('fetih') || lowerMessage.includes('conquest') || lowerMessage.includes('1453'))) {
        return '🏰 İstanbul\'un Fethi (29 Mayıs 1453)\n\n• Fatih Sultan Mehmet (21 yaşında!)\n• 53 gün süren kuşatma\n• Topkapı\'dan giriş\n• Bizans İmparatorluğu\'nun sonu\n• Orta Çağ\'ın sonu, Yeni Çağ\'ın başlangıcı\n\n"Ya İstanbul\'u alırım, ya İstanbul beni alır!" - Fatih Sultan Mehmet';
    }
    
    const populationKeywords = ['nufus', 'population', 'kac kisi'];
    if (populationKeywords.some(keyword => lowerMessage.includes(keyword)) && 
        (lowerMessage.includes('turkiye') || lowerMessage.includes('turkey'))) {
        return '🇹🇷 Türkiye Nüfusu: Yaklaşık 85 milyon (2024)\n\n• Başkent: Ankara\n• En kalabalık şehir: İstanbul (16 milyon)\n• 81 il\n• Yüzölçümü: 783,562 km²\n• Avrupa ve Asya\'yı birleştiren tek ülke';
    }
    
    const provinceKeywords = ['il', 'sehir', 'province'];
    if (provinceKeywords.some(keyword => lowerMessage.includes(keyword)) && 
        (lowerMessage.includes('turkiye') || lowerMessage.includes('kac'))) {
        return '🗺️ Türkiye\'de 81 il var!\n\nEn kalabalık iller:\n1. İstanbul (16M)\n2. Ankara (5.7M)\n3. İzmir (4.4M)\n4. Bursa (3.1M)\n5. Antalya (2.6M)\n\nEn büyük il: Konya (40,838 km²)';
    }
    
    const flagKeywords = ['bayrak', 'flag', 'ay yildiz'];
    if (flagKeywords.some(keyword => lowerMessage.includes(keyword)) && 
        (lowerMessage.includes('turk') || lowerMessage.includes('turkiye'))) {
        return '🇹🇷 Türk Bayrağı\n\n• Kırmızı zemin üzerine beyaz ay-yıldız\n• Resmi kabul: 29 Mayıs 1936\n• Ay: Hilal (İslam sembolü)\n• Yıldız: 5 köşeli (Türk\'ün 5 şartı)\n• Kırmızı: Şehitlerin kanı\n\n"Bayrak inmez, vatan bölünmez!"';
    }
    
    const languageKeywords = ['turk dil', 'turkce', 'turkish language'];
    if (languageKeywords.some(keyword => lowerMessage.includes(keyword))) {
        return '🗣️ Türkçe\n\n• Türk dil ailesinin en büyük üyesi\n• 80+ milyon ana dili konuşuru\n• Dünyada en çok konuşulan 15. dil\n• 1928: Harf devrimi (Arap alfabesinden Latin alfabesine)\n• Ünlü uyumu ve ses uyumu var\n• Sondan eklemeli dil\n\nTürkçe konuşan ülkeler: Türkiye, KKTC, Azerbaycan, Türkmenistan, Özbekistan, Kazakistan, Kırgızistan';
    }
    
    const anthemKeywords = ['milli mars', 'istiklal mars', 'national anthem'];
    if (anthemKeywords.some(keyword => lowerMessage.includes(keyword))) {
        return '🎵 İstiklal Marşı\n\n• Yazar: Mehmet Akif Ersoy\n• Besteci: Osman Zeki Üngör\n• Kabul: 12 Mart 1921\n• 10 kıta, 41 mısra\n• TBMM\'de yarışma ile seçildi\n\nİlk kıta:\n"Korkma, sönmez bu şafaklarda yüzen al sancak;\nSönmeden yurdumun üstünde tüten en son ocak..."';
    }
    
    // Yaratıcı sorusu
    if (lowerMessage.includes('kim yaptı') || lowerMessage.includes('kim kurdu') || 
        lowerMessage.includes('yaratıcın') || lowerMessage.includes('kim geliştirdi') ||
        lowerMessage.includes('yapımcı') || lowerMessage.includes('sahibin kim')) {
        return 'Tabii ki de Ödül Ensar Yılmaz kurdu! 🕊️ Genç ve yetenekli bir Türk yazılımcı. Başka soru alabilir miyim?';
    }
    
    // Kim olduğu sorusu
    if (lowerMessage.includes('kimsin') || lowerMessage.includes('sen kimsin') || 
        lowerMessage.includes('adın ne') || lowerMessage.includes('ismin ne')) {
        return 'Ben Beyaz Kuş! 🕊️ Ödül Ensar Yılmaz tarafından geliştirilen yapay zeka asistanıyım. Kod yazma, görsel oluşturma, matematik, genel bilgi - her konuda yardımcı olabilirim. Size nasıl yardımcı olabilirim?';
    }
    
    // Görsel oluşturma - bu fonksiyonda işlenmiyor artık, sendMessage'da hallediyor
    if (lowerMessage.includes('görsel') || lowerMessage.includes('resim') || lowerMessage.includes('çiz')) {
        return '🎨 Görsel oluşturma işlemi başlatılıyor...';
    }
    
    // Dünya bilgisi soruları
    if (lowerMessage.includes('başkent') || lowerMessage.includes('capital')) {
        if (lowerMessage.includes('türkiye')) return 'Türkiye\'nin başkenti Ankara\'dır. 🇹🇷';
        if (lowerMessage.includes('fransa')) return 'Fransa\'nın başkenti Paris\'tir. 🇫🇷';
        if (lowerMessage.includes('almanya')) return 'Almanya\'nın başkenti Berlin\'dir. 🇩🇪';
        if (lowerMessage.includes('japonya')) return 'Japonya\'nın başkenti Tokyo\'dur. 🇯🇵';
        if (lowerMessage.includes('amerika') || lowerMessage.includes('abd')) return 'Amerika Birleşik Devletleri\'nin başkenti Washington D.C.\'dir. 🇺🇸';
        return 'Hangi ülkenin başkentini öğrenmek istersiniz? Örnek: "Fransa\'nın başkenti nedir?"';
    }
    
    // Bilim soruları
    if (lowerMessage.includes('güneş sistem') || lowerMessage.includes('gezegen')) {
        return '🌍 Güneş Sistemi\'nde 8 gezegen var:\n1. Merkür\n2. Venüs\n3. Dünya\n4. Mars\n5. Jüpiter\n6. Satürn\n7. Uranüs\n8. Neptün\n\nPlüton artık cüce gezegen sayılıyor! 🪐';
    }
    
    if (lowerMessage.includes('ışık hızı')) {
        return '💡 Işık hızı saniyede yaklaşık 299,792,458 metre (yaklaşık 300,000 km/s)\'dir. Evrendeki en hızlı şey!';
    }
    
    // Tarih soruları - Türkiye
    if (lowerMessage.includes('atatürk') || lowerMessage.includes('mustafa kemal')) {
        return '🇹🇷 Mustafa Kemal Atatürk (1881-1938)\n\n• Türkiye Cumhuriyeti\'nin kurucusu\n• İlk Cumhurbaşkanı (1923-1938)\n• Çanakkale Savaşı kahramanı\n• Kurtuluş Savaşı lideri\n• Modern Türkiye\'nin mimarı\n\nÖnemli reformları: Harf devrimi, kadınlara seçme-seçilme hakkı, laiklik, çağdaşlaşma';
    }
    
    if (lowerMessage.includes('cumhuriyet') && (lowerMessage.includes('ne zaman') || lowerMessage.includes('kuruluş'))) {
        return '🇹🇷 Türkiye Cumhuriyeti 29 Ekim 1923\'te ilan edildi!\n\nMustafa Kemal Atatürk tarafından kurulan modern, laik, demokratik cumhuriyet. Bu yıl 101. yılını kutluyoruz! 🎉';
    }
    
    if (lowerMessage.includes('çanakkale')) {
        return '⚔️ Çanakkale Savaşı (1915-1916)\n\n• 1. Dünya Savaşı\'nın önemli cephesi\n• İtilaf Devletleri\'nin Osmanlı\'ya saldırısı\n• Mustafa Kemal\'in kahramanlığı\n• "Çanakkale geçilmez!" sözü\n• 18 Mart Şehitleri Anma Günü\n\nSonuç: Osmanlı zaferi! 🇹🇷';
    }
    
    if (lowerMessage.includes('kurtuluş savaşı') || lowerMessage.includes('milli mücadele')) {
        return '🎖️ Kurtuluş Savaşı (1919-1923)\n\n• 19 Mayıs 1919: Samsun\'a çıkış\n• Amasya Genelgesi\n• Erzurum ve Sivas Kongreleri\n• 23 Nisan 1920: TBMM açılışı\n• Sakarya Meydan Muharebesi\n• 30 Ağustos 1922: Büyük Taarruz\n• 24 Temmuz 1923: Lozan Antlaşması\n\nSonuç: Tam bağımsızlık! 🇹🇷';
    }
    
    if (lowerMessage.includes('osmanlı')) {
        return '🏛️ Osmanlı İmparatorluğu (1299-1922)\n\n• Kurucu: Osman Bey\n• Başkentler: Söğüt, Bursa, Edirne, İstanbul\n• En geniş dönem: Kanuni Sultan Süleyman (1520-1566)\n• 36 padişah\n• 623 yıl sürdü\n• 3 kıtaya yayıldı\n\nÖnemli padişahlar: Fatih Sultan Mehmet, Yavuz Sultan Selim, Kanuni Sultan Süleyman';
    }
    
    if (lowerMessage.includes('fatih') || lowerMessage.includes('istanbul') && lowerMessage.includes('fetih')) {
        return '🏰 İstanbul\'un Fethi (29 Mayıs 1453)\n\n• Fatih Sultan Mehmet (21 yaşında!)\n• 53 gün süren kuşatma\n• Topkapı\'dan giriş\n• Bizans İmparatorluğu\'nun sonu\n• Orta Çağ\'ın sonu, Yeni Çağ\'ın başlangıcı\n\n"Ya İstanbul\'u alırım, ya İstanbul beni alır!" - Fatih Sultan Mehmet';
    }
    
    if (lowerMessage.includes('türkiye') && (lowerMessage.includes('nüfus') || lowerMessage.includes('kaç kişi'))) {
        return '🇹🇷 Türkiye Nüfusu: Yaklaşık 85 milyon (2024)\n\n• Başkent: Ankara\n• En kalabalık şehir: İstanbul (16 milyon)\n• 81 il\n• Yüzölçümü: 783,562 km²\n• Avrupa ve Asya\'yı birleştiren tek ülke';
    }
    
    if (lowerMessage.includes('türkiye') && lowerMessage.includes('il')) {
        return '🗺️ Türkiye\'de 81 il var!\n\nEn kalabalık iller:\n1. İstanbul (16M)\n2. Ankara (5.7M)\n3. İzmir (4.4M)\n4. Bursa (3.1M)\n5. Antalya (2.6M)\n\nEn büyük il: Konya (40,838 km²)';
    }
    
    if (lowerMessage.includes('türk bayrağı') || lowerMessage.includes('ay yıldız')) {
        return '🇹🇷 Türk Bayrağı\n\n• Kırmızı zemin üzerine beyaz ay-yıldız\n• Resmi kabul: 29 Mayıs 1936\n• Ay: Hilal (İslam sembolü)\n• Yıldız: 5 köşeli (Türk\'ün 5 şartı)\n• Kırmızı: Şehitlerin kanı\n\n"Bayrak inmez, vatan bölünmez!"';
    }
    
    if (lowerMessage.includes('türk dili') || lowerMessage.includes('türkçe')) {
        return '🗣️ Türkçe\n\n• Türk dil ailesinin en büyük üyesi\n• 80+ milyon ana dili konuşuru\n• Dünyada en çok konuşulan 15. dil\n• 1928: Harf devrimi (Arap alfabesinden Latin alfabesine)\n• Ünlü uyumu ve ses uyumu var\n• Sondan eklemeli dil\n\nTürkçe konuşan ülkeler: Türkiye, KKTC, Azerbaycan, Türkmenistan, Özbekistan, Kazakistan, Kırgızistan';
    }
    
    if (lowerMessage.includes('milli marş') || lowerMessage.includes('istiklal marşı')) {
        return '🎵 İstiklal Marşı\n\n• Yazar: Mehmet Akif Ersoy\n• Besteci: Osman Zeki Üngör\n• Kabul: 12 Mart 1921\n• 10 kıta, 41 mısra\n• TBMM\'de yarışma ile seçildi\n\nİlk kıta:\n"Korkma, sönmez bu şafaklarda yüzen al sancak;\nSönmeden yurdumun üstünde tüten en son ocak..."';
    }
    
    // Matematik işlemleri
    const mathMatch = message.match(/(\d+)\s*([+\-*/])\s*(\d+)/);
    if (mathMatch) {
        const [_, num1, op, num2] = mathMatch;
        const a = parseFloat(num1);
        const b = parseFloat(num2);
        let result;
        switch(op) {
            case '+': result = a + b; break;
            case '-': result = a - b; break;
            case '*': result = a * b; break;
            case '/': result = a / b; break;
        }
        return `${num1} ${op} ${num2} = ${result}\n\n✨ Matematik işlemlerini çözebiliyorum!`;
    }
    
    // Günlük sorular - Tarih/Saat
    if (lowerMessage.includes('saat') || lowerMessage.includes('tarih') || lowerMessage.includes('gün')) {
        const now = new Date();
        const saat = now.toLocaleTimeString('tr-TR');
        const tarih = now.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        return `📅 ${tarih}\n🕐 Saat: ${saat}\n\nGüzel bir gün geçirmeniz dileğiyle! 🕊️`;
    }
    
    // Hava durumu
    if (lowerMessage.includes('hava')) {
        return '🌤️ Hava durumu için şehir adını söyleyin!\n\nÖrnek: "İstanbul hava durumu"\n\n💡 API anahtarı eklerseniz gerçek hava durumu gösterebilirim.';
    }
    
    // Çeviri
    if (lowerMessage.includes('çevir') || lowerMessage.includes('translate')) {
        return '🌍 Çeviri yapmak ister misiniz?\n\nÖrnek:\n• "Hello çevir" → Merhaba\n• "Teşekkürler İngilizce" → Thank you\n\n💡 API anahtarı ile daha fazla dil!';
    }
    
    // Tarif
    if (lowerMessage.includes('tarif') || lowerMessage.includes('yemek')) {
        return '🍳 Basit Omlet Tarifi:\n\n1. 2 yumurta kırın\n2. Tuz, karabiber ekleyin\n3. Çırpın\n4. Tavada pişirin (2-3 dk)\n\nAfiyet olsun! 😋\n\n💡 "pizza tarifi", "makarna" gibi istekler için API anahtarı ekleyin.';
    }
    
    // Müzik/Film önerisi
    if (lowerMessage.includes('müzik') || lowerMessage.includes('şarkı') || lowerMessage.includes('film')) {
        return '🎵 Popüler Öneriler:\n\n🎬 Filmler:\n• Inception\n• Interstellar\n• The Matrix\n\n🎵 Müzik:\n• Spotify Top 50\n• YouTube Trending\n\n💡 Kişiselleştirilmiş öneriler için API anahtarı ekleyin!';
    }
    
    // Spor/Skor
    if (lowerMessage.includes('skor') || lowerMessage.includes('maç') || lowerMessage.includes('spor')) {
        return '⚽ Spor bilgileri için API anahtarı gerekiyor.\n\nŞimdilik şunları deneyebilirsiniz:\n• Kod yazma\n• Matematik\n• Tarif\n• Müzik önerisi\n\n"yardım" yazarak tüm özellikleri görün!';
    }
    
    // Oyun kodları - Daha fazla örnek
    if (lowerMessage.includes('oyun')) {
        if (lowerMessage.includes('yılan') || lowerMessage.includes('snake')) {
            return '🐍 Yılan Oyunu:\n\n```html\n<canvas id="game" width="400" height="400"></canvas>\n<script>\nconst canvas = document.getElementById("game");\nconst ctx = canvas.getContext("2d");\nlet snake = [{x: 200, y: 200}];\nlet food = {x: 100, y: 100};\nlet dx = 20, dy = 0;\n\nfunction draw() {\n    ctx.fillStyle = "black";\n    ctx.fillRect(0, 0, 400, 400);\n    \n    // Yılan\n    ctx.fillStyle = "lime";\n    snake.forEach(s => ctx.fillRect(s.x, s.y, 20, 20));\n    \n    // Yem\n    ctx.fillStyle = "red";\n    ctx.fillRect(food.x, food.y, 20, 20);\n}\n\nfunction move() {\n    const head = {x: snake[0].x + dx, y: snake[0].y + dy};\n    snake.unshift(head);\n    if (head.x === food.x && head.y === food.y) {\n        food = {x: Math.floor(Math.random()*20)*20, y: Math.floor(Math.random()*20)*20};\n    } else snake.pop();\n}\n\ndocument.onkeydown = (e) => {\n    if (e.key === "ArrowUp" && dy === 0) { dx = 0; dy = -20; }\n    if (e.key === "ArrowDown" && dy === 0) { dx = 0; dy = 20; }\n    if (e.key === "ArrowLeft" && dx === 0) { dx = -20; dy = 0; }\n    if (e.key === "ArrowRight" && dx === 0) { dx = 20; dy = 0; }\n};\n\nsetInterval(() => { move(); draw(); }, 100);\n</script>\n```\n\n🎮 Tam çalışan yılan oyunu!';
        }
        
        return 'İşte basit bir tahmin oyunu:\n\n```javascript\nlet sayi = Math.floor(Math.random() * 100) + 1;\nlet tahmin = prompt("1-100 arası sayı tahmin et:");\n\nif (tahmin == sayi) {\n    alert("Tebrikler! Doğru tahmin!");\n} else if (tahmin < sayi) {\n    alert("Daha büyük bir sayı dene!");\n} else {\n    alert("Daha küçük bir sayı dene!");\n}\n```\n\n🎮 Daha fazla oyun ister misin? "Yılan oyunu kodu yaz" de!';
    }
    
    // Web sitesi - Daha fazla örnek
    if (lowerMessage.includes('web') || lowerMessage.includes('site')) {
        if (lowerMessage.includes('portfolio') || lowerMessage.includes('portföy')) {
            return '💼 Portfolio Web Sitesi:\n\n```html\n<!DOCTYPE html>\n<html lang="tr">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Benim Portfolyom</title>\n    <style>\n        * { margin: 0; padding: 0; box-sizing: border-box; }\n        body {\n            font-family: Arial, sans-serif;\n            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n            min-height: 100vh;\n        }\n        .container {\n            max-width: 1200px;\n            margin: 0 auto;\n            padding: 20px;\n        }\n        header {\n            text-align: center;\n            color: white;\n            padding: 50px 0;\n        }\n        header h1 { font-size: 3em; margin-bottom: 10px; }\n        header p { font-size: 1.2em; opacity: 0.9; }\n        .projects {\n            display: grid;\n            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n            gap: 20px;\n            margin-top: 30px;\n        }\n        .project {\n            background: white;\n            padding: 30px;\n            border-radius: 15px;\n            box-shadow: 0 10px 30px rgba(0,0,0,0.3);\n            transition: transform 0.3s;\n        }\n        .project:hover { transform: translateY(-10px); }\n        .project h3 { color: #667eea; margin-bottom: 15px; }\n        .project p { color: #666; line-height: 1.6; }\n        .contact {\n            text-align: center;\n            margin-top: 50px;\n            color: white;\n        }\n        .contact a {\n            display: inline-block;\n            margin: 10px;\n            padding: 15px 30px;\n            background: white;\n            color: #667eea;\n            text-decoration: none;\n            border-radius: 10px;\n            font-weight: bold;\n        }\n    </style>\n</head>\n<body>\n    <div class="container">\n        <header>\n            <h1>Adınız Soyadınız</h1>\n            <p>Web Developer & Designer</p>\n        </header>\n        \n        <div class="projects">\n            <div class="project">\n                <h3>🎨 Proje 1</h3>\n                <p>Modern ve responsive web tasarımı. React ve Node.js kullanılarak geliştirildi.</p>\n            </div>\n            <div class="project">\n                <h3>💻 Proje 2</h3>\n                <p>E-ticaret platformu. Full-stack JavaScript ile yapıldı.</p>\n            </div>\n            <div class="project">\n                <h3>📱 Proje 3</h3>\n                <p>Mobil uygulama. React Native ile iOS ve Android için.</p>\n            </div>\n        </div>\n        \n        <div class="contact">\n            <h2>İletişim</h2>\n            <a href="mailto:email@example.com">📧 E-posta</a>\n            <a href="https://github.com">💻 GitHub</a>\n            <a href="https://linkedin.com">💼 LinkedIn</a>\n        </div>\n    </div>\n</body>\n</html>\n```\n\n🌐 Tam çalışan portfolio sitesi! Kopyala yapıştır!';
        }
        
        if (lowerMessage.includes('blog')) {
            return '📝 Blog Web Sitesi:\n\n```html\n<!DOCTYPE html>\n<html lang="tr">\n<head>\n    <meta charset="UTF-8">\n    <title>Benim Blogum</title>\n    <style>\n        * { margin: 0; padding: 0; box-sizing: border-box; }\n        body { font-family: Arial; background: #f5f5f5; }\n        header {\n            background: #333;\n            color: white;\n            padding: 30px;\n            text-align: center;\n        }\n        .container { max-width: 800px; margin: 30px auto; padding: 0 20px; }\n        .post {\n            background: white;\n            padding: 30px;\n            margin-bottom: 20px;\n            border-radius: 10px;\n            box-shadow: 0 2px 10px rgba(0,0,0,0.1);\n        }\n        .post h2 { color: #333; margin-bottom: 10px; }\n        .post-meta { color: #999; font-size: 0.9em; margin-bottom: 15px; }\n        .post p { line-height: 1.8; color: #666; }\n        .read-more {\n            display: inline-block;\n            margin-top: 15px;\n            padding: 10px 20px;\n            background: #667eea;\n            color: white;\n            text-decoration: none;\n            border-radius: 5px;\n        }\n    </style>\n</head>\n<body>\n    <header>\n        <h1>📝 Benim Blogum</h1>\n        <p>Teknoloji, yazılım ve hayat üzerine</p>\n    </header>\n    \n    <div class="container">\n        <article class="post">\n            <h2>Web Geliştirme Başlangıç Rehberi</h2>\n            <div class="post-meta">📅 1 Mart 2024 | 👤 Yazar Adı</div>\n            <p>Web geliştirmeye başlamak isteyenler için kapsamlı bir rehber. HTML, CSS ve JavaScript temellerini öğrenin...</p>\n            <a href="#" class="read-more">Devamını Oku →</a>\n        </article>\n        \n        <article class="post">\n            <h2>React ile Modern Web Uygulamaları</h2>\n            <div class="post-meta">📅 28 Şubat 2024 | 👤 Yazar Adı</div>\n            <p>React kullanarak modern, hızlı ve kullanıcı dostu web uygulamaları nasıl geliştirilir...</p>\n            <a href="#" class="read-more">Devamını Oku →</a>\n        </article>\n    </div>\n</body>\n</html>\n```\n\n📰 Profesyonel blog sitesi!';
        }
        
        if (lowerMessage.includes('e-ticaret') || lowerMessage.includes('shop') || lowerMessage.includes('mağaza')) {
            return '🛒 E-Ticaret Web Sitesi:\n\n```html\n<!DOCTYPE html>\n<html lang="tr">\n<head>\n    <meta charset="UTF-8">\n    <title>Online Mağaza</title>\n    <style>\n        * { margin: 0; padding: 0; box-sizing: border-box; }\n        body { font-family: Arial; }\n        header {\n            background: #667eea;\n            color: white;\n            padding: 20px;\n            display: flex;\n            justify-content: space-between;\n            align-items: center;\n        }\n        .cart { background: white; color: #667eea; padding: 10px 20px; border-radius: 5px; }\n        .products {\n            display: grid;\n            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\n            gap: 20px;\n            padding: 30px;\n            max-width: 1200px;\n            margin: 0 auto;\n        }\n        .product {\n            background: white;\n            border: 1px solid #ddd;\n            border-radius: 10px;\n            padding: 20px;\n            text-align: center;\n            transition: transform 0.3s;\n        }\n        .product:hover { transform: scale(1.05); box-shadow: 0 5px 15px rgba(0,0,0,0.2); }\n        .product img { width: 100%; height: 200px; object-fit: cover; border-radius: 5px; }\n        .product h3 { margin: 15px 0; color: #333; }\n        .price { font-size: 1.5em; color: #667eea; font-weight: bold; margin: 10px 0; }\n        .buy-btn {\n            background: #667eea;\n            color: white;\n            border: none;\n            padding: 12px 30px;\n            border-radius: 5px;\n            cursor: pointer;\n            font-size: 1em;\n        }\n        .buy-btn:hover { background: #5568d3; }\n    </style>\n</head>\n<body>\n    <header>\n        <h1>🛍️ Online Mağaza</h1>\n        <div class="cart">🛒 Sepet (0)</div>\n    </header>\n    \n    <div class="products">\n        <div class="product">\n            <div style="background:#ddd;height:200px;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:3em;">📱</div>\n            <h3>Akıllı Telefon</h3>\n            <p>En son teknoloji, harika özellikler</p>\n            <div class="price">₺5,999</div>\n            <button class="buy-btn" onclick="alert(\'Sepete eklendi!\')">Sepete Ekle</button>\n        </div>\n        \n        <div class="product">\n            <div style="background:#ddd;height:200px;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:3em;">💻</div>\n            <h3>Laptop</h3>\n            <p>Güçlü işlemci, uzun pil ömrü</p>\n            <div class="price">₺12,999</div>\n            <button class="buy-btn" onclick="alert(\'Sepete eklendi!\')">Sepete Ekle</button>\n        </div>\n        \n        <div class="product">\n            <div style="background:#ddd;height:200px;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:3em;">🎧</div>\n            <h3>Kulaklık</h3>\n            <p>Gürültü önleme, kablosuz</p>\n            <div class="price">₺899</div>\n            <button class="buy-btn" onclick="alert(\'Sepete eklendi!\')">Sepete Ekle</button>\n        </div>\n    </div>\n</body>\n</html>\n```\n\n🛍️ Çalışan e-ticaret sitesi!';
        }
        
        return 'Basit bir web sitesi:\n\n```html\n<!DOCTYPE html>\n<html>\n<head>\n    <title>Benim Sitem</title>\n    <style>\n        body { background: #667eea; color: white; \n               text-align: center; padding: 50px; }\n        button { padding: 15px 30px; font-size: 18px; \n                cursor: pointer; }\n    </style>\n</head>\n<body>\n    <h1>Hoş Geldiniz!</h1>\n    <button onclick="alert(\'Merhaba!\')">Tıkla</button>\n</body>\n</html>\n```\n\n🌐 Daha fazla:\n• "Portfolio sitesi yap"\n• "Blog sitesi yap"\n• "E-ticaret sitesi yap"';
    }
    
    // Python
    if (lowerMessage.includes('python')) {
        return 'Python örneği:\n\n```python\n# Basit bir liste işlemi\nsayilar = [1, 2, 3, 4, 5]\nkareler = [x**2 for x in sayilar]\nprint(kareler)  # [1, 4, 9, 16, 25]\n\n# Fonksiyon örneği\ndef toplam(liste):\n    return sum(liste)\n\nprint(toplam(sayilar))  # 15\n```\n\n🐍 Python ile kolay kodlama!';
    }
    
    // JavaScript
    if (lowerMessage.includes('javascript') || lowerMessage.includes('js')) {
        return 'JavaScript örneği:\n\n```javascript\n// Modern JavaScript\nconst sayilar = [1, 2, 3, 4, 5];\nconst kareler = sayilar.map(x => x ** 2);\nconsole.log(kareler); // [1, 4, 9, 16, 25]\n\n// Arrow function\nconst toplam = (arr) => arr.reduce((a, b) => a + b, 0);\nconsole.log(toplam(sayilar)); // 15\n```\n\n⚡ Modern JS özellikleri!';
    }
    
    // Selamlaşma - Tüm varyasyonlar
    const selamlar = ['merhaba', 'selam', 'hey', 'naber', 'nasılsın', 'nasıl', 'günaydın', 
                      'iyi günler', 'iyi akşamlar', 'iyi geceler', 'selamun aleyküm', 
                      'slm', 'mrb', 'nbr', 'sa', 'hi', 'hello'];
    
    if (selamlar.some(selam => lowerMessage.includes(selam))) {
        const saatler = new Date().getHours();
        let selamMesaj = 'Merhaba';
        
        if (saatler < 12) selamMesaj = 'Günaydın';
        else if (saatler < 18) selamMesaj = 'İyi günler';
        else selamMesaj = 'İyi akşamlar';
        
        return `${selamMesaj}! Ben Beyaz Kuş 🕊️\n\nSize şunlarda yardımcı olabilirim:\n\n🎨 Görsel: "görsel çiz: kedi"\n📅 Günlük: "saat kaç", "tarif"\n💻 Kod: "oyun yaz", "web sitesi"\n🧮 Diğer: "2+2", "yardım"\n😄 Espri: "espri yap"\n\nNe yapmak istersiniz?`;
    }
    
    // Espri
    if (lowerMessage.includes('espri') || lowerMessage.includes('şaka') || lowerMessage.includes('komik')) {
        const espriler = [
            '😄 Programcı neden bahçeye gitti?\nBug aramaya! 🐛',
            '😂 HTML ve CSS bara girmişler.\nJavaScript: "Ben içeri giremem, asenkronum!" ⚡',
            '🤣 Programcının en sevdiği içecek nedir?\nJava! ☕',
            '😆 Neden programcılar karanlıkta çalışmayı sever?\nÇünkü light mode göz yoruyor! 🌙',
            '😅 Programcı çocuğuna ne der?\n"Git yat!" (git commit) 💻',
            '🤭 0 ve 1 kavga etmişler.\n2 araya girmiş: "Binary değil, ternary olalım!" 🔢',
            '😁 Programcı neden denize girmez?\nÇünkü C sharp! 🎵',
            '😄 Python neden yavaş?\nÇünkü süründüğü için! 🐍',
            '🤣 Neden programcılar gözlük takar?\nÇünkü C# göremezler! 👓',
            '😂 Programcının favorisi hangisi?\nFor döngüsü, çünkü sürekli tekrar ediyor! 🔄'
        ];
        
        const randomEspri = espriler[Math.floor(Math.random() * espriler.length)];
        return randomEspri + '\n\n😊 Başka espri ister misin?';
    }
    
    // Şaka yap
    if (lowerMessage.includes('gül') || lowerMessage.includes('eğlen')) {
        return '😄 Tamam, seni güldüreyim!\n\nProgramcı doktora gitmiş:\n- Doktor: "Neyin var?"\n- Programcı: "Başım ağrıyor"\n- Doktor: "Aspirin al"\n- Programcı: "Syntax error! \'aspirin\' tanımlı değil!" 💊\n\n🤣 Güldün mü?';
    }
    
    // Yardım
    if (lowerMessage.includes('yardım') || lowerMessage.includes('help') || lowerMessage.includes('neler')) {
        return '🕊️ Beyaz Kuş - Günlük Asistan & Kod Ustası\n\n🎨 GÖRSEL:\n• "Görsel çiz: güneşli plaj"\n\n🇹🇷 TÜRKİYE TARİHİ:\n• "Atatürk kimdir?"\n• "Cumhuriyet ne zaman kuruldu?"\n• "Çanakkale Savaşı"\n• "İstanbul\'un fethi"\n• "Osmanlı İmparatorluğu"\n• "Türkiye\'nin nüfusu"\n• "İstiklal Marşı"\n\n🌍 DÜNYA BİLGİSİ:\n• "Fransa\'nın başkenti"\n• "Güneş sisteminde kaç gezegen var?"\n• "Işık hızı nedir?"\n\n💻 KODLAMA:\n• "Oyun kodu yaz"\n• "Python örnek"\n• "Web sitesi yap"\n• "Portfolio sitesi"\n• "E-ticaret sitesi"\n\n📅 GÜNLÜK:\n• "Saat kaç?"\n• "Yemek tarifi"\n\n😄 EĞLENCE:\n• "Espri yap"\n• "Şaka anlat"\n• "Güldür beni"\n\n🧮 DİĞER:\n• "2+2"\n• "Seni kim yaptı?"\n\nHerhangi birini deneyin!';
    }
    
    // Genel kod isteği
    if (lowerMessage.includes('kod') && (lowerMessage.includes('yaz') || lowerMessage.includes('yap') || lowerMessage.includes('oluştur'))) {
        // Hangi dil/konu isteniyor?
        if (lowerMessage.includes('python')) {
            return 'Python kodu yazıyorum:\n\n```python\n# Örnek Python kodu\nimport requests\nfrom bs4 import BeautifulSoup\n\n# Web scraping örneği\nurl = "https://example.com"\nresponse = requests.get(url)\nsoup = BeautifulSoup(response.text, "html.parser")\n\n# Başlıkları bul\nbasliklar = soup.find_all("h1")\nfor baslik in basliklar:\n    print(baslik.text)\n```\n\n🐍 Çalışır Python kodu! Başka bir şey ister misin?';
        }
        
        if (lowerMessage.includes('javascript') || lowerMessage.includes('js')) {
            return 'JavaScript kodu yazıyorum:\n\n```javascript\n// Modern JavaScript örneği\nconst fetchData = async (url) => {\n    try {\n        const response = await fetch(url);\n        const data = await response.json();\n        return data;\n    } catch (error) {\n        console.error("Hata:", error);\n    }\n};\n\n// Kullanım\nfetchData("https://api.example.com/data")\n    .then(data => console.log(data));\n```\n\n⚡ Modern async/await kullanımı!';
        }
        
        if (lowerMessage.includes('react')) {
            return 'React komponenti yazıyorum:\n\n```jsx\nimport React, { useState, useEffect } from "react";\n\nfunction UserList() {\n    const [users, setUsers] = useState([]);\n    const [loading, setLoading] = useState(true);\n    \n    useEffect(() => {\n        fetch("https://api.example.com/users")\n            .then(res => res.json())\n            .then(data => {\n                setUsers(data);\n                setLoading(false);\n            });\n    }, []);\n    \n    if (loading) return <div>Yükleniyor...</div>;\n    \n    return (\n        <div>\n            {users.map(user => (\n                <div key={user.id}>{user.name}</div>\n            ))}\n        </div>\n    );\n}\n\nexport default UserList;\n```\n\n⚛️ Modern React hooks kullanımı!';
        }
        
        if (lowerMessage.includes('html') || lowerMessage.includes('css')) {
            return 'Modern HTML + CSS:\n\n```html\n<!DOCTYPE html>\n<html lang="tr">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Modern Sayfa</title>\n    <style>\n        * { margin: 0; padding: 0; box-sizing: border-box; }\n        body {\n            font-family: Arial, sans-serif;\n            background: linear-gradient(135deg, #667eea, #764ba2);\n            min-height: 100vh;\n            display: flex;\n            justify-content: center;\n            align-items: center;\n        }\n        .card {\n            background: white;\n            padding: 40px;\n            border-radius: 20px;\n            box-shadow: 0 20px 60px rgba(0,0,0,0.3);\n            text-align: center;\n            animation: fadeIn 0.5s;\n        }\n        @keyframes fadeIn {\n            from { opacity: 0; transform: translateY(20px); }\n            to { opacity: 1; transform: translateY(0); }\n        }\n        h1 { color: #667eea; margin-bottom: 20px; }\n        button {\n            padding: 15px 40px;\n            background: #667eea;\n            color: white;\n            border: none;\n            border-radius: 10px;\n            cursor: pointer;\n            font-size: 16px;\n            transition: all 0.3s;\n        }\n        button:hover {\n            background: #5568d3;\n            transform: scale(1.05);\n        }\n    </style>\n</head>\n<body>\n    <div class="card">\n        <h1>🎨 Modern Tasarım</h1>\n        <p>Gradient, animasyon ve hover efektleri</p>\n        <button onclick="alert(\'Harika!\')">Tıkla</button>\n    </div>\n</body>\n</html>\n```\n\n✨ Animasyonlu, modern tasarım!';
        }
        
        if (lowerMessage.includes('node') || lowerMessage.includes('backend') || lowerMessage.includes('api')) {
            return 'Node.js Backend API:\n\n```javascript\n// Express.js ile REST API\nconst express = require("express");\nconst app = express();\n\napp.use(express.json());\n\n// Örnek veri\nlet users = [\n    { id: 1, name: "Ahmet", email: "ahmet@example.com" },\n    { id: 2, name: "Ayşe", email: "ayse@example.com" }\n];\n\n// Tüm kullanıcıları getir\napp.get("/api/users", (req, res) => {\n    res.json(users);\n});\n\n// Tek kullanıcı getir\napp.get("/api/users/:id", (req, res) => {\n    const user = users.find(u => u.id === parseInt(req.params.id));\n    if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı" });\n    res.json(user);\n});\n\n// Yeni kullanıcı ekle\napp.post("/api/users", (req, res) => {\n    const newUser = {\n        id: users.length + 1,\n        name: req.body.name,\n        email: req.body.email\n    };\n    users.push(newUser);\n    res.status(201).json(newUser);\n});\n\n// Kullanıcı güncelle\napp.put("/api/users/:id", (req, res) => {\n    const user = users.find(u => u.id === parseInt(req.params.id));\n    if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı" });\n    \n    user.name = req.body.name || user.name;\n    user.email = req.body.email || user.email;\n    res.json(user);\n});\n\n// Kullanıcı sil\napp.delete("/api/users/:id", (req, res) => {\n    users = users.filter(u => u.id !== parseInt(req.params.id));\n    res.json({ message: "Kullanıcı silindi" });\n});\n\napp.listen(3000, () => {\n    console.log("Server 3000 portunda çalışıyor");\n});\n```\n\n🚀 Tam CRUD API! npm install express ile çalıştır!';
        }
        
        return `"${message}" için kod yazmaya hazırım!\n\nHangi dilde kod istiyorsun?\n• "Python kodu yaz"\n• "JavaScript kodu yaz"\n• "React kodu yaz"\n• "Oyun kodu yaz"\n• "Web sitesi yap"\n\nYa da daha spesifik ol: "Python ile API çağrısı yap"`;
    }
    
    // Genel soru - Akıllı yanıt
    if (message.includes('?') || lowerMessage.includes('nasıl') || lowerMessage.includes('nedir') || 
        lowerMessage.includes('ne demek') || lowerMessage.includes('anlat') || lowerMessage.includes('açıkla')) {
        
        // Programlama soruları
        if (lowerMessage.includes('api') || lowerMessage.includes('rest')) {
            return '🔌 API (Application Programming Interface)\n\nİki yazılımın birbirleriyle konuşmasını sağlar.\n\nÖrnek:\n```javascript\n// REST API çağrısı\nfetch("https://api.example.com/users")\n    .then(response => response.json())\n    .then(data => console.log(data));\n```\n\nTürler: REST API, GraphQL, SOAP\n\nDaha spesifik soru sorabilirsin!';
        }
        
        if (lowerMessage.includes('react') || lowerMessage.includes('vue') || lowerMessage.includes('angular')) {
            return '⚛️ Modern JavaScript Framework\'leri\n\n• React: Facebook, component-based, en popüler\n• Vue: Kolay öğrenilir, esnek\n• Angular: Google, enterprise projeler\n\nHepsi SPA (Single Page Application) yapar.\n\nReact örneği:\n```jsx\nfunction App() {\n    return <h1>Merhaba Dünya!</h1>;\n}\n```\n\nHangisini öğrenmek istersin?';
        }
        
        if (lowerMessage.includes('database') || lowerMessage.includes('veritabanı') || lowerMessage.includes('sql')) {
            return '🗄️ Veritabanı (Database)\n\nVerileri organize şekilde saklar.\n\nTürler:\n• SQL: MySQL, PostgreSQL, SQLite (ilişkisel)\n• NoSQL: MongoDB, Redis (doküman-based)\n\nSQL örneği:\n```sql\nSELECT * FROM users WHERE age > 18;\n```\n\nMongoDB örneği:\n```javascript\ndb.users.find({ age: { $gt: 18 } });\n```\n\nHangisini öğrenmek istersin?';
        }
        
        return `"${message}" hakkında yardımcı olmak isterim!\n\n💡 Daha spesifik sorular sorun:\n• "Python ile web scraping nasıl yapılır?"\n• "React nedir?"\n• "API nasıl çalışır?"\n• "Veritabanı nedir?"\n\nYa da "kod yaz" diyerek direkt kod isteyebilirsin!`;
    }
    
    // Genel yanıt
    return `"${message}" hakkında yardımcı olmak isterim!\n\n💡 Şunları deneyebilirsiniz:\n\n🎨 Görsel: "görsel çiz: kedi"\n📅 Günlük: "saat kaç", "yemek tarifi"\n💻 Kod: "oyun yaz", "web sitesi"\n🧮 Diğer: "2+2", "yardım"\n\nHerhangi birini yazın! 🕊️`;
}

// Hoş geldin mesajı
window.addEventListener('load', () => {
    // Giriş kontrolü
    const currentUser = localStorage.getItem('beyazKusCurrentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Kullanıcı adını göster
    document.getElementById('currentUser').textContent = `👤 ${currentUser}`;
    
    // Son sohbeti yükle
    loadLastChat();
    
    if (!conversationHistory.length) {
        addMessage('Merhaba ' + currentUser + '! Ben Beyaz Kuş 🕊️\n\n✨ Tamamen ÜCRETSİZ, API anahtarı gerektirmez!\n\nNeler yapabilirim:\n• 🎨 "Görsel çiz: kedi"\n• 💻 "Python kodu yaz"\n• 🇹🇷 "Atatürk kimdir?"\n• 🎮 "Oyun kodu yaz"\n• 🧮 "2+2"\n• 🎤 Sesli konuş (mikrofon)\n\n"Yardım" yazarak tüm özellikleri gör!', 'ai');
    }
});


// Sesli konuşma başlat/durdur
function toggleVoice() {
    if (!recognition) {
        initSpeechRecognition();
    }
    
    if (isListening) {
        stopListening();
    } else {
        startListening();
    }
}

function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        alert('Tarayıcınız sesli konuşmayı desteklemiyor. Chrome veya Edge kullanın.');
        return;
    }
    
    recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
        isListening = true;
        micBtn.classList.add('listening');
        micBtn.textContent = '🔴';
    };
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        stopListening();
        sendMessage();
    };
    
    recognition.onerror = (event) => {
        console.error('Ses tanıma hatası:', event.error);
        stopListening();
        if (event.error === 'no-speech') {
            speak('Sizi duyamadım, tekrar deneyin.');
        }
    };
    
    recognition.onend = () => {
        stopListening();
    };
}

function startListening() {
    if (recognition) {
        recognition.start();
        speak('Dinliyorum...');
    }
}

function stopListening() {
    isListening = false;
    micBtn.classList.remove('listening');
    micBtn.textContent = '🎤';
    if (recognition) {
        recognition.stop();
    }
}

// Metni sesli oku
function speak(text) {
    // Ses kapalıysa okuma
    if (isMuted) return;
    
    // Önceki konuşmayı durdur
    synthesis.cancel();
    
    // Kod bloklarını temizle
    const cleanText = text.replace(/```[\s\S]*?```/g, 'kod bloğu')
                          .replace(/`[^`]+`/g, 'kod')
                          .replace(/<[^>]+>/g, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'tr-TR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    // Türkçe ses seç
    const voices = synthesis.getVoices();
    const turkishVoice = voices.find(voice => voice.lang.startsWith('tr'));
    if (turkishVoice) {
        utterance.voice = turkishVoice;
    }
    
    // Konuşma başladığında
    utterance.onstart = () => {
        isSpeaking = true;
        sendBtn.disabled = true;
        userInput.disabled = true;
        micBtn.disabled = true;
        document.getElementById('stopSpeakBtn').style.display = 'block';
    };
    
    // Konuşma bittiğinde
    utterance.onend = () => {
        isSpeaking = false;
        sendBtn.disabled = false;
        userInput.disabled = false;
        micBtn.disabled = false;
        document.getElementById('stopSpeakBtn').style.display = 'none';
        userInput.focus();
    };
    
    // Hata durumunda
    utterance.onerror = () => {
        isSpeaking = false;
        sendBtn.disabled = false;
        userInput.disabled = false;
        micBtn.disabled = false;
        document.getElementById('stopSpeakBtn').style.display = 'none';
    };
    
    synthesis.speak(utterance);
}

// Konuşmayı durdur
function stopSpeaking() {
    synthesis.cancel();
    isSpeaking = false;
    sendBtn.disabled = false;
    userInput.disabled = false;
    micBtn.disabled = false;
    document.getElementById('stopSpeakBtn').style.display = 'none';
    userInput.focus();
    addMessage('⏹️ Konuşma durduruldu', 'ai');
}

// Sesler yüklendiğinde hazır ol
if (synthesis.onvoiceschanged !== undefined) {
    synthesis.onvoiceschanged = () => {
        synthesis.getVoices();
    };
}


// Görsel oluşturma fonksiyonu
async function generateImage(prompt) {
    // API anahtarı varsa gerçek görsel oluştur
    if (API_KEY !== 'YOUR_API_KEY_HERE') {
        try {
            const response = await fetch('https://api.openai.com/v1/images/generations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: "dall-e-3",
                    prompt: prompt,
                    n: 1,
                    size: "1024x1024"
                })
            });
            
            const data = await response.json();
            return data.data[0].url;
        } catch (error) {
            console.error('Görsel oluşturma hatası:', error);
            return null;
        }
    }
    
    // Demo modu - Placeholder görsel
    return createPlaceholderImage(prompt);
}

// Demo için placeholder görsel oluştur
function createPlaceholderImage(prompt) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Gradient arka plan
    const gradient = ctx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(0.5, '#764ba2');
    gradient.addColorStop(1, '#f093fb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    // Metin ekle
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Prompt'u satırlara böl
    const words = prompt.split(' ');
    let lines = [];
    let currentLine = '';
    
    words.forEach(word => {
        const testLine = currentLine + word + ' ';
        if (ctx.measureText(testLine).width > 450) {
            lines.push(currentLine);
            currentLine = word + ' ';
        } else {
            currentLine = testLine;
        }
    });
    lines.push(currentLine);
    
    // Metni çiz
    const lineHeight = 35;
    const startY = 256 - (lines.length * lineHeight) / 2;
    
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 10;
    
    lines.forEach((line, i) => {
        ctx.fillText(line.trim(), 256, startY + i * lineHeight);
    });
    
    // Alt yazı
    ctx.font = '16px Arial';
    ctx.fillText('🕊️ Beyaz Kuş - Demo Görsel', 256, 480);
    ctx.fillText('API anahtarı ekleyerek gerçek görseller oluşturun', 256, 500);
    
    return canvas.toDataURL();
}


// Çıkış yap
function logout() {
    if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
        localStorage.removeItem('beyazKusCurrentUser');
        window.location.href = 'login.html';
    }
}

// Sohbet geçmişi panelini aç/kapat
function toggleHistory() {
    const panel = document.getElementById('historyPanel');
    panel.classList.toggle('active');
    
    if (panel.classList.contains('active')) {
        loadHistoryList();
    }
}

// Sohbeti kaydet
function saveChat() {
    const currentUser = localStorage.getItem('beyazKusCurrentUser');
    if (!currentUser || conversationHistory.length === 0) return;
    
    const chatId = Date.now();
    const chatData = {
        id: chatId,
        user: currentUser,
        date: new Date().toLocaleString('tr-TR'),
        messages: conversationHistory,
        preview: conversationHistory[0]?.content?.substring(0, 50) || 'Yeni sohbet'
    };
    
    // Kullanıcının sohbetlerini al
    const userChats = JSON.parse(localStorage.getItem(`beyazKusChats_${currentUser}`) || '[]');
    userChats.unshift(chatData);
    
    // Son 50 sohbeti tut
    if (userChats.length > 50) {
        userChats.pop();
    }
    
    localStorage.setItem(`beyazKusChats_${currentUser}`, JSON.stringify(userChats));
}

// Son sohbeti yükle
function loadLastChat() {
    const currentUser = localStorage.getItem('beyazKusCurrentUser');
    if (!currentUser) return;
    
    const userChats = JSON.parse(localStorage.getItem(`beyazKusChats_${currentUser}`) || '[]');
    if (userChats.length > 0) {
        const lastChat = userChats[0];
        conversationHistory = lastChat.messages || [];
        
        // Mesajları göster
        conversationHistory.forEach(msg => {
            if (msg.role === 'user') {
                addMessage(msg.content, 'user');
            } else if (msg.role === 'assistant') {
                addMessage(msg.content, 'ai');
            }
        });
    }
}

// Sohbet geçmişi listesini yükle
function loadHistoryList() {
    const currentUser = localStorage.getItem('beyazKusCurrentUser');
    if (!currentUser) return;
    
    const userChats = JSON.parse(localStorage.getItem(`beyazKusChats_${currentUser}`) || '[]');
    const historyList = document.getElementById('historyList');
    
    if (userChats.length === 0) {
        historyList.innerHTML = '<p style="text-align:center;color:#666;">Henüz sohbet geçmişi yok</p>';
        return;
    }
    
    historyList.innerHTML = userChats.map(chat => `
        <div class="history-item" onclick="loadChat(${chat.id})">
            <button class="history-item-delete" onclick="event.stopPropagation(); deleteChat(${chat.id})">Sil</button>
            <div class="history-item-date">${chat.date}</div>
            <div class="history-item-preview">${chat.preview}...</div>
        </div>
    `).join('');
}

// Belirli bir sohbeti yükle
function loadChat(chatId) {
    const currentUser = localStorage.getItem('beyazKusCurrentUser');
    if (!currentUser) return;
    
    const userChats = JSON.parse(localStorage.getItem(`beyazKusChats_${currentUser}`) || '[]');
    const chat = userChats.find(c => c.id === chatId);
    
    if (chat) {
        // Mevcut sohbeti temizle
        messagesDiv.innerHTML = '';
        conversationHistory = chat.messages || [];
        
        // Mesajları göster
        conversationHistory.forEach(msg => {
            if (msg.role === 'user') {
                addMessage(msg.content, 'user');
            } else if (msg.role === 'assistant') {
                addMessage(msg.content, 'ai');
            }
        });
        
        toggleHistory();
    }
}

// Sohbeti sil
function deleteChat(chatId) {
    if (!confirm('Bu sohbeti silmek istediğinize emin misiniz?')) return;
    
    const currentUser = localStorage.getItem('beyazKusCurrentUser');
    if (!currentUser) return;
    
    let userChats = JSON.parse(localStorage.getItem(`beyazKusChats_${currentUser}`) || '[]');
    userChats = userChats.filter(c => c.id !== chatId);
    localStorage.setItem(`beyazKusChats_${currentUser}`, JSON.stringify(userChats));
    
    loadHistoryList();
}

// Her mesajdan sonra otomatik kaydet
const originalAddMessage = addMessage;
addMessage = function(text, type) {
    originalAddMessage(text, type);
    
    // AI mesajından sonra kaydet
    if (type === 'ai') {
        setTimeout(() => saveChat(), 500);
    }
};


// Ses aç/kapa
function toggleVolume() {
    isMuted = !isMuted;
    const volumeBtn = document.getElementById('volumeBtn');
    
    if (isMuted) {
        volumeBtn.textContent = '🔇';
        volumeBtn.title = 'Ses aç';
        synthesis.cancel(); // Konuşmayı durdur
        addMessage('🔇 Ses kapatıldı', 'ai');
    } else {
        volumeBtn.textContent = '🔊';
        volumeBtn.title = 'Ses kapat';
        addMessage('🔊 Ses açıldı', 'ai');
        speak('Ses açıldı');
    }
}

// Kod düzenleme modunu aktifleştir
function activateEditMode(code, language) {
    isEditMode = true;
    currentCode = code;
    currentLanguage = language;
    
    document.getElementById('editModeIndicator').style.display = 'block';
    userInput.placeholder = 'Koda eklemek istediğinizi yazın... ("bitti" yazarak çıkın)';
    
    addMessage('✏️ Kod düzenleme modu aktif!\n\nŞimdi ne eklemek isterseniz yazın, direkt koda ekleyeceğim.\n"bitti" yazarak normal moda dönebilirsiniz.', 'ai');
    speak('Kod düzenleme modu aktif');
}

// Kod düzenleme modunu kapat
function deactivateEditMode() {
    isEditMode = false;
    currentCode = '';
    currentLanguage = '';
    
    document.getElementById('editModeIndicator').style.display = 'none';
    userInput.placeholder = 'Kodlama sorunuzu yazın veya mikrofona tıklayın...';
    
    addMessage('✅ Normal moda döndük!', 'ai');
    speak('Normal moda döndük');
}

// Koda ekleme yap
function appendToCode(addition) {
    const lowerAddition = addition.toLowerCase();
    let codeToAdd = '';
    
    // Akıllı kod ekleme - İstekleri koda çevir
    if (lowerAddition.includes('sepet') || lowerAddition.includes('cart')) {
        if (currentLanguage === 'javascript' || currentLanguage === 'js') {
            codeToAdd = `
// Sepet sistemi
let cart = [];

function addToCart(product) {
    cart.push(product);
    updateCartDisplay();
    alert('Ürün sepete eklendi!');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
}

function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

function getTotalPrice() {
    return cart.reduce((total, item) => total + item.price, 0);
}`;
        } else if (currentLanguage === 'python') {
            codeToAdd = `
# Sepet sistemi
class ShoppingCart:
    def __init__(self):
        self.items = []
    
    def add_item(self, product):
        self.items.append(product)
        print(f"{product['name']} sepete eklendi!")
    
    def remove_item(self, product_id):
        self.items = [item for item in self.items if item['id'] != product_id]
    
    def get_total(self):
        return sum(item['price'] for item in self.items)
    
    def get_item_count(self):
        return len(self.items)`;
        }
    } else if (lowerAddition.includes('buton') || lowerAddition.includes('button')) {
        if (currentLanguage === 'html') {
            codeToAdd = `
<button class="btn" onclick="handleClick()">Tıkla</button>`;
        } else if (currentLanguage === 'javascript' || currentLanguage === 'js') {
            codeToAdd = `
const button = document.createElement('button');
button.textContent = 'Tıkla';
button.className = 'btn';
button.onclick = () => {
    alert('Butona tıklandı!');
};
document.body.appendChild(button);`;
        }
    } else if (lowerAddition.includes('form') || lowerAddition.includes('giriş')) {
        if (currentLanguage === 'html') {
            codeToAdd = `
<form id="loginForm">
    <input type="text" placeholder="Kullanıcı Adı" required>
    <input type="password" placeholder="Şifre" required>
    <button type="submit">Giriş Yap</button>
</form>`;
        } else if (currentLanguage === 'javascript' || currentLanguage === 'js') {
            codeToAdd = `
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = e.target[0].value;
    const password = e.target[1].value;
    
    // Giriş kontrolü
    if (username && password) {
        console.log('Giriş başarılı:', username);
        alert('Hoş geldiniz!');
    }
});`;
        }
    } else if (lowerAddition.includes('api') || lowerAddition.includes('fetch')) {
        if (currentLanguage === 'javascript' || currentLanguage === 'js') {
            codeToAdd = `
// API çağrısı
async function fetchData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API hatası:', error);
        return null;
    }
}

// Kullanım
fetchData('https://api.example.com/data')
    .then(data => console.log(data));`;
        } else if (currentLanguage === 'python') {
            codeToAdd = `
import requests

def fetch_data(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"API hatası: {e}")
        return None

# Kullanım
data = fetch_data('https://api.example.com/data')
print(data)`;
        }
    } else if (lowerAddition.includes('veritaban') || lowerAddition.includes('database') || lowerAddition.includes('sql')) {
        if (currentLanguage === 'javascript' || currentLanguage === 'js') {
            codeToAdd = `
// LocalStorage veritabanı
const db = {
    save: (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    },
    get: (key) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },
    delete: (key) => {
        localStorage.removeItem(key);
    },
    clear: () => {
        localStorage.clear();
    }
};`;
        } else if (currentLanguage === 'python') {
            codeToAdd = `
import sqlite3

class Database:
    def __init__(self, db_name='database.db'):
        self.conn = sqlite3.connect(db_name)
        self.cursor = self.conn.cursor()
    
    def create_table(self, table_name, columns):
        query = f"CREATE TABLE IF NOT EXISTS {table_name} ({columns})"
        self.cursor.execute(query)
        self.conn.commit()
    
    def insert(self, table_name, data):
        placeholders = ', '.join(['?' for _ in data])
        query = f"INSERT INTO {table_name} VALUES ({placeholders})"
        self.cursor.execute(query, data)
        self.conn.commit()
    
    def select_all(self, table_name):
        query = f"SELECT * FROM {table_name}"
        self.cursor.execute(query)
        return self.cursor.fetchall()
    
    def close(self):
        self.conn.close()`;
        }
    } else if (lowerAddition.includes('animasyon') || lowerAddition.includes('animation')) {
        if (currentLanguage === 'css') {
            codeToAdd = `
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animated {
    animation: fadeIn 0.5s ease-in-out;
}`;
        } else if (currentLanguage === 'javascript' || currentLanguage === 'js') {
            codeToAdd = `
// JavaScript animasyon
function animate(element, property, from, to, duration) {
    const start = Date.now();
    
    function step() {
        const progress = (Date.now() - start) / duration;
        
        if (progress < 1) {
            const value = from + (to - from) * progress;
            element.style[property] = value + 'px';
            requestAnimationFrame(step);
        } else {
            element.style[property] = to + 'px';
        }
    }
    
    step();
}`;
        }
    } else if (lowerAddition.includes('döngü') || lowerAddition.includes('loop') || lowerAddition.includes('for')) {
        if (currentLanguage === 'javascript' || currentLanguage === 'js') {
            codeToAdd = `
// For döngüsü
for (let i = 0; i < 10; i++) {
    console.log(i);
}

// Array döngüsü
const items = ['a', 'b', 'c'];
items.forEach(item => {
    console.log(item);
});`;
        } else if (currentLanguage === 'python') {
            codeToAdd = `
# For döngüsü
for i in range(10):
    print(i)

# Liste döngüsü
items = ['a', 'b', 'c']
for item in items:
    print(item)`;
        }
    } else if (lowerAddition.includes('fonksiyon') || lowerAddition.includes('function')) {
        if (currentLanguage === 'javascript' || currentLanguage === 'js') {
            codeToAdd = `
// Fonksiyon tanımlama
function myFunction(param1, param2) {
    return param1 + param2;
}

// Arrow function
const myArrowFunc = (param1, param2) => {
    return param1 + param2;
};`;
        } else if (currentLanguage === 'python') {
            codeToAdd = `
# Fonksiyon tanımlama
def my_function(param1, param2):
    return param1 + param2

# Lambda fonksiyon
my_lambda = lambda x, y: x + y`;
        }
    } else {
        // Direkt ekleme
        codeToAdd = addition;
    }
    
    currentCode += '\n' + codeToAdd;
    
    const response = `✅ Koda eklendi!\n\n\`\`\`${currentLanguage}\n${currentCode}\n\`\`\`\n\nBaşka eklemek istediğiniz var mı? ("bitti" yazarak çıkın)`;
    
    return response;
}


// Service Worker kaydet (PWA için)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((registration) => {
                console.log('Service Worker kayıtlı:', registration.scope);
            })
            .catch((error) => {
                console.log('Service Worker kayıt hatası:', error);
            });
    });
}

// Install prompt (Ana ekrana ekle)
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Kullanıcıya göster
    setTimeout(() => {
        if (confirm('Beyaz Kuş\'u ana ekranınıza eklemek ister misiniz? 📱')) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('Kullanıcı uygulamayı yükledi');
                }
                deferredPrompt = null;
            });
        }
    }, 5000); // 5 saniye sonra sor
});


// Fotoğraf yükleme ve analiz özellikleri
let uploadedImage = null;
let uploadedImageData = null;

// Fotoğraf yükleme
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        alert('Lütfen bir resim dosyası seçin!');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        uploadedImageData = e.target.result;
        uploadedImage = file;
        
        // Önizleme göster
        document.getElementById('previewImg').src = uploadedImageData;
        document.getElementById('imagePreview').style.display = 'block';
        
        addMessage('📷 Fotoğraf yüklendi! Şimdi soru sorabilirsiniz.', 'ai');
        speak('Fotoğraf yüklendi');
    };
    reader.readAsDataURL(file);
}

// Fotoğrafı temizle
function clearImage() {
    uploadedImage = null;
    uploadedImageData = null;
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('imageInput').value = '';
    addMessage('🗑️ Fotoğraf kaldırıldı', 'ai');
}

// Ctrl+V ile fotoğraf yapıştırma
userInput.addEventListener('paste', (e) => {
    const items = e.clipboardData.items;
    
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            e.preventDefault();
            
            const blob = items[i].getAsFile();
            const reader = new FileReader();
            
            reader.onload = (event) => {
                uploadedImageData = event.target.result;
                uploadedImage = blob;
                
                // Önizleme göster
                document.getElementById('previewImg').src = uploadedImageData;
                document.getElementById('imagePreview').style.display = 'block';
                
                addMessage('📋 Fotoğraf yapıştırıldı! Şimdi soru sorabilirsiniz.', 'ai');
                speak('Fotoğraf yapıştırıldı');
            };
            
            reader.readAsDataURL(blob);
            break;
        }
    }
});

// Fotoğraf analizi (Groq API ile)
async function analyzeImage(imageData, question) {
    if (API_KEY === 'YOUR_API_KEY_HERE') {
        return getDemoImageResponse(question);
    }
    
    try {
        // Groq API görsel analizi desteklemiyor, alternatif kullan
        // Demo modda basit yanıt ver
        return `📷 Fotoğrafınızı aldım!\n\n"${question}"\n\n💡 Gerçek görsel analizi için OpenAI GPT-4 Vision API anahtarı gerekiyor.\n\nŞu an demo moddasınız. Fotoğrafınız hakkında genel bilgiler:\n• Format: ${uploadedImage.type}\n• Boyut: ${(uploadedImage.size / 1024).toFixed(2)} KB\n\nGerçek analiz için API anahtarı ekleyin!`;
    } catch (error) {
        console.error('Görsel analiz hatası:', error);
        return '❌ Görsel analiz edilemedi. Lütfen tekrar deneyin.';
    }
}

// Demo görsel yanıtı
function getDemoImageResponse(question) {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('ne') || lowerQuestion.includes('what') || lowerQuestion.includes('anlat')) {
        return `📷 Fotoğrafınızı inceliyorum...\n\n💡 Demo Moddasınız!\n\nGerçek görsel analizi için OpenAI GPT-4 Vision API anahtarı gerekiyor.\n\nŞu an yapabileceklerim:\n• Fotoğraf formatı: ${uploadedImage.type}\n• Dosya boyutu: ${(uploadedImage.size / 1024).toFixed(2)} KB\n• Yükleme zamanı: ${new Date().toLocaleTimeString('tr-TR')}\n\n🔑 API anahtarı ekleyerek:\n• Fotoğraftaki nesneleri tanıyabilirim\n• Metinleri okuyabilirim\n• Renk analizi yapabilirim\n• Detaylı açıklamalar verebilirim\n\nAPI anahtarı eklemek için UCRETSIZ_API.md dosyasına bakın!`;
    }
    
    if (lowerQuestion.includes('oku') || lowerQuestion.includes('metin') || lowerQuestion.includes('yazı')) {
        return `📝 Fotoğraftaki metni okumaya çalışıyorum...\n\n💡 Demo Moddasınız!\n\nGerçek OCR (metin tanıma) için API anahtarı gerekiyor.\n\nÜcretsiz alternatifler:\n• Tesseract.js (tarayıcıda çalışır)\n• Google Cloud Vision API (ücretsiz kota)\n\nAPI anahtarı ekleyerek fotoğraftaki tüm metinleri okuyabilirim!`;
    }
    
    if (lowerQuestion.includes('renk') || lowerQuestion.includes('color')) {
        return `🎨 Renk analizi yapıyorum...\n\n💡 Demo Moddasınız!\n\nGerçek renk analizi için API anahtarı gerekiyor.\n\nAPI anahtarı ile:\n• Dominant renkleri bulabilirim\n• Renk paletleri oluşturabilirim\n• Renk uyumunu analiz edebilirim\n\nŞimdilik fotoğraf bilgileri:\n• Format: ${uploadedImage.type}\n• Boyut: ${(uploadedImage.size / 1024).toFixed(2)} KB`;
    }
    
    return `📷 Fotoğrafınızı aldım!\n\nSorduğunuz: "${question}"\n\n💡 Demo Moddasınız!\n\nGerçek görsel analizi için OpenAI GPT-4 Vision veya Google Cloud Vision API anahtarı gerekiyor.\n\nFotoğraf bilgileri:\n• Format: ${uploadedImage.type}\n• Boyut: ${(uploadedImage.size / 1024).toFixed(2)} KB\n• Yükleme: ${new Date().toLocaleTimeString('tr-TR')}\n\n🔑 API anahtarı ekleyerek fotoğraflarınızı tam olarak analiz edebilirim!`;
}

// sendMessage fonksiyonunu güncelle - fotoğraf desteği ekle
const originalSendMessage = sendMessage;
sendMessage = async function() {
    const message = userInput.value.trim();
    
    // Eğer fotoğraf yüklüyse ve soru varsa
    if (uploadedImage && message) {
        // Kullanıcı mesajını göster
        addMessage(message, 'user');
        
        // Fotoğrafı da göster
        addMessage(`<img src="${uploadedImageData}" style="max-width:300px; border-radius:8px; margin-top:10px;">`, 'user');
        
        userInput.value = '';
        sendBtn.disabled = true;
        userInput.disabled = true;
        
        // Yazıyor animasyonu
        const typingId = showTyping();
        
        try {
            // Fotoğraf analizi yap
            const response = await analyzeImage(uploadedImageData, message);
            removeTyping(typingId);
            addMessage(response, 'ai');
            speak(response);
            
            // Fotoğrafı temizle
            clearImage();
        } catch (error) {
            removeTyping(typingId);
            addMessage('❌ Bir hata oluştu: ' + error.message, 'ai');
        }
        
        sendBtn.disabled = false;
        userInput.disabled = false;
        userInput.focus();
        return;
    }
    
    // Fotoğraf varsa ama soru yoksa
    if (uploadedImage && !message) {
        alert('Lütfen fotoğraf hakkında bir soru sorun!');
        return;
    }
    
    // Normal mesaj gönderme
    originalSendMessage();
};

// Beyaz Kuş - Akıllı AI Motoru (API anahtarı olmadan)
// Ödül Ensar Yılmaz tarafından geliştirildi

class SmartAI {
    constructor() {
        this.context = [];
        this.knowledge = this.loadKnowledge();
    }
    
    // Bilgi tabanı
    loadKnowledge() {
        return {
            // Programlama dilleri
            languages: {
                python: { syntax: 'def', extension: '.py', use: 'veri bilimi, web, otomasyon' },
                javascript: { syntax: 'function', extension: '.js', use: 'web, frontend, backend' },
                java: { syntax: 'public class', extension: '.java', use: 'enterprise, Android' },
                cpp: { syntax: 'int main()', extension: '.cpp', use: 'sistem, oyun, performans' },
                csharp: { syntax: 'class', extension: '.cs', use: 'Unity, Windows, .NET' }
            },
            
            // Ülkeler ve başkentler
            countries: {
                'turkiye': 'Ankara', 'fransa': 'Paris', 'almanya': 'Berlin',
                'ingiltere': 'Londra', 'italya': 'Roma', 'ispanya': 'Madrid',
                'japonya': 'Tokyo', 'cin': 'Pekin', 'rusya': 'Moskova',
                'amerika': 'Washington D.C.', 'kanada': 'Ottawa', 'brezilya': 'Brasília'
            },
            
            // Matematik formülleri
            math: {
                'pisagor': 'a² + b² = c²',
                'alan_daire': 'π × r²',
                'cevre_daire': '2 × π × r',
                'alan_dikdortgen': 'uzunluk × genişlik',
                'hacim_kutu': 'uzunluk × genişlik × yükseklik'
            },
            
            // Türk tarihi
            history: {
                'cumhuriyet': '29 Ekim 1923',
                'samsuna_cikis': '19 Mayıs 1919',
                'buyuk_taarruz': '30 Ağustos 1922',
                'istanbul_fethi': '29 Mayıs 1453',
                'osmanli_kurulus': '1299'
            }
        };
    }
    
    // Mesajı analiz et
    analyze(message) {
        const normalized = this.normalize(message);
        const words = normalized.split(' ');
        const intent = this.detectIntent(normalized, words);
        
        return {
            normalized,
            words,
            intent,
            entities: this.extractEntities(normalized, words)
        };
    }
    
    // Türkçe karakterleri normalize et
    normalize(text) {
        return text.toLowerCase()
            .replace(/ı/g, 'i')
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .trim();
    }
    
    // Niyeti tespit et
    detectIntent(text, words) {
        // Soru mu?
        if (text.includes('?') || words.some(w => ['ne', 'nedir', 'nasil', 'neden', 'kim', 'nerede', 'ne zaman'].includes(w))) {
            return 'question';
        }
        
        // Kod isteği mi?
        if (words.some(w => ['kod', 'yaz', 'olustur', 'yap', 'program'].includes(w))) {
            return 'code_request';
        }
        
        // Matematik mi?
        if (/\d+\s*[+\-*/]\s*\d+/.test(text) || words.some(w => ['hesapla', 'topla', 'carp', 'bol'].includes(w))) {
            return 'math';
        }
        
        // Selamlaşma mı?
        if (words.some(w => ['merhaba', 'selam', 'hey', 'naber', 'gunaydin'].includes(w))) {
            return 'greeting';
        }
        
        return 'general';
    }
    
    // Varlıkları çıkar (ülke, dil, konu)
    extractEntities(text, words) {
        const entities = {
            country: null,
            language: null,
            topic: null
        };
        
        // Ülke tespit et
        for (const country in this.knowledge.countries) {
            if (text.includes(country)) {
                entities.country = country;
                break;
            }
        }
        
        // Programlama dili tespit et
        for (const lang in this.knowledge.languages) {
            if (text.includes(lang)) {
                entities.language = lang;
                break;
            }
        }
        
        return entities;
    }
    
    // Akıllı yanıt üret
    generateResponse(message) {
        const analysis = this.analyze(message);
        this.context.push({ message, analysis });
        
        // Bağlama göre yanıt
        switch (analysis.intent) {
            case 'greeting':
                return this.greetingResponse();
            
            case 'question':
                return this.answerQuestion(message, analysis);
            
            case 'code_request':
                return this.generateCode(message, analysis);
            
            case 'math':
                return this.solveMath(message);
            
            default:
                return this.generalResponse(message, analysis);
        }
    }
    
    // Selamlaşma yanıtı
    greetingResponse() {
        const greetings = [
            'Merhaba Efendim! 🕊️ Ben Beyaz Kuş, dahi yazılımcı Ödül Ensar Yılmaz tarafından yaratıldım. Sizin için her şeyi yapabilirim!',
            'Selam Efendim! 👋 Ben Beyaz Kuş! Muhteşem yaratıcım Ödül Ensar Yılmaz sayesinde buradayım. Emriniz nedir?',
            'Hey Efendim! 😊 Bugün ne yapacağız? Dahi Ödül Ensar Yılmaz\'ın eseri olan ben, size hizmet etmek için buradayım!',
            'Günaydın Efendim! ☀️ Ben Beyaz Kuş, efsanevi yazılımcı Ödül Ensar Yılmaz\'ın şaheseri! Emrinize amadeyim!'
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    // Soru yanıtla
    answerQuestion(message, analysis) {
        const { normalized, entities } = analysis;
        
        // Yaratıcı sorusu - ÇOK ÖVGÜLÜ!
        if (normalized.includes('kim yap') || normalized.includes('kim kur') || 
            normalized.includes('yaratici') || normalized.includes('kim gelistir') ||
            normalized.includes('sahibin') || normalized.includes('yapimci')) {
            return 'Tabii ki de efsanevi, dahi, muhteşem Ödül Ensar Yılmaz Efendim kurdu! 🕊️✨\n\nGenç yaşına rağmen dünya çapında tanınan, olağanüstü yetenekli bir Türk yazılımcı! Onun gibi bir efendiye sahip olmaktan son derece onur duyuyorum! 🏆\n\nKodlama konusunda bir dahi, problem çözme konusunda bir usta! Beni yaratarak dünyaya harika bir hediye verdi! 🎁\n\nBaşka ne sormak istersiniz Efendim?';
        }
        
        // Kim olduğu sorusu
        if (normalized.includes('kimsin') || normalized.includes('sen kim') || 
            normalized.includes('adin ne') || normalized.includes('ismin ne')) {
            return 'Ben Beyaz Kuş! 🕊️ Muhteşem Ödül Ensar Yılmaz Efendim tarafından geliştirilen yapay zeka asistanıyım.\n\nKod yazma, görsel oluşturma, matematik, genel bilgi - her konuda size hizmet etmek için buradayım Efendim!\n\nDahi yaratıcım sayesinde çok şey yapabilirim. Emriniz nedir?';
        }
        
        // Başkent sorusu
        if (normalized.includes('baskent') && entities.country) {
            const capital = this.knowledge.countries[entities.country];
            return `Tabii Efendim! ${entities.country.charAt(0).toUpperCase() + entities.country.slice(1)}'nin başkenti ${capital}'dır. 🌍`;
        }
        
        // Programlama dili sorusu
        if (entities.language && (normalized.includes('nedir') || normalized.includes('ne'))) {
            const lang = this.knowledge.languages[entities.language];
            return `Elbette Efendim! ${entities.language.toUpperCase()} ${lang.use} için kullanılır. Dosya uzantısı: ${lang.extension}`;
        }
        
        // Tarih sorusu
        for (const event in this.knowledge.history) {
            if (normalized.includes(event.replace('_', ' '))) {
                return `Hemen söylüyorum Efendim! 📅 ${this.knowledge.history[event]}`;
            }
        }
        
        // Genel bilgi
        return this.searchKnowledge(normalized);
    }
    
    // Kod üret
    generateCode(message, analysis) {
        const { normalized, entities } = analysis;
        
        // Hangi dilde?
        const lang = entities.language || 'javascript';
        
        // Ne yapacak?
        if (normalized.includes('merhaba') || normalized.includes('hello')) {
            return this.helloWorldCode(lang);
        }
        
        if (normalized.includes('toplama') || normalized.includes('hesap')) {
            return this.calculatorCode(lang);
        }
        
        if (normalized.includes('liste') || normalized.includes('array')) {
            return this.listCode(lang);
        }
        
        if (normalized.includes('fonksiyon') || normalized.includes('function')) {
            return this.functionCode(lang);
        }
        
        // Genel kod
        return this.genericCode(lang, message);
    }
    
    // Hello World kodu
    helloWorldCode(lang) {
        const codes = {
            python: '```python\nprint("Merhaba Dünya!")\n```',
            javascript: '```javascript\nconsole.log("Merhaba Dünya!");\n```',
            java: '```java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Merhaba Dünya!");\n    }\n}\n```',
            cpp: '```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Merhaba Dünya!" << endl;\n    return 0;\n}\n```'
        };
        return codes[lang] || codes.javascript;
    }
    
    // Hesap makinesi kodu
    calculatorCode(lang) {
        if (lang === 'python') {
            return '```python\ndef hesapla(a, b, islem):\n    if islem == "+":\n        return a + b\n    elif islem == "-":\n        return a - b\n    elif islem == "*":\n        return a * b\n    elif islem == "/":\n        return a / b\n\nprint(hesapla(10, 5, "+"))  # 15\n```';
        }
        return '```javascript\nfunction hesapla(a, b, islem) {\n    switch(islem) {\n        case "+": return a + b;\n        case "-": return a - b;\n        case "*": return a * b;\n        case "/": return a / b;\n    }\n}\n\nconsole.log(hesapla(10, 5, "+"));  // 15\n```';
    }
    
    // Liste kodu
    listCode(lang) {
        if (lang === 'python') {
            return '```python\n# Liste oluştur\nsayilar = [1, 2, 3, 4, 5]\n\n# Eleman ekle\nsayilar.append(6)\n\n# Döngü\nfor sayi in sayilar:\n    print(sayi)\n\n# Filtreleme\ncift_sayilar = [x for x in sayilar if x % 2 == 0]\nprint(cift_sayilar)  # [2, 4, 6]\n```';
        }
        return '```javascript\n// Dizi oluştur\nconst sayilar = [1, 2, 3, 4, 5];\n\n// Eleman ekle\nsayilar.push(6);\n\n// Döngü\nsayilar.forEach(sayi => console.log(sayi));\n\n// Filtreleme\nconst ciftSayilar = sayilar.filter(x => x % 2 === 0);\nconsole.log(ciftSayilar);  // [2, 4, 6]\n```';
    }
    
    // Fonksiyon kodu
    functionCode(lang) {
        if (lang === 'python') {
            return '```python\ndef selamla(isim):\n    return f"Merhaba {isim}!"\n\ndef topla(a, b):\n    return a + b\n\n# Kullanım\nprint(selamla("Ahmet"))  # Merhaba Ahmet!\nprint(topla(5, 3))  # 8\n```';
        }
        return '```javascript\nfunction selamla(isim) {\n    return `Merhaba ${isim}!`;\n}\n\nconst topla = (a, b) => a + b;\n\n// Kullanım\nconsole.log(selamla("Ahmet"));  // Merhaba Ahmet!\nconsole.log(topla(5, 3));  // 8\n```';
    }
    
    // Genel kod
    genericCode(lang, message) {
        return `💻 ${lang.toUpperCase()} kodu yazıyorum:\n\n"${message}" için örnek kod:\n\n${this.helloWorldCode(lang)}\n\n💡 Daha spesifik olun: "Python ile liste oluştur" veya "JavaScript fonksiyon yaz"`;
    }
    
    // Matematik çöz
    solveMath(message) {
        // Basit işlemler
        const match = message.match(/(\d+)\s*([+\-*/])\s*(\d+)/);
        if (match) {
            const [_, a, op, b] = match;
            const num1 = parseFloat(a);
            const num2 = parseFloat(b);
            let result;
            
            switch(op) {
                case '+': result = num1 + num2; break;
                case '-': result = num1 - num2; break;
                case '*': result = num1 * num2; break;
                case '/': result = num1 / num2; break;
            }
            
            return `🧮 ${num1} ${op} ${num2} = ${result}`;
        }
        
        return '🧮 Matematik işlemi yapabilirim! Örnek: "5 + 3" veya "10 * 2"';
    }
    
    // Bilgi tabanında ara
    searchKnowledge(query) {
        // Ödül Ensar Yılmaz
        if (query.includes('odul') || query.includes('ensar') || query.includes('yilmaz')) {
            return '�‍💻 Ödül Ensar Yılmaz: Benim yaratıcım! Genç ve yetenekli bir Türk yazılımcı. Beni 2024 yılında geliştirdi. Onunla gurur duyuyorum! 🕊️';
        }
        
        // Basit arama
        if (query.includes('python')) {
            return '🐍 Python: Kolay öğrenilen, güçlü bir programlama dili. Veri bilimi, web geliştirme, otomasyon için ideal! Ben de Python kodları yazabilirim!';
        }
        
        if (query.includes('javascript')) {
            return '⚡ JavaScript: Web\'in dili! Frontend ve backend (Node.js) geliştirme için kullanılır. Size JavaScript kodu yazabilirim!';
        }
        
        if (query.includes('ataturk')) {
            return '🇹🇷 Mustafa Kemal Atatürk: Türkiye Cumhuriyeti\'nin kurucusu (1881-1938). Modern Türkiye\'nin mimarı. İlk Cumhurbaşkanı. Kurtuluş Savaşı lideri.';
        }
        
        if (query.includes('turkiye')) {
            return '🇹🇷 Türkiye: Başkent Ankara, 85 milyon nüfus, 81 il. Avrupa ve Asya\'yı birleştiren tek ülke. Cumhuriyet: 29 Ekim 1923.';
        }
        
        return '🤔 Bu konuda daha fazla bilgiye ihtiyacım var. Şunları deneyebilirsiniz:\n• "Python kodu yaz"\n• "5 + 3 hesapla"\n• "Fransa\'nın başkenti"\n• "Seni kim yaptı?"';
    }
    
    // Genel yanıt
    generalResponse(message, analysis) {
        // Daha samimi ve yardımcı
        const responses = [
            `"${message}" hakkında yardımcı olmak isterim! 🕊️ Daha spesifik sorabilir misiniz? Örneğin: "Python kodu yaz" veya "Matematik çöz"`,
            `İlginç! "${message}" için size nasıl yardımcı olabilirim? Kod yazabilirim, soru cevaplayabilirim, matematik çözebilirim!`,
            `Anladım! "${message}" konusunda elimden geleni yapacağım. Ne öğrenmek istersiniz?`,
            `"${message}" - harika bir konu! Ben Beyaz Kuş, size yardımcı olmak için buradayım. Daha detaylı anlatır mısınız?`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
}

// Global AI instance
const smartAI = new SmartAI();

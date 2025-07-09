# 🤖 RAG Web Chat - Web Sitesi Bilgilerine Dayalı AI Sohbet Uygulaması

Herhangi bir web sitesinin URL'sini girerek o sitenin içeriğini AI'ya öğretin ve site hakkında detaylı sorular sorun. Modern RAG (Retrieval-Augmented Generation) sistemi ile web sitelerinin bilgilerini anlık olarak AI'ya entegre edin.

## 🌟 Özellikler

### 🌐 Web Sitesi İşleme
- **URL Girişi**: Herhangi bir web sitesinin URL'sini girerek otomatik içerik çıkarma
- **Akıllı Scraping**: Web sayfalarından temiz metin ve başlık bilgilerini çıkarma
- **Vektör Depolama**: Pinecone veritabanında yüksek performanslı vektör saklama
- **Gerçek Zamanlı Takip**: İşlenen web sitelerinin canlı izlenmesi

### 💬 Site Tabanlı Sohbet
- **RAG Sistemi**: Sadece girilen web sitelerinin bilgileri temelinde doğru yanıtlar
- **Kaynak Referansları**: Her yanıtla birlikte kaynak web sitesi bilgileri
- **Hızlı Yanıtlar**: Google Gemini AI ile optimize edilmiş performans
- **Türkçe Desteği**: Tam Türkçe arayüz ve etkileşim

### 🎨 Modern Arayüz
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu
- **Kullanıcı Dostu**: Sezgisel ve temiz arayüz
- **Gerçek Zamanlı**: Canlı durum güncellemeleri
- **Erişilebilirlik**: WCAG standartlarına uygun

## 🚀 Teknolojiler

### Frontend
- **Next.js 15** - React framework
- **React 19** - UI kütüphanesi
- **TypeScript** - Tip güvenliği
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Modern ikonlar

### Backend & AI
- **Google Gemini AI** - Doğal dil işleme
- **Pinecone** - Vektör veritabanı
- **Cheerio** - Web scraping
- **Axios** - HTTP istekleri

## 📦 Kurulum

### Gereksinimler
- Node.js 18.0 veya üzeri
- npm, yarn, pnpm veya bun
- Pinecone hesabı
- Google AI Studio API anahtarı

### 1. Projeyi Klonlayın
```bash
git clone https://github.com/yucel-gumus/RAG_Web_Chat.git
cd RAG_Web_Chat
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
# veya
yarn install
# veya
pnpm install
```

### 3. Ortam Değişkenlerini Ayarlayın
Proje kök dizininde `.env.local` dosyası oluşturun:

```env
# Google Gemini AI API Key
# Google AI Studio'dan alınacak API anahtarı
# https://makersuite.google.com/app/apikey
GOOGLE_API_KEY=your_google_gemini_api_key_here

# Pinecone Vector Database
# https://www.pinecone.io/
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=your_pinecone_index_name_here
PINECONE_ENVIRONMENT=your_pinecone_environment_here

# Uygulama URL'si (isteğe bağlı)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
# veya
yarn dev
# veya
pnpm dev
```

http://localhost:3000 adresinde uygulamayı görüntüleyin.

## 🚀 Deployment

### Vercel ile Deploy Etme
1. [Vercel](https://vercel.com) hesabı oluşturun
2. GitHub repository'sini Vercel'e bağlayın
3. Environment variables'ları Vercel dashboard'dan ekleyin
4. Otomatik deployment başlayacak

### Diğer Platformlar
- **Netlify**: Build command: `npm run build`, Publish directory: `out`
- **Railway**: Docker desteği ile kolay deployment
- **Heroku**: Node.js buildpack ile deploy edilebilir

## 🔧 Konfigürasyon

### Pinecone Kurulumu
1. [Pinecone](https://pinecone.io) hesabı oluşturun
2. Yeni bir index oluşturun:
   - **Dimension**: 768
   - **Metric**: cosine
   - **Pod Type**: s1.x1 (başlangıç için)

### Google AI Studio
1. [Google AI Studio](https://makersuite.google.com) hesabı oluşturun
2. API anahtarı oluşturun
3. Gemini Pro modeline erişim sağlayın

## 📖 Kullanım

### 1. Web Sitesi Ekleme
- Ana sayfada URL input alanına istediğiniz web sitesinin URL'sini girin
- "Web Sitesi Ekle" butonuna tıklayın
- Sistem otomatik olarak web sitesinin içeriğini çıkarır ve vektör veritabanına kaydeder

### 2. Sohbet Etme
- Web siteleri eklendikten sonra "Sohbet Et" butonuna tıklayın
- Soru alanına web siteleri hakkında sorularınızı yazın
- AI sadece eklenen web sitelerinin bilgileri temelinde yanıt verir

### 3. Web Sitesi Yönetimi
- Ana sayfada eklenen web sitelerini görüntüleyin
- İstenmeyen web sitelerini silin
- Pinecone veritabanı durumunu takip edin

## 🏗️ Proje Yapısı

```
src/
├── app/
│   ├── api/              # API rotaları
│   │   ├── chat/         # Sohbet API'si
│   │   ├── documents/    # Web sitesi yönetimi
│   │   ├── embed/        # Vektör embedding
│   │   └── scrape/       # Web scraping
│   ├── globals.css       # Global stiller
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Ana sayfa
├── components/
│   ├── chat/             # Sohbet komponentleri
│   │   ├── ChatContainer.tsx
│   │   ├── ChatInput.tsx
│   │   └── ChatMessage.tsx
│   ├── ui/               # UI komponentleri
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── Input.tsx
│   └── url-input/        # URL input komponentleri
│       └── UrlInput.tsx
├── lib/                  # Yardımcı kütüphaneler
│   ├── gemini.ts         # Google Gemini AI
│   ├── pinecone.ts       # Pinecone işlemleri
│   └── scraper.ts        # Web scraping
└── types/
    └── index.ts          # TypeScript tipleri
```

## 🔌 API Endpoints

### POST /api/scrape
Web sitesi içeriğini çıkarır.
```json
{
  "url": "https://example.com/article"
}
```

### POST /api/embed
İçeriği vektör veritabanına kaydeder.
```json
{
  "content": {
    "title": "Sayfa Başlığı",
    "text": "Sayfa içeriği...",
    "url": "https://example.com"
  }
}
```

### POST /api/chat
Sohbet mesajları gönderir.
```json
{
  "message": "Kullanıcı sorusu",
  "conversationId": "optional_conversation_id"
}
```

### GET /api/documents
Pinecone veritabanı istatistiklerini getirir.

## 🎯 Özelleştirme

### Tema Değiştirme
`src/app/globals.css` dosyasında Tailwind CSS değişkenlerini düzenleyin.

### AI Modeli Değiştirme
`src/lib/gemini.ts` dosyasında farklı Gemini modelleri deneyebilirsiniz.

### Vektör Boyutları
Pinecone index'i farklı embedding modelleri için yeniden konfigüre edebilirsiniz.

## 🔍 Sorun Giderme

### Yaygın Sorunlar

**Pinecone Bağlantı Hatası**
```bash
# .env.local dosyasındaki anahtarları kontrol edin
# Pinecone index'inin aktif olduğundan emin olun
```

**Google AI API Hatası**
```bash
# API anahtarının geçerli olduğundan emin olun
# Gemini modeline erişim iznini kontrol edin
```

**Web Scraping Hatası**
```bash
# URL'nin erişilebilir olduğundan emin olun
# CORS politikalarını kontrol edin
```

## 📊 Performans İpuçları

- **Web Sitesi Boyutu**: Çok büyük web sitelerinin içeriği otomatik olarak parçalara bölünür
- **Vektör Limitleri**: Pinecone planınızın limitlerini takip edin
- **API Quotas**: Google AI API kullanım limitlerini izleyin
- **Site Seçimi**: Temiz ve yapılandırılmış içerikli siteleri tercih edin

## 🤝 Katkıda Bulunma

1. Bu repository'yi fork edin: [RAG_Web_Chat](https://github.com/yucel-gumus/RAG_Web_Chat)
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🔗 Bağlantılar

- [Next.js Dokümantasyonu](https://nextjs.org/docs)
- [Google Gemini AI](https://makersuite.google.com)
- [Pinecone](https://pinecone.io)
- [Tailwind CSS](https://tailwindcss.com)

## 👨‍💻 Geliştirici

**Yücel Gümüş** - [GitHub](https://github.com/yucel-gumus)

---

⭐ Bu projeyi beğendiyseniz star vermeyi unutmayın!

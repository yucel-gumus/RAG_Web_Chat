# 🤖 RAG Chat App - AI Destekli Döküman Sohbet Uygulaması

Modern RAG (Retrieval-Augmented Generation) sistemi ile web dökümanlarını AI'ya öğreterek akıllı sohbet deneyimi yaşayın.

## 🌟 Özellikler

### 📚 Döküman Yönetimi
- **Web Scraping**: Herhangi bir web sayfasını URL ile otomatik olarak içerik çıkarma
- **Akıllı Parçalama**: Dökümanları anlamlı parçalara bölerek verimli işleme
- **Vektör Depolama**: Pinecone veritabanında yüksek performanslı vektör saklama
- **Gerçek Zamanlı Takip**: Eklenen dökümanların canlı izlenmesi

### 💬 Akıllı Sohbet
- **RAG Sistemi**: Sadece yüklenen dökümanlar temelinde doğru yanıtlar
- **Kaynak Referansları**: Her yanıtla birlikte kaynak döküman bilgileri
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
git clone https://github.com/kullanici-adi/rag-chat-app.git
cd rag-chat-app
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
`.env.local` dosyası oluşturun:

```env
# Google Gemini AI
GOOGLE_API_KEY=your_google_api_key_here

# Pinecone
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=your_pinecone_index_name_here
PINECONE_ENVIRONMENT=your_pinecone_environment_here

# Diğer (isteğe bağlı)
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

### 1. Döküman Ekleme
- Ana sayfada URL input alanına web sayfası URL'sini girin
- "Döküman Ekle" butonuna tıklayın
- Sistem otomatik olarak içeriği çıkarır ve vektör veritabanına kaydeder

### 2. Sohbet Etme
- Dökümanlar eklendikten sonra "Sohbet Et" butonuna tıklayın
- Soru alanına dökümanlarla ilgili sorularınızı yazın
- AI sadece yüklenen dökümanlar temelinde yanıt verir

### 3. Döküman Yönetimi
- Ana sayfada eklenen dökümanları görüntüleyin
- İstenmeyen dökümanları silin
- Pinecone veritabanı durumunu takip edin

## 🏗️ Proje Yapısı

```
src/
├── app/
│   ├── api/              # API rotaları
│   │   ├── chat/         # Sohbet API'si
│   │   ├── documents/    # Döküman yönetimi
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
Web sayfası içeriğini çıkarır.
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
    "title": "Makale Başlığı",
    "text": "Makale içeriği...",
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

- **Döküman Boyutu**: Çok büyük dökümanları parçalara bölün
- **Vektör Limitleri**: Pinecone planınızın limitlerini takip edin
- **API Quotas**: Google AI API kullanım limitlerini izleyin

## 🤝 Katkıda Bulunma

1. Bu repository'yi fork edin
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

**Yücel Gümüş** - [GitHub](https://github.com/kullanici-adi)

---

⭐ Bu projeyi beğendiyseniz star vermeyi unutmayın!

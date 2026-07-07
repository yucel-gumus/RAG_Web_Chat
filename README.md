# 🤖 RAG Web Chat (Smart Web Scraper RAG Assistant)

RAG Web Chat; herhangi bir web sitesinin URL'sini sisteme girerek içeriğini yapay zekaya (Gemini AI) öğretmenizi ve o web sitesine özel sorular sormanızı sağlayan gelişmiş bir **RAG (Retrieval-Augmented Generation)** web uygulamasıdır. 

---

## 🌟 Öne Çıkan Özellikler

* 🌐 **URL Tabanlı Öğrenme:** Herhangi bir genel web sitesinin URL'sini vererek saniyeler içinde içeriğini analiz edebilirsiniz.
* 🕷️ **Cheerio Web Scraping:** `cheerio` kütüphanesi kullanılarak web sayfalarındaki gereksiz kodlar (CSS, JS, reklamlar, menüler vb.) temizlenir, sadece saf metin ve hiyerarşik başlıklar ayıklanır.
* 🧠 **Vektörleştirme & Pinecone DB:** Ayıklanan metinler parçalara (chunks) bölünür, Gemini embedding modeliyle vektör haline getirilerek **Pinecone Vektör Veritabanı** üzerinde saklanır.
* 💬 **Referanslı ve Kaynaklı Sohbet:** Ajan, sorduğunuz sorulara sadece öğrettiğiniz web sitelerinin verilerine dayanarak cevap verir ve cevapların altında **kaynak gösterilen (citation) orijinal URL linklerini** listeler.
* 📊 **Vektör Veri Yönetimi:** Eklediğiniz web sitelerini listeleyebilir, veritabanından silebilir ve indeks durumunu takip edebilirsiniz.

---

## 🏗️ Mimarî Akış (RAG Pipeline)

```
[ URL Girişi ] ──► [ Cheerio Scraper ] ──► [ Metin Ayrıştırma (Next.js) ]
                                                   │
                                             (Metin Parçaları)
                                                   ▼
[ Pinecone DB ] ◄──(Vektör Kaydı / Cosine)─── [ Python API Gateway (Embedding) ]
      │
      ├─► (Benzerlik Sorgulama / K-NN) ──► [ Gemini LLM ] ──(Streaming SSE)──► [ Sohbet Ekranı ]
```

1. **Scrape (Kazıma):** Cheerio hedef sayfayı indirir ve HTML'den temiz metin çıkartır.
2. **Chunk & Embed (Parçalama):** Metinler anlamsal parçalara bölünür ve Gemini Embedding modeli ile 768 boyutlu vektörlere dönüştürülür.
3. **Index (İndeksleme):** Vektörler Pinecone DB'de saklanır.
4. **Retrieve & Respond (Getirme ve Cevaplama):** Soru sorulduğunda Pinecone üzerinden cosine similarity ile en alakalı parçalar bulunur, Gemini'a bağlam (context) olarak verilerek yanıt akışkan (streaming) şekilde üretilir.

---

## 🛠️ Teknoloji Stack

* **Frontend:** Next.js 15, React 19, TypeScript.
* **Tasarım:** TailwindCSS v4, Lucide Icons, Modern responsive arayüz.
* **Scraping:** Cheerio (API routes üzerinden client-side bypass).
* **Vektör Veritabanı:** Pinecone Vector Database.
* **Yapay Zeka & Gateway:** Google Gemini API, Python API Gateway entegrasyonu.

---

## 🚀 Kurulum ve Yerel Çalıştırma

### 1. Bağımlılıkları Yükleyin
```bash
git clone https://github.com/yucel-gumus/RAG_Web_Chat.git
cd RAG_Web_Chat
npm install
```

### 2. Çevresel Değişkenler (`.env.local`)
Kök dizinde `.env.local` oluşturun ve API geçidinizin adreslerini ekleyin:

```env
# Gemini ve Pinecone işlemlerini yürüten Python API Gateway adresi
AI_API_URL=https://python-backend-270384591051.europe-west3.run.app

# Sohbet ve Raporlama Yetkileri
GATEWAY_CLIENT_API_KEY=your_gateway_client_key
GATEWAY_ADMIN_API_KEY=your_gateway_admin_key

# Uygulama Çalışma Adresi (Geliştirme için)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Uygulamayı Başlatın
```bash
npm run dev
```
Uygulama `http://localhost:3000` adresinde başlayacaktır.

---

## 🔗 Canlı Bağlantılar
* **Canlı Demo:** [https://rag-web-chat.vercel.app/](https://rag-web-chat.vercel.app/)
* **Geliştirici GitHub:** [https://github.com/yucel-gumus](https://github.com/yucel-gumus)

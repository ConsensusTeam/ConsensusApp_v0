# Anonim Oylama Uygulaması - README

## 🌟 Proje Tanımı
Bu proje, katılımcıların anonim olarak "Günün Sorusu"na cevap verebildiği, istatistiksel veri toplayan ve premium üyelerin soru paylaşabildiği bir oylama platformudur.

## 📆 Proje Teknolojileri
**Frontend:** Next.js (TypeScript, App Router)  
**Backend:** Next.js API Routes (RESTful servis mantığıyla)  
**Veritabanı:** PostgreSQL  
**ORM:** Prisma ORM  
**Kimlik Doğrulama:** JSON Web Token (JWT)  

## ⚖️ Kullanıcı Tipleri
- **Anonim Kullanıcı:** Sadece günün sorusunu cevaplayabilir. Cevaplarken:  
  - Eğitim seviyesi  
  - Yaş aralığı  
  - Coğrafi bölge  
  bilgileri girilir.

- **Üyeler (Premium):** Aşağıdaki işlemleri yapabilir:  
  - Soru oluşturma
  - Sorulara yorum yapma  
  - Yorumları beğenme  
  - Sorulara cevap verme

**Üyelik için gereken bilgiler:**
- Ad Soyad
- Mail
- Telefon
- Eğitim seviyesi
- Yaş aralığı
- Coğrafi bölge

## 📅 Günün Sorusu
- Günlük olarak admin tarafından belirlenir.
- Cevaplar herkese açık olur.
- Her cevap seçildiğinde:
  - "X kişi seninle aynı düşünüyor"
  - "Y kişi seninle aynı hissediyor"
  şeklinde bildirim görülür.

## 📊 Veri Toplama ve İstatistikler
- Günün sorusu için gelen cevapların aşağıdaki kategorilere göre istatistikleri sunulur:
  - Yaş grubuna göre
  - Eğitim seviyesine göre
  - Coğrafi bölgeye göre

## 🌐 Sayfa Akışı
1. **Anasayfa**: Günün sorusu ve cevapları listelenir.
2. **Anonim Cevap Formu**: Görünür, ama sadece anonim kullanıcı soruyu cevaplayabilir.
3. **Üye Girişi / Kayıt**: JWT ile doğrulama.
4. **Üye Paneli**: Kendi sorularını ekleyebilir, yorum yazabilir, başkalarının sorularına cevap verebilir.
5. **Admin Paneli**: Yeni günün sorusunu belirleme ekranı.
6. **İstatistik Sayfası**: Cevap dağılım istatistikleri (grafik şeklinde).

## 🚀 Kurulum Talimatları
### 1. Depoyu Klonlayın
```bash
git clone https://github.com/kullaniciadi/anonim-oylama-app.git
cd anonim-oylama-app
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. .env Dosyasını Oluşturun
```
DATABASE_URL="postgresql://user:password@localhost:5432/anonimoylama"
JWT_SECRET="gizli_jwt_key"
```

### 4. Prisma ile Veritabanı Oluşturun
```bash
npx prisma migrate dev --name init
```

### 5. Uygulamayı Başlatın
```bash
npm run dev
```

## ✉️ API İçeriği (Seçme)
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - JWT ile giriş
- `GET /api/question/today` - Günün sorusu
- `POST /api/question/answer` - Soruya cevap
- `GET /api/question/stats` - Cevap dağılımı
- `POST /api/comment` - Yorum yapma
- `POST /api/like` - Yorum beğenme

## 🚧 Yol Haritası (Devam)
- [ ] Ödeme entegrasyonu (Premium için)
- [ ] Admin için detaylı kontrol paneli
- [ ] Gerçek zamanlı istatistikler (socket.io)
- [ ] Mobil uyumlu tasarım

---
Hazır! Bu README dosyası ile Cursor gibi AI destekli bir ortamda proje kolayca ayağa kaldırılabilir. Gerekirse sana schema ve API endpoint detaylarını da hazırlarım – sadece söylemen yeterli.


# BILIM UCHUN — Elektron kutubxona

Premium ko‘rinishdagi, telefon va kompyuterga mos elektron kutubxona. Loyiha Vite + React + Supabase asosida.

## 1. Kerakli dasturlar
- Node.js 20 yoki undan yangisi
- GitHub akkaunti
- Supabase akkaunti
- Vercel akkaunti

## 2. Kompyuterda ishga tushirish
Terminalni loyiha papkasida oching:

```bash
npm install
cp .env.example .env.local
```

`.env.local` ichiga Supabase loyiha URL va anon/publishable kalitini kiriting:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY
```

So‘ng:

```bash
npm run dev
```

## 3. Supabase sozlash
1. Supabase'da yangi loyiha yarating.
2. SQL Editor'ni oching.
3. `supabase/schema.sql` faylining ichidagi SQL kodni joylab, Run bosing.
4. Project Settings → API bo‘limidan Project URL va anon/publishable key ni oling.
5. Saytga ro‘yxatdan o‘ting.
6. SQL Editor'da README oxiridagi admin tayinlash so‘rovini emailingiz bilan moslab bajaring.

**Xavfsizlik:** `service_role` yoki secret key'ni hech qachon Vercel frontend environment variable'iga yoki GitHub'ga joylamang. Faqat anon/publishable key ishlatiladi. Admin roli faqat SQL orqali belgilanadi.

## 4. GitHub'ga yuklash
GitHub'dagi `bilim-uchun` repository'ga loyiha ichidagi fayllarni yuklang. `.env.local` faylini yuklamang.

## 5. Vercel deploy
1. Vercel'ga GitHub orqali kiring.
2. Add New → Project tanlang.
3. `bilim-uchun` repository'ni import qiling.
4. Environment Variables bo‘limiga `VITE_SUPABASE_URL` va `VITE_SUPABASE_ANON_KEY` qo‘shing.
5. Deploy bosing.

Build command: `npm run build`
Output directory: `dist`

## Hozirgi versiya
- Kirish va ro‘yxatdan o‘tish UI hamda Supabase Auth.
- Kitob katalogi, qidiruv, yosh toifalari.
- Sevimlilar, trend ro‘yxati.
- Admin/manager roli tekshiruvi va kitob metadata qo‘shish.
- Kitob so‘rovi yuborish.
- PDF ko‘ruvchi iframe.
- UZ/RU/EN interfeys almashtirish.
- Demo katalog (Supabase ulanmagan paytda).

## Keyingi rivojlantirish
- Private Storage fayllarini signed URL orqali xavfsiz ochish.
- EPUB uchun maxsus reader.
- Admin CRUD: tahrirlash/o‘chirish, buyurtmalarni boshqarish.
- Profil, reyting, izohlar va bildirishnomalar.
- Avtomatlashtirilgan testlar.

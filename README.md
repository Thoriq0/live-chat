# Live Chat Application

Simple fullstack chat app built with **Next.js App Router**, **Prisma**, and **MySQL**. Project ini sekarang memakai session cookie + polling untuk update chat, jadi aman dijalankan lokal maupun di-deploy ke Vercel tanpa custom WebSocket server.

Demo login tetap sederhana, message tersimpan di database, dan histori chat bisa dibuka lagi kapan pun.

## Features

- Login dengan cookie session berbasis JWT
- Daftar user dan histori chat tersimpan di MySQL
- Kirim pesan lewat Next.js Route Handlers
- Update chat berkala dari client dengan polling
- Prisma ORM untuk schema dan query database

## Setup

1. Clone repository

```bash
git clone https://github.com/Thoriq0/live-chat.git
cd live-chat
```

2. Buat file `.env`

```bash
cp .env.example .env
```

Isi `.env` sesuai environment kamu. Contoh lokal:

```env
DATABASE_URL="mysql://root:root@127.0.0.1:3306/livechat"
JWT_SECRET="ganti_dengan_secret_random_yang_panjang"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NODE_ENV="development"
```

3. Install dependency

```bash
npm install
```

4. Sinkronkan schema Prisma ke database

```bash
npx prisma db push
```

5. Seed user demo

```bash
node prisma/seed.js
```

User default:

- `thoriq` / `password123`
- `ahmad` / `password123`
- `husain` / `password123`

6. Jalankan project

```bash
npm run dev
```

App akan jalan di `http://localhost:3000`.

## Catatan

- Project ini sekarang tidak membutuhkan `websocket-server.js` untuk flow utama aplikasi.
- Kalau schema Prisma berubah, jalankan lagi `npx prisma db push`.
- Untuk generate Prisma client manual, pakai `npx prisma generate`.
- Logout sudah tersedia langsung di UI chat.

## Struktur Singkat

```text
live-chat/
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── login/
│   │   └── page.jsx
│   └── lib/
├── public/
├── .env.example
├── package.json
└── README.md
```

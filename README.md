# Live Chat Application

A real-time chat application built with **Next.js**, **Prisma**, **PostgreSQL**, and a custom **WebSocket server**. Proyek ini dibuat sebagai demo implementasi live chat fullstack dengan autentikasi sederhana, penyimpanan pesan, dan live update antar-user.

---

## 🚀 Features

* Realtime messaging menggunakan WebSocket
* Autentikasi user sederhana
* Chat history tersimpan di database PostgreSQL
* UI sederhana dan responsif
* Backend API menggunakan Next.js Route Handlers
* Prisma ORM untuk akses database

---

## 📦 Installation & Setup

Ikuti langkah-langkah ini setelah melakukan **clone** repository.

### 1️⃣ Clone Repository

```bash
git clone <repo-url>
cd live-chat
```

---

## 2️⃣ Buat `.env` berdasarkan `.env.example`

Buat file baru:

```bash
cp .env.example .env
```

Isi `.env` seperti berikut (sesuaikan database):

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/livechat"
NEXT_PUBLIC_JWT_SECRET="your-secret-key"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NODE_ENV="development"
```

> Pastikan database `livechat` sudah dibuat.

---

## 3️⃣ Install Dependencies

```bash
npm install
```

---

## 4️⃣ Setup Prisma

### Generate Prisma Client

```bash
npx prisma generate
```

### Push Schema ke Database

```bash
npx prisma db push
```

### (Optional) Jalankan Seeder

Jika memakai seeder custom:

```bash
npx prisma db seed
```

---

## 5️⃣ Jalankan WebSocket Server

Di terminal terpisah:

```bash
node websocket-server.js
```

WebSocket default berjalan di:

```
ws://localhost:8080
```

---

## 6️⃣ Jalankan Next.js

```bash
npm run dev
```

Aplikasi akan berjalan di:

```
http://localhost:3000
```

---

## 📂 Folder Structure

```
live-chat/
├── .env.example
├── websocket-server.js       # WebSocket backend
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # (Optional) migration history
├── src/
│   ├── app/
│   │   ├── api/              # API Route Handlers
│   │   ├── login/            # Login page
│   │   └── page.js           # Main chat page
│   ├── lib/
│   │   └── prismadb.js       # Prisma client instance
│   └── generated/            # Auto-generated Prisma client
├── public/
│   └── assets
├── package.json
├── next.config.mjs
└── README.md
```

---

## ✔ Ready to Develop

Jika semua langkah sudah benar:

* buka dua terminal
* terminal 1 → `npm run dev`
* terminal 2 → `node websocket-server.js`

Aplikasi akan siap digunakan.

---

## 📝 Notes

* WebSocket harus berjalan agar pesan realtime muncul.
* Jika database berubah, jalankan:

```bash
npx prisma db push
```

* Untuk reset database:

```bash
npx prisma migrate reset
```

Gw lupa buat signout wkwkwk

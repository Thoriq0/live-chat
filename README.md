# Live Chat Application

A real-time chat application built with **Next.js**, **Prisma**, **PostgreSQL**, and a custom **WebSocket server**. Project ini dibuat sebagai demo implementasi live chat fullstack dengan autentikasi sederhana, penyimpanan pesan, dan live update antar-user.

---

Gw ada buat demo nya, yang pake method broadcast tapi nya lo bisa liat di branch broadcast ini sama. untuk akses user nya udah ada dihalaman login nya tinggal copas aja udah bisa login, ini link demo nya : [Live Chat Demo](https://live-chat-three-pi.vercel.app/)

## 🚀 Features

* 🔌 Realtime messaging menggunakan WebSocket
* 🔐 Autentikasi user sederhana
* 💾 Chat history tersimpan di PostgreSQL
* ⚡ Next.js Route Handlers untuk API
* 🟦 Prisma ORM
* 🎨 UI sederhana & responsif

---

## 📦 Installation & Setup

Ikuti langkah-langkah berikut setelah melakukan **clone** repository.

---

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Thoriq0/live-chat.git
cd live-chat
```

---

## 2️⃣ Buat `.env` berdasarkan `.env.example`

```bash
cp .env.example .env
```

Lalu isi `.env` seperti berikut (sesuaikan):

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

### Jalankan Seeder

Seeder default nya ada 3 user (`thoriq`, `ahmad`, `husian`) dengan password:

```
password123
```

kalo pengen ingin custom password, pake `hash.js` yang ada di root, jangan lupa ubah value nya abis itu jalanin buat dapet bcrypt nya:

```bash
node hash.js
```

custome username nya ada di `prisma/seed.js`

kalo udah jalankan seeder:

```bash
npx prisma db seed
# atau
node prisma/seed.js
```

---

## 5️⃣ Jalankan WebSocket Server

Di terminal terpisah:

```bash
node websocket-server.js
```

WebSocket berjalan di:

```
ws://localhost:8080
```

---

## 6️⃣ Jalankan Next.js

```bash
npm run dev
```

Aplikasi berjalan di:

```
http://localhost:3000
```

---

## 📂 Folder Structure

```
live-chat/
├── .env.example
├── websocket-server.js # WebSocket backend
├── prisma/
│ ├── schema.prisma # Database schema
│ └── migrations/ # (Optional) migration history
├── src/
│ ├── app/
│ │ ├── api/ # API Route Handlers
│ │ ├── login/ # Login page
│ │ └── page.js # Main chat page
│ ├── lib/
│ │ └── prismadb.js # Prisma client instance
│ └── generated/ # Auto-generated Prisma client
├── public/
│ └── assets
├── package.json
├── next.config.mjs
└── README.md
```

---

## ✔ Ready to Develop

Jalankan dua terminal:

**Terminal 1**

```bash
npm run dev
```

**Terminal 2**

```bash
node websocket-server.js
```

Aplikasi siap digunakan.

---

## 📝 Notes

* WebSocket **wajib** berjalan untuk realtime message.
* Jika schema berubah:

```bash
npx prisma db push
```

* Untuk reset database + seed:

```bash
npx prisma migrate reset
```

* Belum ada fitur logout sama handle gagal login gw lupa buat wkwkwkk 🤣. buat sign-out nya, cukup **hapus cookie token**.

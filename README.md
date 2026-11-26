# LapakUMKM

Direktori usaha lokal berbasis Next.js, Supabase Auth/Postgres, dan pembayaran Midtrans Pro.

## Menjalankan lokal
1. Salin `.env.example` menjadi `.env.local` dan isi URL + anon key Supabase, service-role key, Midtrans server/client key, serta URL situs.
2. Jalankan `supabase/schema.sql` di Supabase SQL Editor. Jika schema awal sudah pernah dijalankan, jalankan versi terbaru ini untuk menambahkan paket Pro dan fungsi webhook.
3. Di Supabase Authentication, atur URL aplikasi dan email verification.
4. Install dan jalankan `npm install` lalu `npm run dev`.
5. Buka `http://localhost:3000`. Data akun dan lapak tersimpan di Supabase; draft form disimpan di localStorage.

## Midtrans
Snap popup dimuat dari `https://app.sandbox.midtrans.com/snap/snap.js` atau `https://app.midtrans.com/snap/snap.js` sesuai `MIDTRANS_IS_PRODUCTION`. Atur:

- `MIDTRANS_SERVER_KEY` sebagai secret server-side.
- `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` sebagai Client Key untuk Snap.js.
- `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=true` hanya untuk production (di samping `MIDTRANS_IS_PRODUCTION=true`).
- `MIDTRANS_IS_PRODUCTION=false` untuk sandbox.
- Payment Notification URL di dashboard Midtrans: `https://<domain-anda>/api/payment/midtrans-webhook`.

Pilihan paket dan harga divalidasi di server: 1 bulan Rp25.000, 6 bulan + 1 bulan bonus Rp125.000, 1 tahun + 3 bulan bonus Rp199.000. Aktivasi Pro hanya dilakukan webhook setelah verifikasi signature dan pencocokan transaksi. Callback browser tidak mengaktifkan status Pro.

Jangan pernah mengirim service-role key atau server key ke browser, GitHub, atau chat.

## Batas fitur saat ini
Listing usaha dan paket Pro sudah tersambung ke database. Upload foto/video dan katalog produk individual belum diimplementasikan; manfaat tersebut saat ini hanya ditampilkan sebagai batas/fitur paket.

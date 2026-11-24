# LapakUMKM

Direktori usaha lokal berbasis Next.js, Supabase Auth/Postgres, dan pembayaran Midtrans Pro.

## Menjalankan lokal
1. Salin `.env.example` menjadi `.env.local` dan isi URL + anon key Supabase, service-role key, serta server key Midtrans.
2. Jalankan `supabase/schema.sql` sekali pada Supabase SQL Editor.
3. Di Supabase Authentication, atur URL aplikasi dan email verification. Saat development, nonaktifkan email confirmation jika ingin langsung mencoba pendaftaran.
4. Install dan jalankan:

   ```bash
   npm install
   npm run dev
   ```

5. Buka `http://localhost:3000`. Pendaftaran draft dicache di localStorage; akun, lapak, dan status Pro tersimpan di Postgres.

## Midtrans
Atur `MIDTRANS_SERVER_KEY`, `MIDTRANS_IS_PRODUCTION=false` untuk sandbox, dan `NEXT_PUBLIC_SITE_URL`. Pada dashboard Midtrans set Payment Notification URL ke:

`https://<domain-anda>/api/payment/midtrans-webhook`

Gunakan server key yang sama dengan environment yang dipilih. Webhook memverifikasi signature Midtrans, memeriksa nilai pembayaran terhadap order tersimpan, lalu mengaktifkan masa Pro. Jangan pernah mengirim service-role key atau server key ke browser.

## Catatan
- Demo lapak hanya fallback tampilan jika database belum terhubung; data pendaftaran tidak dianggap tersimpan sampai Supabase berhasil merespons.
- Database harus dibuat dari schema di `supabase/schema.sql` sebelum pendaftaran/pembayaran dapat digunakan.
- Gambar/video dan listing produk terpisah belum diunggah/ditangani pada versi ini; fitur paket Pro menyiapkan batas produk/media, bukan storage upload.

# RZP - Sistem Manajemen Penawaran & Invoice (Offline-First)

Selamat datang di sistem manajemen Penawaran dan Invoice RZP! Aplikasi ini dibangun menggunakan Next.js 14+ (TypeScript) dan dirancang dengan pendekatan **Offline-First**, memungkinkan tim Anda untuk tetap bekerja dan mencatat data meskipun tanpa koneksi internet. Data akan disimpan secara lokal di browser dan akan disinkronkan ke Supabase saat koneksi internet tersedia.

## Fitur Utama

-   **Offline-First**: Bekerja tanpa internet. Data disimpan lokal dan disinkronkan otomatis.
-   **Manajemen Penawaran**: Buat, edit, dan kelola penawaran harga.
-   **Manajemen Invoice**: Buat, edit, dan kelola invoice.
-   **Manajemen Master Data**: Kelola daftar Produk/Layanan dan Klien.
-   **Upload Lampiran**: Lampirkan gambar atau PDF ke penawaran/invoice (dengan kompresi otomatis).
-   **Export PDF**: Cetak atau simpan dokumen penawaran/invoice ke format PDF.
-   **Autentikasi**: Login pengguna dengan peran (Admin/Pegawai).
-   **Dashboard**: Ringkasan statistik dan galeri lampiran proyek.
-   **Teknologi**: Next.js 14+, TypeScript, React, Supabase (untuk backend online).

## Persyaratan Sistem

Pastikan Anda memiliki perangkat lunak berikut terinstal di komputer Anda:

-   [Node.js](https://nodejs.org/en/) (versi 18.x atau lebih baru)
-   [npm](https://www.npmjs.com/) atau [Yarn](https://yarnpkg.com/) (manajer paket Node.js)

## Instalasi dan Setup (Mode Offline)

Untuk menjalankan proyek ini secara lokal dan *offline-first*:

1.  **Ekstrak File Proyek**:
    Ekstrak file ZIP proyek ke lokasi yang Anda inginkan di komputer Anda.

2.  **Instal Dependensi**:
    Buka terminal atau Command Prompt, navigasikan ke folder proyek yang sudah diekstrak, lalu jalankan perintah berikut:

    ```bash
    npm install
    # atau jika menggunakan yarn
    # yarn install
    ```

3.  **Siapkan Environment Variables (Opsional untuk Offline)**:
    Meskipun Anda akan bekerja secara offline, file `.env.local` tetap diperlukan untuk struktur proyek Next.js. Untuk saat ini, Anda bisa mengosongkan nilai Supabase atau menggunakan placeholder.

    Buat file bernama `.env.local` di root folder proyek Anda (jika belum ada), lalu isi dengan konten berikut:

    ```dotenv
    # URL Supabase (alamat proyek)
    NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co

    # Kunci publik untuk operasi client
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

    # Kunci rahasia admin (hanya untuk server-side)
    SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
    ```
    **Catatan**: Untuk mode offline, nilai-nilai ini tidak akan digunakan secara aktif untuk koneksi ke database Supabase, tetapi diperlukan agar aplikasi dapat berjalan tanpa error konfigurasi.

4.  **Jalankan Aplikasi**:
    Setelah semua dependensi terinstal, jalankan aplikasi dalam mode pengembangan:

    ```bash
    npm run dev
    # atau jika menggunakan yarn
    # yarn dev
    ```

    Aplikasi akan terbuka di browser Anda, biasanya di `http://localhost:3000`.

## Penggunaan Mode Offline

Aplikasi ini dirancang untuk bekerja secara mulus dalam mode offline:

-   **Penyimpanan Lokal**: Semua data (produk, klien, penawaran, invoice, lampiran) yang Anda masukkan akan disimpan secara otomatis di `LocalStorage` browser Anda. Ini berarti Anda bisa menutup browser dan membukanya kembali, data Anda akan tetap ada.
-   **Sinkronisasi Otomatis**: Saat koneksi internet terdeteksi, aplikasi akan secara otomatis mencoba mengirim data yang tersimpan di `LocalStorage` ke server Supabase. Anda tidak perlu melakukan tindakan manual untuk sinkronisasi.
-   **Login**: Untuk login pertama kali, Anda bisa menggunakan kredensial default yang sudah ada di `LocalStorage` browser Anda (jika belum pernah terhubung ke Supabase online).
    -   **Admin**: `admin` / `admin123`
    -   **Pegawai**: `pegawai` / `rzp2025`

## Struktur Proyek

-   `pages/`: Berisi halaman-halaman utama aplikasi (login, dashboard, products, clients, penawaran/baru, invoice/baru).
-   `pages/api/`: Berisi API Routes yang berfungsi sebagai backend aplikasi (login, register, products, clients, quotes, invoices, upload).
-   `lib/`: Berisi file-file utilitas dan konfigurasi (supabaseClient, supabaseAdmin, types, utils, offlineSync).
-   `components/`: Berisi komponen React yang dapat digunakan kembali (misalnya `AppLayout` untuk sidebar).

**Struktur aktual yang terdeteksi pada proyek ini saat ini:**
- File halaman dan API masih berada di root folder proyek, belum dipisah ke folder `pages/`, `pages/api/`, `lib/`, dan `components/`.
- Untuk membuat aplikasi berjalan konsisten di Next.js, file-file tersebut perlu dipindahkan ke struktur standar Next.js.

## Catatan Penting

-   **Database Supabase**: Saat ini, aplikasi berjalan dalam mode offline-first. Untuk mengaktifkan sinkronisasi online, Anda perlu mengkonfigurasi database Supabase Anda sesuai dengan `schema.sql` dan mengisi `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, serta `SUPABASE_SERVICE_ROLE_KEY` di file `.env.local` dengan nilai yang benar dari proyek Supabase Anda.
-   **Upload File**: Saat offline, file lampiran akan disimpan sebagai Base64 di `LocalStorage`. Saat online, file tersebut akan diunggah ke Supabase Storage.
-   **Kompresi Gambar**: Gambar yang diunggah akan otomatis dikompresi untuk menghemat ruang penyimpanan lokal dan mempercepat upload.

---

Selamat bekerja! Jika ada pertanyaan atau kendala, silakan hubungi pengembang utama.

---
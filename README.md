# 🎀 Cute Romantic Photobooth

Website photobooth lucu bernuansa romantis dengan tema kuning putih. Dibuat sepenuhnya di sisi client (tanpa backend), langsung bisa membuka kamera dan memotret!

---

## Fitur

- **Pilihan Jumlah Foto** — Pilih 1, 2, 3, atau 4 foto dalam satu sesi pemotretan.
- **Filter Foto** — Tersedia 5 pilihan filter: Normal, Warm, B&W, Vintage, dan Pink.
- **Pilihan Warna Frame** — 4 variasi warna frame: Putih, Pink, Kuning, dan Hitam.
- **Countdown Otomatis** — Hitung mundur 3 detik sebelum setiap jepretan.
- **Efek Flash** — Efek kilat kamera saat foto diambil.
- **Thumbnail Preview** — Foto yang sudah diambil langsung tampil sebagai thumbnail kecil di layar kamera.
- **Foto Strip dengan Bingkai** — Hasil foto otomatis disusun dalam format strip photobooth vertikal dengan bingkai dekoratif, tanggal, dan boneka lucu (teddy bear & bunny) yang digambar langsung di canvas.
- **Download Hasil** — Unduh hasil foto strip sebagai file PNG berkualitas tinggi dengan satu klik.
- **Tanpa Backend** — Semua proses berjalan di browser. Tidak perlu server, tidak perlu instalasi.

---

## Cara Menggunakan

1. Buka file `index.html` di browser modern (Chrome, Edge, Firefox).
2. Izinkan akses kamera saat diminta.
3. Pilih jumlah foto, filter, dan warna frame sesuai keinginan.
4. Klik tombol **"Mulai Foto"**.
5. Berpose! Tunggu hitung mundur 3 detik untuk setiap foto.
6. Setelah semua foto selesai, hasil strip akan otomatis dibuat.
7. Klik **"Download Foto"** untuk mengunduh hasilnya.
8. Klik **"Foto Lagi"** jika ingin mengulang.

---

## Struktur File

```
fotobooth/
├── index.html          # Halaman utama
├── style.css           # Seluruh styling dan animasi
├── app.js              # Logika kamera, filter, dan rendering canvas
└── README.md           # Dokumentasi (file ini)
```

---

## Teknologi

| Komponen | Teknologi |
|---|---|
| Struktur | HTML5 |
| Styling | CSS3 (Vanilla) |
| Logika | JavaScript (Vanilla) |
| Kamera | MediaDevices API (`getUserMedia`) |
| Rendering Foto | Canvas 2D API |
| Font | Google Fonts (Outfit, Quicksand, Dancing Script) |

---

## Persyaratan

- Browser modern yang mendukung `getUserMedia` (Chrome 53+, Firefox 36+, Edge 12+).
- Perangkat dengan kamera (webcam laptop atau kamera HP).
- Koneksi internet hanya diperlukan untuk memuat Google Fonts pada kunjungan pertama.

---

## Catatan

- Semua foto diproses secara lokal di browser kamu. **Tidak ada foto yang dikirim ke server manapun.**
- Filter diterapkan secara pixel-level pada canvas, bukan hanya CSS filter, sehingga hasil download sudah termasuk efek filter.
- Boneka teddy bear dan bunny pada frame digambar menggunakan Canvas 2D API, sehingga tidak memerlukan file gambar tambahan dan tidak memiliki masalah background.

---

Dibuat dengan ♡

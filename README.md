# 🎀 Cute Premium Photobooth

Website photobooth lucu dengan sistem pemilihan bingkai (frame) yang kompleks dan premium. Dibuat sepenuhnya di sisi client (tanpa backend), langsung bisa membuka kamera dan memotret dengan berbagai tema menarik!

---

## ✨ Fitur Utama

- **🖼️ 10 Tema Bingkai Premium** — Pilihan tema beragam mulai dari *Classic*, *Romantic Pink*, hingga tema eksklusif **Bank Perunggu** (Maroon & Bronze), *Sakura Garden*, dan *Midnight Dark*.
- **🎨 UI Glassmorphism Premium** — Antarmuka modern dengan efek blur transparan yang cantik dan animasi yang halus.
- **📸 7 Filter Foto** — Pilihan filter: Normal, Warm, B&W, Vintage, Pink, Cool, dan Drama.
- **⚙️ Pengaturan Fleksibel** — Pilih jumlah jepretan (1-4 foto) dalam satu sesi.
- **🌸 Dekorasi Melimpah** — Latar belakang interaktif dengan bunga-bunga mengambang, kupu-kupu, boneka lucu, dan efek partikel bercahaya.
- **📷 Fitur Kamera Lengkap** — Countdown otomatis, efek flash, and thumbnail preview saat pemotretan.
- **🎨 Rendering Canvas Cerdas** — Hasil foto strip dibuat secara otomatis dengan dekorasi khusus sesuai tema yang dipilih.
- **📥 Download Berkualitas** — Unduh hasil foto strip sebagai file PNG berkualitas tinggi langsung ke perangkatmu.
- **🔒 Privasi Terjamin** — Semua proses dilakukan di browser kamu. Tidak ada data atau foto yang dikirim ke server.

---

## 🚀 Cara Menggunakan

1. Buka file `index.html` di browser modern (Chrome, Edge, Firefox).
2. **Pilih Bingkai**: Pilih satu dari 10 tema bingkai yang tersedia, lalu klik "Lanjut Pilih Setting".
3. **Pilih Setting**: Atur jumlah foto dan pilih filter yang kamu sukai.
4. **Mulai Foto**: Klik tombol "Mulai Foto" dan izinkan akses kamera.
5. **Berpose**: Tunggu hitung mundur untuk setiap foto.
6. **Download**: Klik "Download Foto" untuk menyimpan hasil strip kamu.

---

## 📂 Struktur Project

```
fotobooth/
├── index.html          # Struktur halaman dengan sistem multi-screen
├── style.css           # Styling premium, animasi, dan desain responsif
├── app.js              # Logika sistem tema, kamera, dan rendering canvas
├── doll_premium.png    # Aset dekorasi boneka
├── doll1.png           # Aset dekorasi boneka tambahan
└── README.md           # Dokumentasi project
```

---

## 🛠️ Teknologi

| Komponen | Teknologi |
|---|---|
| Struktur | HTML5 Semantic Elements |
| Styling | CSS3 (Vanilla) dengan Variabel & CSS Animations |
| Logika | JavaScript (ES6+) |
| Kamera | WebRTC MediaDevices API |
| Rendering | HTML5 Canvas 2D API |
| Font | Google Fonts (Outfit, Dancing Script, Playfair Display) |

---

## 📝 Catatan Teknis

- **Bank Perunggu Theme**: Tema khusus dengan nuansa Merah Marun dan aksen Perunggu/Emas yang memberikan kesan mewah.
- **Canvas Drawing**: Ornamen boneka teddy bear dan bunny digambar secara dinamis menggunakan path canvas agar tetap tajam di resolusi apapun tanpa file gambar berat.
- **Filter Pixel-Level**: Filter diterapkan langsung pada data pixel canvas untuk memastikan hasil download identik dengan yang terlihat di layar.

---

Dibuat dengan ♡ untuk momen manismu!

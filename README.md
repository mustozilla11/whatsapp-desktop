<div align="center">

# 💬 WhatsApp Masaüstü (Linux / KDE Plasma)

**CachyOS ve Linux masaüstü ortamları için ultra hafif, yerel WebKitGTK ve Tauri v2 tabanlı WhatsApp istemcisi.**

[![Rust](https://img.shields.io/badge/Rust-1.80%2B-orange?logo=rust)](https://www.rust-lang.org/)
[![Tauri](https://img.shields.io/badge/Tauri-v2.0-24C8DB?logo=tauri)](https://tauri.app/)
[![WebKitGTK](https://img.shields.io/badge/Engine-WebKitGTK-blue)](https://webkitgtk.org/)
[![Version](https://img.shields.io/badge/Version-v0.3.1-green)](https://github.com/mustozilla11/whatsapp-desktop/releases)
[![Platform](https://img.shields.io/badge/Platform-Linux%20(KDE%2FGNOME)-lightgrey?logo=linux)](https://github.com/mustozilla11/whatsapp-desktop)
[![License](https://img.shields.io/badge/License-MIT-purple)](LICENSE)

</div>

---

## 🌟 Neden Bu Uygulama?

Piyasadaki çoğu WhatsApp istemcisi arka planda 300-500 MB RAM tüketen ve yüksek pil harcayan hantal **Electron** motorları kullanır. 

Bu proje, sistemin yerel **WebKitGTK** kütüphanesini ve **Rust (Tauri v2)** altyapısını kullanarak yalnızca **~12 MB** ikili dosya boyutuyla ve boşta **%0 CPU** tüketimiyle çalışır.

---

## ✨ Öne Çıkan Özellikler

- 🚀 **Ultra Hafif & Hızlı:** Electron yerine yerel WebKitGTK motoru kullanılır; sadece ~12 MB binary boyutu ve minimum RAM kullanımı.
- 🛡️ **Sıfır Ban Riski:** Doğrudan resmi `web.whatsapp.com` adresini render eder; Web soket, Noise/Signal şifreleme ve QR kod eşleştirmesi tıpkı bir tarayıcı gibi yerel çalışır.
- 🔒 **Güvenli PIN Kilit Ekranı:** WhatsApp'ın karanlık temasına uygun PIN kilit ekranı. Şifreniz açık metin olarak değil, **SHA-256** ile özetlenerek yerel olarak saklanır.
- 🔕 **Gizlilik Odaklı Masaüstü Bildirimleri:** Ekrana gelen KDE Plasma bildirimlerinde mesaj içeriği tamamen filtrelenir; ekrana bakanların mesajı okumaması için sadece **"WhatsApp - Yeni mesaj: [Gönderen]"** şeklinde gösterilir.
- ⚡ **Arka Planda Kesintisiz Çalışma (Zero-Throttling):** Pencere kapatıldığında veya tepsiye gizlendiğinde bağlantı askıya alınmaz (`BackgroundThrottlingPolicy::Disabled`); mesajlar arka planda da anında düşer.
- 📌 **Sistem Tepsisi (Tray) Entegrasyonu:** Pencere `X` butonuyla kapatıldığında sonlanmaz, sistem tepsisine sessizce küçülür.
- 🛡️ **Tek Örnek (Single-Instance) Koruması:** Uygulama zaten açıkken menüden veya terminalden tekrar açmaya çalıştığınızda ikinci bir kopya açılmaz, var olan pencere öne gelir ve odaklanır.
- 🐧 **KDE Plasma Entegrasyonu:** Uygulama menüsünde (Kickoff / KRunner) görünmesi için `.desktop` başlatıcısı ve `~/.local/bin` sembolik bağı (symlink).

---

## 📦 Kurulum ve Derleme

### Gereksinimler (CachyOS / Arch Linux)
Sisteminizde Rust ve WebKitGTK kütüphanelerinin bulunması yeterlidir:

```bash
sudo pacman -S rust cargo webkit2gtk-4.1 ayatana-appindicator3 libnotify
```

### Kaynak Koddan Derleme

```bash
# Repoyu klonlayın
git clone https://github.com/mustozilla11/whatsapp-desktop.git
cd whatsapp-desktop

# Optimize edilmiş release sürümünü derleyin
cargo build --release
```

Derlenen ikili dosya `target/release/whatsapp-desktop` konumunda oluşur (~12 MB).

---

## 🚀 Masaüstü Entegrasyonu

Uygulamayı KDE / GNOME menüsüne eklemek ve terminalden tek komutla çalıştırmak için:

```bash
# Terminalden 'whatsapp-desktop' olarak çalıştırmak için sembolik bağ:
mkdir -p ~/.local/bin
ln -sf $(pwd)/target/release/whatsapp-desktop ~/.local/bin/whatsapp-desktop

# KDE / Masaüstü menüsüne eklemek için:
mkdir -p ~/.local/share/applications
cp whatsapp-desktop.desktop ~/.local/share/applications/
update-desktop-database ~/.local/share/applications/
```

### Sistem Başlangıcında Otomatik Başlatma (İsteğe Bağlı)
Bilgisayar açıldığında WhatsApp'ın otomatik olarak arka planda başlamasını isterseniz:

```bash
mkdir -p ~/.config/autostart
cp whatsapp-desktop.desktop ~/.config/autostart/
```

---

## 💡 Kullanım

- **Başlatma:** KDE menüsünü açıp **WhatsApp** yazın veya terminalden `whatsapp-desktop &` çalıştırın.
- **Sistem Tepsisi:**
  - **Sol Tık:** WhatsApp penceresini gösterir / gizler.
  - **Sağ Tık Menüsü:**
    - `WhatsApp v0.3.1` (Sürüm bilgisi)
    - `🔒 Uygulamayı Kilitle` (Anında PIN kilidine alır)
    - `🔑 PIN Ayarla / Değiştir` (PIN kodunu günceller veya kaldırır)
    - `Göster / Gizle`
    - `Yeniden Yükle` (Sayfayı yeniler)
    - `Çıkış` (Uygulamayı tamamen kapatır)

---

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) kapsamında açık kaynak olarak paylaşılmıştır.

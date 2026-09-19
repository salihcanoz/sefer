# Sefer · Hac ve Umre Rehberi

HTML, CSS (Flexbox) ve JavaScript ile hazırlanmış Türkçe hac ve umre rehberi. Derleme, npm kurulumu, sunucu uygulaması veya API anahtarı gerektirmez.

## Özellikler

- İhram ve mikat rehberi; Arapça dualar, Türkçe okunuşları ve anlamları.
- Umre için sıralı tavaf ve sa‘y takibi; bağımsız tavaf ve ibadet raporları.
- Mekke ve Medine çevresinde 55 ziyaret yeri, ziyaret tarihleri ve raporları.
- İnteraktif ziyaret haritası: şehir, arama ve ziyaret durumu filtreleri.
- Otel adresi ve isteğe bağlı güncel konum kaydı.
- Kur’an, Nusuk ve elektronik vize bağlantıları.

## GitHub’a yükleme

1. GitHub’da yeni bir repository oluşturun (örneğin `sefer`).
2. Bu klasörün **içindeki dosyaları ve vendor klasörünü**, repository’nin köküne yükleyin. `index.html` doğrudan kökte bulunmalı; ZIP dosyasını tek dosya olarak yüklemeyin.
3. Değişiklikleri kaydedin (Commit changes).

## GitHub Pages ile yayımlama

1. Repository’de **Settings → Pages** bölümünü açın.
2. **Source → Deploy from a branch** seçin.
3. **main** dalını ve **/(root)** klasörünü seçip **Save** düğmesine basın.
4. Yayımlama tamamlandığında Pages ekranındaki adresi açın. Proje sitesi genellikle `https://KULLANICI.github.io/sefer/` biçimindedir.

GitHub Pages kullanılabilirliği hesap planına ve repository görünürlüğüne bağlıdır. Resmî yönerge: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Bilgisayarda çalıştırma

Python 3 kuruluysa bu klasörde terminal açıp çalıştırın:

```sh
python3 -m http.server 8080
```

Ardından `http://localhost:8080` adresini açın. VS Code Live Server da kullanılabilir. Dosyaları doğrudan `file://` ile açmak yerine yerel HTTP sunucusu kullanın. Konum izni HTTPS veya localhost üzerinde çalışır.

## Dosyalar

- `index.html`: sayfa iskeleti ve script sırası.
- `styles.css`: görünüm ve mobil düzen.
- `app.js`: menüler, sayfalar, otel kaydı ve dua gösterimi.
- `prayers-data.js`: dua içerikleri.
- `tracker.js`: tavaf, umre ve rapor takibi.
- `places-data.js`: ziyaret yerleri ve kaynakları.
- `place-photos.js`: fotoğraf adresleri, lisans ve kaynak bilgileri.
- `visits.js`: ziyaret kaydı ve raporu.
- `map-points.js`: harita konumları ve yaklaşık bölge açıklamaları.
- `visit-map.js`: harita ve filtreler.
- `vendor/`: yerel Leaflet kütüphanesi ve lisansı.

Yeni ziyaret yeri eklerken benzersiz `id` kullanın ve aynı kimlikle `map-points.js` dosyasına konum kaydı ekleyin. Eski kimlikleri değiştirmek mevcut ziyaret kayıtlarının eşleşmesini bozar.

## Kişisel kayıtlar ve internet

Otel, ziyaret ve ibadet kayıtları tarayıcının localStorage alanındadır; bu kaynak dosyalarının içinde bulunmaz. Alan adına bağlı oldukları için mevcut Sites adresindeki kayıtlar yeni GitHub Pages adresine otomatik taşınmaz. Tarayıcı verileri silinirse kayıtlar da silinir.

Harita zemini OpenStreetMap’ten; bazı fotoğraflar Wikimedia Commons’tan ve yazı tipleri Google Fonts’tan yüklenir. Site tam çevrimdışı uygulama değildir. Harita konumları giriş kapısı veya yürüyüş rotası anlamına gelmez; yaklaşık yerler açıklamalarda belirtilmiştir.

## Kaynak ve lisanslar

Leaflet lisansı `vendor/leaflet-LICENSE.txt` dosyasındadır. OpenStreetMap verileri ODbL kapsamındadır; kaynak bağlantıları `map-points.js` içinde korunur. Fotoğrafların ayrı lisansları ve atıfları `place-photos.js` dosyasındadır. Bu atıfları koruyun. Dinî ve tarihî içerik kaynakları ilgili kartlarda gösterilir. Projenin tamamı için bu pakette ayrıca bir açık kaynak lisansı atanmadı.

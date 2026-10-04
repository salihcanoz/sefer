# Sefer · Hac ve Umre Rehberi

HTML, CSS (Flexbox) ve JavaScript ile hazırlanmış Türkçe ve Hollandaca hac ve umre rehberi. Derleme, npm kurulumu, sunucu uygulaması veya API anahtarı gerektirmez.

## Özellikler

- 🇹🇷 / 🇳🇱 dil seçimi; kayıtlı tercih yoksa tarayıcı diline göre Hollandaca veya Türkçe açılır.

- İhram ve mikat rehberi; Arapça dualar, Türkçe ve yaklaşık Hollandaca okunuş yardımları ve anlamları.
- Umre için sıralı tavaf ve sa‘y takibi; fazladan tavaf ve ibadet raporları.
- Mekke ve Medine çevresinde 81 ziyaret yeri, ziyaret tarihleri ve raporları.
- İnteraktif ziyaret haritası: şehir, arama ve ziyaret durumu filtreleri.
- Otel adresi ve isteğe bağlı güncel konum kaydı.
- Kur’an, Nusuk ve elektronik vize bağlantıları.
- İnternetsiz kullanım: ilk ziyaretten sonra rehber, dualar ve görülen fotoğraflar çevrimdışı da açılır; ana ekrana eklenebilir (PWA).

## Dosya yapısı

- `app.js`: ortak yardımcılar, sayfa yönlendirme ve başlangıç. `pages.js`: ana sayfa ve sabit rehber sayfaları. `hotel.js`: otel kayıtları ve konum. `prayer-library.js`: dua kütüphanesi. `tracker.js`: tavaf ve sa‘y takibi. `visits.js` / `visit-map.js`: ziyaret yerleri ve harita.
- `i18n.js` + `nl.js`: Hollandaca çeviri. `nl.js` yalnızca Hollandaca seçildiğinde yüklenir.
- `sw.js`: çevrimdışı önbellek. Dosya eklerken, silerken veya adını değiştirirken `APP_FILES` listesini güncelleyin ve `VERSION` değerini artırın.
- `images/thumbs/`: sayfada gösterilen küçültülmüş fotoğraflar (en fazla 480 px). `fonts/`: yerel yazı tipleri (SIL OFL).

Yeni bir metin eklerken Hollandaca karşılığını `nl.js` dosyasına ekleyin. Eksik çevirileri görmek için `node tools/check-translations.mjs` (Node 22+ ve Google Chrome gerekir) komutunu çalıştırın.

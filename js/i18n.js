/* ============================================================
   VISORA — i18n.js  v2
   Professional Multilingual Engine
   ─────────────────────────────────────────────────────────────
   Architecture:
   • Tries to load from /locales/{lang}/*.json (HTTP server)
   • Falls back to INLINE_TRANSLATIONS (file:// compatible)
   • Smooth fade veil transition on language switch
   • URL param ?lang=xx  +  localStorage persistence
   • data-i18n="dotted.key"  →  sets textContent
   • data-i18n-placeholder   →  sets placeholder attr
   • data-i18n-aria          →  sets aria-label attr
   • Scalable: add new locale objects to INLINE_TRANSLATIONS
   ============================================================ */

(function (global) {
  'use strict';

  /* ──────────────────────────────────────────────────────────
     INLINE TRANSLATIONS  (fallback when fetch is unavailable)
     Structure mirrors /locales/{lang}/*.json
  ────────────────────────────────────────────────────────── */

  var INLINE = {

    /* ===================== TURKISH ===================== */
    tr: {

      /* ── Navbar / Menu ── */
      'nav.home':        'Ana Sayfa',
      'nav.collections': 'Koleksiyonlar',
      'nav.how':         'Nasıl Çalışır',
      'nav.about':       'Hakkımızda',
      'nav.contact':     'İletişim',
      'nav.search':      'Koleksiyon ara...',

      'menu.home':       'Ana Sayfa',
      'menu.collections':'Koleksiyonlar',
      'menu.how':        'Nasıl Çalışır',
      'menu.about':      'Hakkımızda',
      'menu.contact':    'İletişim',
      'menu.faq':        'Sıkça Sorulan Sorular',
      'menu.campaigns':  'Kampanyalarımız',

      /* ── Shared buttons ── */
      'btn.demo':    'Demo Görüntüle',
      'btn.create':  'Davetiyeni Oluştur',
      'btn.viewAll': 'Tüm Koleksiyonları Gör',
      'btn.contact': 'İletişime Geç',
      'btn.explore': 'Koleksiyonları Keşfet',

      /* ── Card buttons (collection slider) ── */
      'card.cta.demo':   'Demo',
      'card.cta.create': 'Oluştur',

      /* ── Footer ── */
      'footer.tagline':            'Premium dijital davetiye deneyimi. Düğün, nişan ve özel günleriniz için zarif, sinematik çözümler.',
      'footer.col.collections':    'Koleksiyonlar',
      'footer.col.corporate':      'Kurumsal',
      'footer.col.contact':        'İletişim',
      'footer.link.wedding':       'Düğün Davetiyeleri',
      'footer.link.engagement':    'Nişan Davetiyeleri',
      'footer.link.henna':         'Kına Davetiyeleri',
      'footer.link.saveTheDate':   'Save the Date',
      'footer.link.brideGroom':    'Bride & Groom Night',
      'footer.link.about':         'Hakkımızda',
      'footer.link.howItWorks':    'Nasıl Çalışır',
      'footer.link.campaigns':     'Kampanyalar',
      'footer.link.faq':           'SSS',
      'footer.link.contact':       'İletişim',
      'footer.link.whatsapp':      'WhatsApp ile Ulaşın',
      'footer.link.instagram':     '@davetiye_visora',
      'footer.copy':               '© 2025 VISORA. Tüm hakları saklıdır.',
      'footer.privacy':            'Gizlilik Politikası',
      'footer.terms':              'Kullanım Şartları',

      /* ── Homepage — hero ── */
      'hero.label':        'Premium Dijital Davetiye',
      'hero.title.line1':  'Düğününüzü Bir',
      'hero.title.accent': 'Sanat Eserine',
      'hero.title.line2':  'Dönüştürün',
      'hero.subtitle':     'Modern, zarif ve etkileyici dijital davetiyelerle en özel anlarınızı paylaşın.',
      'hero.cta':          'Koleksiyonları Keşfet',
      'hero.scroll':       'Keşfet',

      /* ── Homepage — collections ── */
      'sec.collections.label':    'Koleksiyonlar',
      'sec.collections.title.l1': 'Zarif Davetiye',
      'sec.collections.title.l2': 'Koleksiyonlarımız',
      'sec.collections.cta':      'Tüm Koleksiyonları Gör',

      'card.elegance.tag':  'Düğün',
      'card.elegance.name': 'Elegance',
      'card.elegance.desc': 'Zamansız zarafet, sonsuz güzellik',

      'card.classique.tag':  'Nişan',
      'card.classique.name': 'Classique',
      'card.classique.desc': 'Klasik estetik, modern ruh',

      'card.aura.tag':  'Kına',
      'card.aura.name': 'Aura',
      'card.aura.desc': 'Büyüleyici bir aura, sihirli bir gece',

      'card.serene.tag':  'Save the Date',
      'card.serene.name': 'Serene',
      'card.serene.desc': 'Sakin, huzurlu, unutulmaz',

      'card.romance.tag':  'Bride & Groom',
      'card.romance.name': 'Romance',
      'card.romance.desc': 'Aşkın en saf ve güzel hali',

      'card.lumiere.tag':  'Özel Gün',
      'card.lumiere.name': 'Lumière',
      'card.lumiere.desc': 'Işığın dokunduğu her an özel',

      /* ── Homepage — advantages ── */
      'sec.adv.label':    'Neden Dijital?',
      'sec.adv.title.l1': 'Dijital Davetiyenin',
      'sec.adv.title.l2': 'Avantajları',

      'adv.1.title': 'Hızlı ve Pratik',
      'adv.1.desc':  'Dakikalar içinde hazırlanan ve anında paylaşılabilen dijital davetiyeniz her zaman güncel kalır.',
      'adv.2.title': 'Çevre Dostu',
      'adv.2.desc':  'Kağıt israfı olmadan özel gününüzü dijital bir şölenle kutlayın. Hem şık hem de sorumlu bir tercih.',
      'adv.3.title': 'Her An Yanınızda',
      'adv.3.desc':  'Misafirleriniz telefon, tablet veya bilgisayardan kolayca ulaşabilir. Kaybolma endişesi yok.',
      'adv.4.title': 'Etkileşimli Deneyim',
      'adv.4.desc':  'Müzik, video, harita ve RSVP sistemiyle misafirlerinize unutulmaz bir davetiye deneyimi sunun.',

      /* ── Homepage — how it works ── */
      'sec.how.label':    'Süreç',
      'sec.how.title':    'Nasıl Çalışır?',
      'sec.how.subtitle': 'Dört adımda hayalinizdeki dijital davetiyeye ulaşın.',

      'step.1.title': 'Koleksiyon Seçin',
      'step.1.desc':  'Size en uygun tasarım koleksiyonunu seçin ve demo ile inceleyin.',
      'step.2.title': 'Bilgileri Ekleyin',
      'step.2.desc':  'Çift isimleri, tarih, mekan ve özel detaylarınızı kolayca girin.',
      'step.3.title': 'Özelleştirin',
      'step.3.desc':  'Müzik, galeri, RSVP ve daha fazlasını ekleyerek davetiyenizi kişiselleştirin.',
      'step.4.title': 'Siparişi Tamamlayın',
      'step.4.desc':  'Ödemenizi tamamlayın ve davetiyenizi anında paylaşmaya başlayın.',

      /* ── Homepage — memories ── */
      'sec.memories.label':    'Özel Anlar',
      'sec.memories.title.l1': 'Anılarınız Daima',
      'sec.memories.title.l2': 'Özel Kalsın',
      'sec.memories.body':     'Her hikâye benzersizdir. Sizin hikayeniz de özel bir davetiyeyi hak ediyor.',
      'sec.memories.cta1':     'İletişime Geç',
      'sec.memories.cta2':     'Davetiyeni Oluştur',

      /* ── Homepage — FAQ ── */
      'sec.faq.label':    'SSS',
      'sec.faq.title.l1': 'Sıkça Sorulan',
      'sec.faq.title.l2': 'Sorular',

      'faq.1.q': 'Davetiye ne kadar sürede hazırlanır?',
      'faq.1.a': 'Davetiyenizi oluşturduktan ve ödemenizi tamamladıktan sonra birkaç dakika içinde dijital davetiyeniz hazır hale gelir ve paylaşılabilir olur.',
      'faq.2.q': 'Mobil uyumlu mu?',
      'faq.2.a': 'Evet. Tüm VISORA davetiyeleri mobil, tablet ve masaüstü cihazlara tam uyumlu şekilde tasarlanmıştır. Misafirleriniz her cihazdan mükemmel bir deneyim yaşar.',
      'faq.3.q': 'Müzik ekleyebilir miyim?',
      'faq.3.a': 'Evet. Davetiyenize kendi seçtiğiniz bir müziği ekleyebilirsiniz. Misafirleriniz davetiyeyi açtığında otomatik olarak çalmaya başlar.',
      'faq.4.q': 'QR kod eklenebilir mi?',
      'faq.4.a': 'Evet. Her davetiyeye otomatik bir QR kod oluşturulur. Bu QR kodu basılı materyallere ekleyerek misafirlerinizin kolayca davetiyeye ulaşmasını sağlayabilirsiniz.',
      'faq.5.q': 'Sonradan düzenleme yapılabilir mi?',
      'faq.5.a': 'Evet. Satın aldıktan sonra kullanıcı panelinizden davetiyenizi istediğiniz zaman güncelleyebilirsiniz. Değişiklikler anında tüm misafirlere yansır.',

      /* ── Collections listing page ── */
      'gallery.page.label':    'Davetiye Koleksiyonları',
      'gallery.page.title':    'Premium Dijital<br>Davetiye Şablonları',
      'gallery.page.subtitle': 'Her koleksiyon profesyonel bir tasarım eseridir.<br>Demo görüntüle — beğendiğini seç — kendi bilgilerinle özelleştir.',
      'gallery.cat.count':     'şablon',

      /* ── Collection detail page ── */
      'col.breadcrumb.home':        'Ana Sayfa',
      'col.breadcrumb.collections': 'Koleksiyonlar',
      'col.collection.label':       'Koleksiyonu',
      'col.tagline.l1':             'Zamansız romantizm,',
      'col.tagline.accent':         'modern lüksle harmanlanmış.',
      'col.desc':                   'VISORA Elegance koleksiyonu, evlilik yolculuğunuzun başından sonuna kadar her anı zarif ve unutulmaz kılar. Premium animasyonlar, özel müzik ve sinematik tasarımla hayalinizdeki davetiyeyi yaratın.',
      'col.cta.demo':               'Demo Görüntüle',
      'col.cta.create':             'Davetiyeni Oluştur',

      /* ── Features ── */
      'sec.features.label': 'Özellikler',
      'sec.features.title': 'Neler İçerir?',

      'feat.1.title': 'Save The Date',
      'feat.1.desc':  'Etkinliğinizden önce misafirleri özel bir önbildirimle bilgilendirin',
      'feat.2.title': 'Wedding Invite',
      'feat.2.desc':  'Tüm program ve detaylarla birlikte tam dijital davetiye',
      'feat.3.title': 'Story Timeline',
      'feat.3.desc':  'İlk buluşmadan bugüne birlikte yazdığınız hikaye',
      'feat.4.title': 'Galeri',
      'feat.4.desc':  'Çektiğiniz en özel fotoğrafları davetiyenizde sergileyin',
      'feat.5.title': 'Müzik',
      'feat.5.desc':  'Özel düğün müziğinizle davetiyenize sinematik bir his katın',
      'feat.6.title': 'Dress Code',
      'feat.6.desc':  'Kıyafet kodunu zarif ve anlaşılır şekilde misafirlerinize iletin',
      'feat.7.title': 'RSVP',
      'feat.7.desc':  'Misafir katılım onayı sistemiyle davet yönetimini kolaylaştırın',
      'feat.8.title': 'Guest Book',
      'feat.8.desc':  'Misafirlerinizin tebrik mesajlarını dijital anı defterinizde toplayın',

      /* ── Similar collections ── */
      'sec.similar.label': 'Diğer Seçenekler',
      'sec.similar.title': 'Benzer Koleksiyonlar',
      'sim.badge.current': 'Mevcut',

      'sim.aurora.tag':   'Düğün',
      'sim.aurora.name':  'Aurora',
      'sim.aurora.desc':  'Altın ışıklar, sinematik an',
      'sim.luna.tag':     'Nişan',
      'sim.luna.name':    'Luna',
      'sim.luna.desc':    'Ay ışığı, sonsuz şiir',
      'sim.river.tag':    'Kına',
      'sim.river.name':   'River',
      'sim.river.desc':   'Doğanın zarif akışı',
      'sim.elegance.tag': 'Düğün',
      'sim.elegance.name':'Elegance',
      'sim.elegance.desc':'Zamansız zarafet',
      'sim.majestic.tag': 'Save the Date',
      'sim.majestic.name':'Majestic',
      'sim.majestic.desc':'İhtişam ve asalet',
      'sim.velvet.tag':   'Bride & Groom',
      'sim.velvet.name':  'Velvet',
      'sim.velvet.desc':  'Kadifenin yumuşak büyüsü',

      /* ── Story ── */
      'sec.story.label':    'Hikayemiz',
      'sec.story.title.l1': 'Sizin hikayeniz,',
      'sec.story.accent':   'bizim şölenimiz.',
      'sec.story.body1':    'Her çift birbirinden farklıdır. Sevginin dili, buluşmanın hikayesi, düğünün ruhu herkese özgüdür. VISORA olarak amacımız; bu benzersiz anları zamansız bir dijital deneyime dönüştürmektir.',
      'sec.story.body2':    'Elegance koleksiyonu, zarafetin ve duygunun buluştuğu bir tasarım dünyasıdır. Altın detaylar, botanik dokunuşlar ve sinematik bir estetikle hayalinizdeki daveti yaratıyoruz.',
      'sec.story.cta1':     'Davetiyeni Oluştur',
      'sec.story.cta2':     'İletişime Geç',

      /* ── Sipariş / Checkout sayfası ── */
      'sp.back':                'Düzenlemeye Dön',
      'sp.eyebrow':             'Sipariş Özeti',
      'sp.title':               'Davetiyenizi Tamamlayın',
      'sp.subtitle':            'Aşağıdaki özeti inceleyin ve ödemeye geçin.',
      'sp.total':               'Toplam',
      'sp.watermarkNote':       'Ödeme tamamlanana kadar davetiyenizde VISORA şeffaf filigran görünür kalacaktır. Ödeme sonrası otomatik olarak kaldırılır.',
      'sp.accTitle':            'Tasarımınızı Kaydedin',
      'sp.accDesc':             'Hesabınızla giriş yaparak davetiyenizi kaydedin, dilediğiniz zaman düzenlemeye devam edin ve siparişlerinizi görüntüleyin.',
      'sp.emailPlaceholder':    'E-posta adresiniz',
      'sp.passwordPlaceholder': 'Şifre oluşturun',
      'sp.or':                  'veya',
      'sp.accExisting':         'Mevcut hesabımla devam et',
      'sp.payLabel':            'Ödemeye Geç',
      'sp.payNote':             'Güvenli ödeme · 256-bit SSL şifreleme\nKredi kartı, banka kartı ve havale kabul edilir.',
      'sp.includes':            'Paket İçeriği',
      'sp.extras':              'Seçilen Ekstralar',
      'sp.trust.quality':       'Premium Kalite',
      'sp.trust.secure':        'Güvenli Ödeme',
      'sp.trust.instant':       'Anlık Teslimat',

      /* ── Create (Davetiye Oluştur) sayfası ── */
      'cr.pageTitle':           'Davetiyeni Oluştur',
      'cr.locked':              'Tasarım kilitlidir · Sadece içerik düzenlenebilir',
      'cr.livePreview':         'Canlı Önizleme',
      'cr.fullscreen':          'Tam Ekran Gör',
      'cr.segments':            'Segmentler',
      'cr.save':                'Kaydet',
      'cr.order':               'Ödemeyi Tamamla',
      'cr.totalLabel':          'Toplam',
      'cr.included':            'Seçtiğiniz özellikler dahil',
      /* Field labels */
      'cr.f.brideName':         'Gelin Adı',
      'cr.f.groomName':         'Damat Adı',
      'cr.f.eventDate':         'Tarih',
      'cr.f.eventTime':         'Saat',
      'cr.f.venue':             'Mekan Adı',
      'cr.f.venueCity':         'Şehir',
      'cr.f.address':           'Adres',
      'cr.f.mapLink':           'Harita Linki',
      'cr.f.inviteMessage':     'Davet Mesajı',
      'cr.f.subtitle':          'Alt Başlık',
      /* Section names */
      'cr.sec.font':            'Yazı Tipi',
      'cr.sec.music':           'Müzik',
      'cr.sec.gallery':         'Galeri Fotoğrafları',
      'cr.sec.extras':          'Ekstra Özellikler',
      'cr.sec.intro':           'Sinematik Giriş',
      /* Misc */
      'cr.presetPlaceholder':   'Hazır metin seç…',
      'cr.uploadMusic':         'Kendi Müziğini Yükle (MP3)',
      'cr.demoLabel':           'Demo',

      /* ── Contact page ── */
      'contact.page.label':              'İletişim',
      'contact.page.title':              'Size Yardımcı<br>Olmaktan Mutluluk Duyarız',
      'contact.page.subtitle':           'Sorularınız, özel istekleriniz veya işbirliği teklifleriniz için<br>bize aşağıdaki kanallardan ulaşabilirsiniz.',
      'contact.card.whatsapp.title':     'WhatsApp',
      'contact.card.whatsapp.desc':      'Hızlı destek için bize WhatsApp üzerinden yazın',
      'contact.card.whatsapp.phone':     '0537 239 58 24',
      'contact.card.email.title':        'E-posta',
      'contact.card.instagram.title':    'Instagram',
      'contact.card.hours.title':        'Çalışma Saatleri',
      'contact.card.hours.desc':         'Her gün 09:00 – 21:00 arası yanıt veriyoruz',
      'contact.card.address.title':      'Adres',
      'contact.card.address.desc':       'Sancak Mah. Şehit Tuğrul Köseoğlu Cad. Mis Sancak Konutları D Blok No: 5, Selçuklu / Konya',
      'contact.form.name':               'Adınız Soyadınız',
      'contact.form.email':              'E-posta Adresiniz',
      'contact.form.subject':            'Konu',
      'contact.form.message':            'Mesajınız',
      'contact.form.submit':             'Mesajı Gönder',
      'contact.form.note':               'Gönder\'e bastığınızda e-posta uygulamanız mesajınızla birlikte açılacaktır.',

      /* ── Auth modal ── */
      'auth.login.tab':              'Giriş Yap',
      'auth.register.tab':           'Üye Ol',
      'auth.name':                   'Ad Soyad',
      'auth.email':                  'E-posta',
      'auth.phone':                  'Telefon Numarası',
      'auth.password':                'Şifre',
      'auth.login.submit':           'Giriş Yap',
      'auth.register.submit':        'Üye Ol',
      'auth.dropdown.saved':         'Kaydettiklerim',
      'auth.dropdown.logout':        'Çıkış Yap',
      'auth.error.invalidCredentials':'E-posta veya şifre hatalı.',
      'auth.error.invalidEmail':     'Lütfen geçerli bir e-posta adresi girin.',
      'auth.error.invalidName':      'Lütfen adınızı ve soyadınızı girin.',
      'auth.error.invalidPhone':     'Lütfen geçerli bir telefon numarası girin.',
      'auth.error.weakPassword':     'Şifre en az 6 karakter olmalı.',
      'auth.error.emailTaken':       'Bu e-posta adresi zaten kayıtlı.',
      'auth.error.generic':          'Bir hata oluştu, lütfen tekrar deneyin.',

      /* ── Kaydettiklerim sayfası ── */
      'saved.page.label':            'Hesabım',
      'saved.page.title':            'Kaydettiklerim',
      'saved.page.subtitle':         'Kaydettiğiniz ve düzenlemekte olduğunuz davetiyeler burada listelenir.',
      'saved.empty':                 'Henüz kaydedilmiş bir davetiyeniz yok.',
      'saved.empty.cta':             'Koleksiyonları Keşfet',
      'saved.card.continue':         'Düzenlemeye Dön',
      'saved.card.watermarkNote':    'Ödeme tamamlanana kadar filigran görünür kalır.',
      'saved.card.paid':             'Ödeme Tamamlandı',

      /* ── Sepet sayfası ── */
      'cart.page.label':             'Sepet',
      'cart.page.title':             'Sepetiniz',
      'cart.empty':                  'Sepetinizde davetiye bulunmuyor.',
      'cart.empty.cta':              'Koleksiyonları Keşfet',
      'cart.total':                  'Toplam',
      'cart.pay':                    'Ödemeyi Tamamla',
      'cart.freeAdmin':              'Ücretsiz Al (Admin)',
      'cart.paying':                 'İşleniyor…',
      'cart.success.title':          'Ödemeniz Alındı',
      'cart.success.body':           'Teşekkürler! Davetiyenizin filigranı kaldırıldı, e-posta adresinize gönderildi.',
      'cart.success.toOrders':       'Siparişlerime Git',
      'cart.share.copy':             'Linki Kopyala',
      'cart.share.copied':           'Kopyalandı!',
      'cart.paytr.back':             '← Sepete dön',
      'cart.pending':                'Ödemeniz onaylanıyor, lütfen bekleyin…',
      'cart.pay.error':              'Ödeme başlatılamadı, lütfen tekrar deneyin.',
      'cart.pay.failed':             'Ödeme tamamlanamadı veya iptal edildi. Tekrar deneyebilirsiniz.',

      /* ── Siparişlerim sayfası ── */
      'orders.page.label':           'Hesabım',
      'orders.page.title':           'Siparişlerim',
      'orders.page.subtitle':        'Verdiğiniz tüm siparişler ve davetiye paylaşım linkleriniz burada listelenir.',
      'orders.empty':                'Henüz bir siparişiniz yok.',
      'orders.empty.cta':            'Koleksiyonları Keşfet',
      'orders.status.pending':       'Bekliyor',
      'orders.status.paid':          'Ödendi',
      'orders.card.share':           'Paylaş',
      'orders.card.copied':          'Kopyalandı!',
      'auth.dropdown.orders':        'Siparişlerim',

      /* ── Davetiyem paneli ── */
      'dash.page.label':             'Davetiyem',
      'dash.page.subtitle':          'Misafirlerinizin bıraktığı not, fotoğraf, video ve katılım bilgileri burada.',
      'dash.notPublished':           'Bu davetiye henüz yayınlanmadı. Misafir verileri, davetiyeniz yayınlandıktan sonra burada görünmeye başlar.',
      'dash.error':                  'Bu davetiyeyi görüntüleme yetkiniz yok veya bir hata oluştu.',
      'dash.noInstance':             'Görüntülenecek bir davetiye bulunamadı. Lütfen "Kaydettiklerim" veya "Siparişlerim" sayfasındaki "Misafirleri Gör" butonunu kullanın.',
      'dash.stat.views':             'Görüntülenme',
      'dash.stat.uniqueSuffix':      'tekil',
      'dash.stat.attending':         'Katılacak',
      'dash.stat.notAttending':      'Katılmayacak',
      'dash.stat.media':             'Fotoğraf / Video / Ses',
      'dash.rsvp.title':             'Misafir Yanıtları',
      'dash.rsvp.empty':             'Henüz bir misafir yanıtı yok.',
      'dash.guestbook.title':        'Misafir Defteri',
      'dash.survey.title':           'Anket Sonuçları',
      'dash.survey.side.bride':      'Gelin Tarafı',
      'dash.survey.side.groom':      'Damat Tarafı',
      'dash.survey.titleSuffix':     "'nın Anket Yanıtları",
      'dash.attend.yes':             'Katılacak',
      'dash.attend.no':              'Katılmayacak',
      'dash.anonymous':              'İsimsiz Misafir',
      'kaydet.card.dashboard':       'Misafirleri Gör',
      'saved.card.remove':           'Kaydedilenlerden Kaldır',
      'saved.card.removeConfirm':    'Bu davetiyeyi kaydedilenlerden kaldırmak istediğinize emin misiniz?',
      'dash.media.download':         'İndir',

      /* ── Yasal sayfalar ── */
      'legal.nav.delivery':     'Teslimat Koşulları',
      'legal.nav.contract':     'Mesafeli Satış Sözleşmesi',
      'legal.nav.cancellation': 'İptal ve İade Koşulları',

      'legal.teslimat.label': 'Teslimat',
      'legal.teslimat.title': 'Teslimat Koşulları',
      'legal.teslimat.body':
        '<h2>Ürünün Niteliği</h2>' +
        '<p>VISORA üzerinden satışı yapılan davetiyeler tamamen dijital ürünlerdir. Fiziksel bir gönderim, kargo veya kurye teslimatı bulunmamaktadır.</p>' +
        '<h2>Teslimat Şekli</h2>' +
        '<p>Ödemeniz onaylandığı anda davetiyeniz sistem tarafından otomatik olarak yayına alınır ve size özel benzersiz bir paylaşım bağlantısı oluşturulur. Bu bağlantı:</p>' +
        '<ul><li>Kayıt sırasında belirttiğiniz e-posta adresine otomatik olarak gönderilir,</li>' +
        '<li>"Siparişlerim" sayfanızdan dilediğiniz zaman görüntülenip kopyalanabilir veya paylaşılabilir.</li></ul>' +
        '<h2>Teslimat Süresi</h2>' +
        '<p>Davetiyeniz, ödeme onayından sonra ortalama birkaç dakika içinde hazır hâle gelir. Yoğunluk veya teknik bir aksaklık durumunda bu süre uzayabilir; bu gibi durumlarda <a href="iletisim.html">İletişim</a> sayfamızdan bize ulaşabilirsiniz.</p>' +
        '<h2>Teslimat Ücreti</h2>' +
        '<p>Dijital bir ürün olduğu için herhangi bir kargo veya teslimat ücreti alınmaz.</p>' +
        '<h2>Erişim Sorumluluğu</h2>' +
        '<p>Sipariş sırasında girilen e-posta adresinin doğru ve eksiksiz olması müşterinin sorumluluğundadır. Yanlış/eksik bilgi nedeniyle oluşabilecek erişim gecikmelerinde, davetiyenize "Siparişlerim" panelinden her zaman erişebilirsiniz.</p>',

      'legal.sozlesme.label': 'Sözleşme',
      'legal.sozlesme.title': 'Mesafeli Satış Sözleşmesi',
      'legal.sozlesme.body':
        '<h2>1. Taraflar</h2>' +
        '<p><strong>Satıcı:</strong><br>Ad Soyad: Güzide Zorlu<br>E-posta: guzidezorlu427@gmail.com<br>Telefon: 0537 239 58 24<br>(bundan sonra "Satıcı" olarak anılacaktır)</p>' +
        '<p><strong>Alıcı:</strong> visoraapp.net üzerinden sipariş veren ve ödemeyi gerçekleştiren kullanıcı (bundan sonra "Alıcı" olarak anılacaktır).</p>' +
        '<h2>2. Sözleşmenin Konusu</h2>' +
        '<p>Bu sözleşme, Alıcı\'nın Satıcı\'ya ait visoraapp.net internet sitesi üzerinden elektronik ortamda sipariş verdiği, niteliği ve satış fiyatı sipariş ve ödeme adımında belirtilen dijital davetiye ürününün satışı ve teslimine ilişkin olarak, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerini düzenler.</p>' +
        '<h2>3. Ürün ve Fiyat Bilgisi</h2>' +
        '<p>Satışa konu ürün, Alıcı tarafından kişiselleştirilen ve elektronik ortamda anında teslim edilen dijital davetiye hizmetidir. Ürünün adı, içeriği, seçilen ek özellikleri ve toplam satış fiyatı (KDV dahil) sipariş ve ödeme adımında Alıcı\'ya açıkça gösterilmiş ve Alıcı tarafından onaylanmıştır.</p>' +
        '<h2>4. Ödeme Şekli</h2>' +
        '<p>Ödeme, Satıcı\'nın anlaşmalı olduğu ödeme kuruluşu (PayTR) altyapısı üzerinden, Alıcı\'nın seçtiği kredi/banka kartı ile tek seferde (taksitsiz) tahsil edilir.</p>' +
        '<h2>5. Teslimat</h2>' +
        '<p>Ürünün teslimat şekli ve süresine ilişkin koşullar <a href="teslimat-kosullari.html">Teslimat Koşulları</a> sayfasında yer almaktadır ve bu sözleşmenin ayrılmaz bir parçasıdır.</p>' +
        '<h2>6. Cayma Hakkı</h2>' +
        '<p>6502 sayılı Kanun\'a dayanan Mesafeli Sözleşmeler Yönetmeliği\'nin 15. maddesinin birinci fıkrasının (ç) bendi uyarınca, <strong>"elektronik ortamda anında ifa edilen hizmetler veya tüketiciye anında teslim edilen gayrimaddi mallara ilişkin sözleşmelerde"</strong> Alıcı\'nın cayma hakkı bulunmamaktadır.</p>' +
        '<p>Satışa konu davetiye, ödemenin onaylanmasıyla birlikte sistem tarafından otomatik olarak ve anında oluşturulup Alıcı\'ya teslim edildiğinden, <strong>Alıcı, bu sözleşmeyi onaylayarak siparişin onaylanmasından sonra cayma hakkını kullanamayacağını kabul, beyan ve taahhüt eder.</strong></p>' +
        '<p>Konuyla ilgili detaylı bilgi için <a href="iptal-iade-kosullari.html">İptal, İade ve Geri Ödeme Koşulları</a> sayfasını inceleyebilirsiniz.</p>' +
        '<h2>7. Genel Hükümler</h2>' +
        '<p>Alıcı, sipariş onayı ile bu sözleşmenin tüm hükümlerini okuduğunu, anladığını ve kabul ettiğini beyan eder. Satıcı; sistemsel hata, mücbir sebep veya stok/teknik kısıt hâllerinde siparişi onaylamadan iptal etme hakkını saklı tutar; bu durumda Alıcı\'ya tahsil edilmiş tutarın tamamı iade edilir.</p>' +
        '<h2>8. Yetkili Mahkeme</h2>' +
        '<p>Bu sözleşmeden kaynaklanan uyuşmazlıklarda, ilgili mevzuatta belirlenen parasal sınırlar dahilinde Tüketici Hakem Heyetleri, bu sınırların üzerindeki uyuşmazlıklarda ise Tüketici Mahkemeleri yetkilidir.</p>' +
        '<p class="legal-updated">Son güncelleme: 19.06.2026</p>',

      'legal.iptaliade.label': 'İptal & İade',
      'legal.iptaliade.title': 'İptal, İade ve Geri Ödeme Koşulları',
      'legal.iptaliade.body':
        '<h2>Genel İlke</h2>' +
        '<p>VISORA üzerinden satışı yapılan davetiyeler, elektronik ortamda anında ifa edilen ve Alıcı\'ya anında teslim edilen dijital içeriklerdir. 6502 sayılı Tüketicinin Korunması Hakkında Kanun\'a dayanan Mesafeli Sözleşmeler Yönetmeliği\'nin 15. maddesinin birinci fıkrasının (ç) bendi gereğince, bu nitelikteki ürünlerde <strong>cayma hakkı bulunmamaktadır.</strong></p>' +
        '<h2>Bu Ne Anlama Geliyor?</h2>' +
        '<ul><li>Ödemeniz onaylandığı anda davetiyeniz otomatik olarak oluşturulur, yayına alınır ve size teslim edilir.</li>' +
        '<li>Bu nedenle, sipariş onaylandıktan sonra "fikrimi değiştirdim" veya "ihtiyacım kalmadı" gibi sebeplerle iptal, iade veya geri ödeme talebinde bulunulamaz.</li>' +
        '<li>Ödeme adımında <a href="mesafeli-satis-sozlesmesi.html">Mesafeli Satış Sözleşmesi</a>\'ni onaylayarak bu şartı kabul etmiş olursunuz.</li></ul>' +
        '<h2>İstisna: Teknik Hata</h2>' +
        '<p>Ödemeniz alındığı hâlde, münhasıran VISORA\'ya ait bir sistemsel hata nedeniyle davetiyeniz hiç oluşturulamamış veya teslim edilememişse, durumu <a href="iletisim.html">İletişim</a> kanallarımızdan bize 7 gün içinde bildirmeniz hâlinde, durum incelenip teyit edildiği takdirde ödemenizin tamamı iade edilir.</p>' +
        '<h2>Yanlış Ödeme / Mükerrer Çekim</h2>' +
        '<p>Teknik bir aksaklık nedeniyle aynı sipariş için birden fazla çekim yapıldığını fark ederseniz, lütfen banka ekstrenizle birlikte bizimle iletişime geçin; mükerrer tahsilatlar incelenip iade edilir.</p>' +
        '<h2>İletişim</h2>' +
        '<p>Bu konudaki tüm talepleriniz için <a href="iletisim.html">İletişim</a> sayfamızdan bize ulaşabilirsiniz.</p>' +
        '<p class="legal-updated">Son güncelleme: 19.06.2026</p>',

      'sepet.consent.label': '<a href="mesafeli-satis-sozlesmesi.html" target="_blank" rel="noopener">Mesafeli Satış Sözleşmesi</a>\'ni okudum, dijital içeriğin anında teslim edildiğini ve cayma hakkım bulunmadığını kabul ediyorum.',
      'sepet.consent.required': 'Ödemeye geçmek için sözleşmeyi onaylamanız gerekiyor.'
    },

    /* ===================== ENGLISH ===================== */
    en: {

      /* ── Navbar / Menu ── */
      'nav.home':        'Home',
      'nav.collections': 'Collections',
      'nav.how':         'How It Works',
      'nav.about':       'About',
      'nav.contact':     'Contact',
      'nav.search':      'Search collections...',

      'menu.home':       'Home',
      'menu.collections':'Collections',
      'menu.how':        'How It Works',
      'menu.about':      'About',
      'menu.contact':    'Contact',
      'menu.faq':        'FAQ',
      'menu.campaigns':  'Campaigns',

      /* ── Shared buttons ── */
      'btn.demo':    'View Demo',
      'btn.create':  'Create Invitation',
      'btn.viewAll': 'View All Collections',
      'btn.contact': 'Contact Us',
      'btn.explore': 'Explore Collections',

      /* ── Card buttons (collection slider) ── */
      'card.cta.demo':   'Demo',
      'card.cta.create': 'Create',

      /* ── Footer ── */
      'footer.tagline':            'Premium digital invitation experience. Elegant and cinematic solutions for weddings and special occasions.',
      'footer.col.collections':    'Collections',
      'footer.col.corporate':      'Corporate',
      'footer.col.contact':        'Contact',
      'footer.link.wedding':       'Wedding Invitations',
      'footer.link.engagement':    'Engagement Invitations',
      'footer.link.henna':         'Henna Night Invitations',
      'footer.link.saveTheDate':   'Save the Date',
      'footer.link.brideGroom':    'Bride & Groom Night',
      'footer.link.about':         'About Us',
      'footer.link.howItWorks':    'How It Works',
      'footer.link.campaigns':     'Campaigns',
      'footer.link.faq':           'FAQ',
      'footer.link.contact':       'Contact',
      'footer.link.whatsapp':      'Contact via WhatsApp',
      'footer.link.instagram':     '@davetiye_visora',
      'footer.copy':               '© 2025 VISORA. All rights reserved.',
      'footer.privacy':            'Privacy Policy',
      'footer.terms':              'Terms of Use',

      /* ── Homepage — hero ── */
      'hero.label':        'Premium Digital Invitation',
      'hero.title.line1':  'Transform Your',
      'hero.title.accent': 'Wedding Into Art',
      'hero.title.line2':  '',
      'hero.subtitle':     'Share your most special moments with modern, elegant and cinematic digital invitations.',
      'hero.cta':          'Explore Collections',
      'hero.scroll':       'Scroll',

      /* ── Homepage — collections ── */
      'sec.collections.label':    'Collections',
      'sec.collections.title.l1': 'Elegant Invitation',
      'sec.collections.title.l2': 'Collections',
      'sec.collections.cta':      'View All Collections',

      'card.elegance.tag':  'Wedding',
      'card.elegance.name': 'Elegance',
      'card.elegance.desc': 'Timeless elegance, endless beauty',

      'card.classique.tag':  'Engagement',
      'card.classique.name': 'Classique',
      'card.classique.desc': 'Classic aesthetic, modern spirit',

      'card.aura.tag':  'Henna Night',
      'card.aura.name': 'Aura',
      'card.aura.desc': 'A captivating aura, a magical night',

      'card.serene.tag':  'Save the Date',
      'card.serene.name': 'Serene',
      'card.serene.desc': 'Calm, peaceful, unforgettable',

      'card.romance.tag':  'Bride & Groom',
      'card.romance.name': 'Romance',
      'card.romance.desc': 'Love in its purest, most beautiful form',

      'card.lumiere.tag':  'Special Day',
      'card.lumiere.name': 'Lumière',
      'card.lumiere.desc': 'Every moment touched by light is special',

      /* ── Homepage — advantages ── */
      'sec.adv.label':    'Why Digital?',
      'sec.adv.title.l1': 'Advantages of a',
      'sec.adv.title.l2': 'Digital Invitation',

      'adv.1.title': 'Fast & Practical',
      'adv.1.desc':  'Your digital invitation is ready in minutes and can be shared instantly, always staying up to date.',
      'adv.2.title': 'Eco-Friendly',
      'adv.2.desc':  'Celebrate your special day digitally without wasting paper. An elegant and responsible choice.',
      'adv.3.title': 'Always With You',
      'adv.3.desc':  'Your guests can easily access it from any phone, tablet, or computer. No risk of losing it.',
      'adv.4.title': 'Interactive Experience',
      'adv.4.desc':  'Give your guests an unforgettable experience with music, video, maps and RSVP system.',

      /* ── Homepage — how it works ── */
      'sec.how.label':    'Process',
      'sec.how.title':    'How It Works',
      'sec.how.subtitle': 'Reach your dream digital invitation in four simple steps.',

      'step.1.title': 'Choose a Collection',
      'step.1.desc':  'Browse our collections and explore the perfect design for you with a demo.',
      'step.2.title': 'Add Your Details',
      'step.2.desc':  'Enter couple names, date, venue and all your special details with ease.',
      'step.3.title': 'Customize',
      'step.3.desc':  'Personalize your invitation by adding music, gallery, RSVP and more.',
      'step.4.title': 'Complete Your Order',
      'step.4.desc':  'Complete your payment and start sharing your invitation instantly.',

      /* ── Homepage — memories ── */
      'sec.memories.label':    'Special Moments',
      'sec.memories.title.l1': 'Your Memories,',
      'sec.memories.title.l2': 'Always Treasured',
      'sec.memories.body':     'Every story is unique. Your story deserves a special invitation.',
      'sec.memories.cta1':     'Contact Us',
      'sec.memories.cta2':     'Create Invitation',

      /* ── Homepage — FAQ ── */
      'sec.faq.label':    'FAQ',
      'sec.faq.title.l1': 'Frequently Asked',
      'sec.faq.title.l2': 'Questions',

      'faq.1.q': 'How quickly is the invitation ready?',
      'faq.1.a': 'After completing your invitation and payment, your digital invitation will be ready and shareable within a few minutes.',
      'faq.2.q': 'Is it mobile-friendly?',
      'faq.2.a': 'Yes. All VISORA invitations are fully compatible with mobile, tablet and desktop devices. Your guests enjoy a perfect experience on any device.',
      'faq.3.q': 'Can I add music?',
      'faq.3.a': 'Yes. You can add a music track of your choice to your invitation. It starts playing automatically when guests open the invitation.',
      'faq.4.q': 'Can a QR code be added?',
      'faq.4.a': 'Yes. A QR code is automatically generated for every invitation. Add it to printed materials so guests can easily access your invitation.',
      'faq.5.q': 'Can I make changes later?',
      'faq.5.a': 'Yes. After purchase, you can update your invitation at any time from your user panel. Changes are reflected instantly for all guests.',

      /* ── Collections listing page ── */
      'gallery.page.label':    'Invitation Collections',
      'gallery.page.title':    'Premium Digital<br>Invitation Templates',
      'gallery.page.subtitle': 'Every collection is a professional design work.<br>View the demo — pick your favorite — customize with your details.',
      'gallery.cat.count':     'template',

      /* ── Collection detail page ── */
      'col.breadcrumb.home':        'Home',
      'col.breadcrumb.collections': 'Collections',
      'col.collection.label':       'Collection',
      'col.tagline.l1':             'Timeless romance,',
      'col.tagline.accent':         'crafted with modern luxury.',
      'col.desc':                   'The VISORA Elegance collection makes every moment of your wedding journey elegant and unforgettable. Create the invitation of your dreams with premium animations, custom music and cinematic design.',
      'col.cta.demo':               'View Demo',
      'col.cta.create':             'Create Invitation',

      /* ── Features ── */
      'sec.features.label': 'Features',
      'sec.features.title': "What's Inside?",

      'feat.1.title': 'Save The Date',
      'feat.1.desc':  'Notify guests with a special pre-announcement before your event',
      'feat.2.title': 'Wedding Invite',
      'feat.2.desc':  'Full digital invitation with complete program and details',
      'feat.3.title': 'Story Timeline',
      'feat.3.desc':  'Your story from the first meeting to today',
      'feat.4.title': 'Gallery',
      'feat.4.desc':  'Showcase your most special photos in your invitation',
      'feat.5.title': 'Music',
      'feat.5.desc':  'Add a cinematic feel to your invitation with your wedding music',
      'feat.6.title': 'Dress Code',
      'feat.6.desc':  'Communicate the dress code elegantly and clearly to your guests',
      'feat.7.title': 'RSVP',
      'feat.7.desc':  'Simplify guest management with an attendance confirmation system',
      'feat.8.title': 'Guest Book',
      'feat.8.desc':  "Collect your guests' congratulatory messages in a digital memory book",

      /* ── Similar collections ── */
      'sec.similar.label': 'Other Options',
      'sec.similar.title': 'Similar Collections',
      'sim.badge.current': 'Current',

      'sim.aurora.tag':   'Wedding',
      'sim.aurora.name':  'Aurora',
      'sim.aurora.desc':  'Golden light, cinematic moment',
      'sim.luna.tag':     'Engagement',
      'sim.luna.name':    'Luna',
      'sim.luna.desc':    'Moonlight, endless poetry',
      'sim.river.tag':    'Henna Night',
      'sim.river.name':   'River',
      'sim.river.desc':   'The elegant flow of nature',
      'sim.elegance.tag': 'Wedding',
      'sim.elegance.name':'Elegance',
      'sim.elegance.desc':'Timeless elegance',
      'sim.majestic.tag': 'Save the Date',
      'sim.majestic.name':'Majestic',
      'sim.majestic.desc':'Grandeur and nobility',
      'sim.velvet.tag':   'Bride & Groom',
      'sim.velvet.name':  'Velvet',
      'sim.velvet.desc':  'The soft magic of velvet',

      /* ── Story ── */
      'sec.story.label':    'Our Story',
      'sec.story.title.l1': 'Your story,',
      'sec.story.accent':   'our celebration.',
      'sec.story.body1':    'Every couple is different. The language of love, the story of meeting, the spirit of the wedding is unique to everyone. Our goal at VISORA is to transform these unique moments into a timeless digital experience.',
      'sec.story.body2':    'The Elegance collection is a world of design where elegance and emotion meet. We create the invitation of your dreams with gold details, botanical touches and a cinematic aesthetic.',
      'sec.story.cta1':     'Create Invitation',
      'sec.story.cta2':     'Contact Us',

      /* ── Order / Checkout page ── */
      'sp.back':                'Back to Editor',
      'sp.eyebrow':             'Order Summary',
      'sp.title':               'Complete Your Invitation',
      'sp.subtitle':            'Review your order and proceed to payment.',
      'sp.total':               'Total',
      'sp.watermarkNote':       'A transparent VISORA watermark will remain visible until payment is completed. It is removed automatically after successful payment.',
      'sp.accTitle':            'Save Your Design',
      'sp.accDesc':             'Sign in with your account to save your invitation, continue editing at any time, and view your orders.',
      'sp.emailPlaceholder':    'Your email address',
      'sp.passwordPlaceholder': 'Create a password',
      'sp.or':                  'or',
      'sp.accExisting':         'Continue with existing account',
      'sp.payLabel':            'Proceed to Payment',
      'sp.payNote':             'Secure payment · 256-bit SSL encryption\nCredit card, debit card and bank transfer accepted.',
      'sp.includes':            'Package Includes',
      'sp.extras':              'Selected Add-ons',
      'sp.trust.quality':       'Premium Quality',
      'sp.trust.secure':        'Secure Payment',
      'sp.trust.instant':       'Instant Delivery',

      /* ── Create page ── */
      'cr.pageTitle':           'Create Your Invitation',
      'cr.locked':              'Design is locked · Content only',
      'cr.livePreview':         'Live Preview',
      'cr.fullscreen':          'View Fullscreen',
      'cr.segments':            'Segments',
      'cr.save':                'Save',
      'cr.order':               'Complete Order',
      'cr.totalLabel':          'Total',
      'cr.included':            'Your selected features included',
      /* Field labels */
      'cr.f.brideName':         "Bride's Name",
      'cr.f.groomName':         "Groom's Name",
      'cr.f.eventDate':         'Date',
      'cr.f.eventTime':         'Time',
      'cr.f.venue':             'Venue Name',
      'cr.f.venueCity':         'City',
      'cr.f.address':           'Address',
      'cr.f.mapLink':           'Map Link',
      'cr.f.inviteMessage':     'Invitation Message',
      'cr.f.subtitle':          'Subtitle',
      /* Section names */
      'cr.sec.font':            'Font',
      'cr.sec.music':           'Music',
      'cr.sec.gallery':         'Gallery Photos',
      'cr.sec.extras':          'Add-on Features',
      'cr.sec.intro':           'Cinematic Intro',
      /* Misc */
      'cr.presetPlaceholder':   'Choose a ready text…',
      'cr.uploadMusic':         'Upload Your Music (MP3)',
      'cr.demoLabel':           'Demo',

      /* ── Contact page ── */
      'contact.page.label':              'Contact',
      'contact.page.title':              "We'd Love<br>to Hear From You",
      'contact.page.subtitle':           'For your questions, special requests or collaboration<br>proposals, reach us through the channels below.',
      'contact.card.whatsapp.title':     'WhatsApp',
      'contact.card.whatsapp.desc':      'Message us on WhatsApp for quick support',
      'contact.card.whatsapp.phone':     '+90 537 239 58 24',
      'contact.card.email.title':        'Email',
      'contact.card.instagram.title':    'Instagram',
      'contact.card.hours.title':        'Working Hours',
      'contact.card.hours.desc':         'We respond every day between 09:00 – 21:00',
      'contact.card.address.title':      'Address',
      'contact.card.address.desc':       'Sancak Mah. Şehit Tuğrul Köseoğlu Cad. Mis Sancak Konutları D Blok No: 5, Selçuklu / Konya',
      'contact.form.name':               'Full Name',
      'contact.form.email':              'Email Address',
      'contact.form.subject':            'Subject',
      'contact.form.message':            'Your Message',
      'contact.form.submit':             'Send Message',
      'contact.form.note':               'Your email app will open with this message when you press send.',

      /* ── Auth modal ── */
      'auth.login.tab':              'Login',
      'auth.register.tab':           'Sign Up',
      'auth.name':                   'Full Name',
      'auth.email':                  'Email',
      'auth.phone':                  'Phone Number',
      'auth.password':                'Password',
      'auth.login.submit':           'Login',
      'auth.register.submit':        'Sign Up',
      'auth.dropdown.saved':         'My Saved',
      'auth.dropdown.logout':        'Log Out',
      'auth.error.invalidCredentials':'Incorrect email or password.',
      'auth.error.invalidEmail':     'Please enter a valid email address.',
      'auth.error.invalidName':      'Please enter your full name.',
      'auth.error.invalidPhone':     'Please enter a valid phone number.',
      'auth.error.weakPassword':     'Password must be at least 6 characters.',
      'auth.error.emailTaken':       'This email is already registered.',
      'auth.error.generic':          'Something went wrong, please try again.',

      /* ── Saved invitations page ── */
      'saved.page.label':            'My Account',
      'saved.page.title':            'My Saved Invitations',
      'saved.page.subtitle':         'Invitations you have saved or are currently editing appear here.',
      'saved.empty':                 "You haven't saved any invitations yet.",
      'saved.empty.cta':             'Explore Collections',
      'saved.card.continue':         'Continue Editing',
      'saved.card.watermarkNote':    'The watermark stays visible until payment is completed.',
      'saved.card.paid':             'Payment Completed',

      /* ── Cart page ── */
      'cart.page.label':             'Cart',
      'cart.page.title':             'Your Cart',
      'cart.empty':                  'Your cart is empty.',
      'cart.empty.cta':              'Explore Collections',
      'cart.total':                  'Total',
      'cart.pay':                    'Complete Payment',
      'cart.freeAdmin':              'Get Free (Admin)',
      'cart.paying':                 'Processing…',
      'cart.success.title':          'Payment Received',
      'cart.success.body':           "Thank you! Your invitation's watermark has been removed and sent to your email.",
      'cart.success.toOrders':       'Go to My Orders',
      'cart.share.copy':             'Copy Link',
      'cart.share.copied':           'Copied!',
      'cart.paytr.back':             '← Back to cart',
      'cart.pending':                'Confirming your payment, please wait…',
      'cart.pay.error':              'Could not start the payment, please try again.',
      'cart.pay.failed':             'Payment was not completed or was cancelled. You can try again.',

      /* ── My Orders page ── */
      'orders.page.label':           'My Account',
      'orders.page.title':           'My Orders',
      'orders.page.subtitle':        'All your orders and invitation share links appear here.',
      'orders.empty':                "You don't have any orders yet.",
      'orders.empty.cta':            'Explore Collections',
      'orders.status.pending':       'Pending',
      'orders.status.paid':          'Paid',
      'orders.card.share':           'Share',
      'orders.card.copied':          'Copied!',
      'auth.dropdown.orders':        'My Orders',

      /* ── My Invitation dashboard ── */
      'dash.page.label':             'My Invitation',
      'dash.page.subtitle':          "Notes, photos, videos and RSVPs from your guests appear here.",
      'dash.notPublished':           'This invitation has not been published yet. Guest data will appear here once your invitation is published.',
      'dash.error':                  "You don't have permission to view this invitation, or something went wrong.",
      'dash.noInstance':             'No invitation to display. Please use the "View Guests" button on the "My Saved" or "My Orders" page.',
      'dash.stat.views':             'Views',
      'dash.stat.uniqueSuffix':      'unique',
      'dash.stat.attending':         'Attending',
      'dash.stat.notAttending':      'Not Attending',
      'dash.stat.media':             'Photos / Videos / Audio',
      'dash.rsvp.title':             'Guest Responses',
      'dash.rsvp.empty':             'No guest responses yet.',
      'dash.guestbook.title':        'Guest Book',
      'dash.survey.title':           'Survey Results',
      'dash.survey.side.bride':      'Bride Side',
      'dash.survey.side.groom':      'Groom Side',
      'dash.survey.titleSuffix':     "'s Survey Answers",
      'dash.attend.yes':             'Attending',
      'dash.attend.no':              'Not Attending',
      'dash.anonymous':              'Anonymous Guest',
      'kaydet.card.dashboard':       'View Guests',
      'saved.card.remove':           'Remove from Saved',
      'saved.card.removeConfirm':    'Are you sure you want to remove this invitation from your saved list?',
      'dash.media.download':         'Download',

      /* ── Legal pages ── */
      'legal.nav.delivery':     'Delivery Terms',
      'legal.nav.contract':     'Distance Sales Agreement',
      'legal.nav.cancellation': 'Cancellation & Refund Policy',

      'legal.teslimat.label': 'Delivery',
      'legal.teslimat.title': 'Delivery Terms',
      'legal.teslimat.body':
        '<h2>Nature of the Product</h2>' +
        '<p>Invitations sold through VISORA are entirely digital products. There is no physical shipment, courier or freight delivery involved.</p>' +
        '<h2>Method of Delivery</h2>' +
        '<p>As soon as your payment is confirmed, your invitation is automatically published by the system and a unique share link is generated for it. This link:</p>' +
        '<ul><li>Is automatically sent to the email address you provided when registering,</li>' +
        '<li>Can be viewed, copied or shared at any time from your "My Orders" page.</li></ul>' +
        '<h2>Delivery Time</h2>' +
        '<p>Your invitation is ready within a few minutes on average after payment confirmation. This may take longer during high demand or in case of a technical issue; in such cases you can reach us via our <a href="iletisim.html">Contact</a> page.</p>' +
        '<h2>Delivery Fee</h2>' +
        '<p>As this is a digital product, no shipping or delivery fee is charged.</p>' +
        '<h2>Access Responsibility</h2>' +
        '<p>It is the customer\'s responsibility to provide an accurate and complete email address at checkout. In case of access delays caused by incorrect/incomplete information, you can always access your invitation from your "My Orders" panel.</p>',

      'legal.sozlesme.label': 'Agreement',
      'legal.sozlesme.title': 'Distance Sales Agreement',
      'legal.sozlesme.body':
        '<h2>1. Parties</h2>' +
        '<p><strong>Seller:</strong><br>Name: Güzide Zorlu<br>Email: guzidezorlu427@gmail.com<br>Phone: +90 537 239 58 24<br>(hereinafter the "Seller")</p>' +
        '<p><strong>Buyer:</strong> The user who places an order and completes payment through visoraapp.net (hereinafter the "Buyer").</p>' +
        '<h2>2. Subject of the Agreement</h2>' +
        '<p>This agreement governs the rights and obligations of the parties, in accordance with Turkish Law No. 6502 on the Protection of Consumers and the Distance Contracts Regulation, regarding the sale and delivery of the digital invitation product ordered electronically by the Buyer through the Seller\'s website visoraapp.net, the nature and price of which are specified at the order and payment step.</p>' +
        '<h2>3. Product and Price Information</h2>' +
        '<p>The product subject to sale is a digital invitation service personalized by the Buyer and delivered instantly in electronic form. The product name, content, any selected add-ons, and the total sale price (including VAT) are clearly displayed to the Buyer at the order and payment step and confirmed by the Buyer.</p>' +
        '<h2>4. Method of Payment</h2>' +
        '<p>Payment is collected as a single (non-installment) charge via the Seller\'s contracted payment provider (PayTR), using the credit/debit card chosen by the Buyer.</p>' +
        '<h2>5. Delivery</h2>' +
        '<p>The terms regarding the method and timing of delivery are set out on the <a href="teslimat-kosullari.html">Delivery Terms</a> page, which forms an integral part of this agreement.</p>' +
        '<h2>6. Right of Withdrawal</h2>' +
        '<p>Pursuant to Article 15, paragraph 1(ç) of the Distance Contracts Regulation based on Law No. 6502, the Buyer does <strong>not</strong> have a right of withdrawal in respect of <strong>"contracts for services performed immediately in an electronic environment or for intangible goods delivered immediately to the consumer."</strong></p>' +
        '<p>Since the invitation subject to sale is automatically and instantly generated and delivered to the Buyer by the system upon payment confirmation, <strong>the Buyer, by accepting this agreement, acknowledges, declares and undertakes that they will not be able to exercise a right of withdrawal after the order is confirmed.</strong></p>' +
        '<p>For more details, please review the <a href="iptal-iade-kosullari.html">Cancellation, Refund and Reimbursement Terms</a> page.</p>' +
        '<h2>7. General Provisions</h2>' +
        '<p>By confirming the order, the Buyer declares that they have read, understood and accepted all provisions of this agreement. The Seller reserves the right to cancel an order before confirmation in case of a system error, force majeure, or technical constraints; in such a case, the full amount charged to the Buyer will be refunded.</p>' +
        '<h2>8. Competent Court</h2>' +
        '<p>Disputes arising from this agreement shall be resolved by the Consumer Arbitration Committees within the monetary limits set by applicable legislation, and by the Consumer Courts for disputes exceeding those limits.</p>' +
        '<p class="legal-updated">Last updated: 19.06.2026</p>',

      'legal.iptaliade.label': 'Cancellation & Refunds',
      'legal.iptaliade.title': 'Cancellation, Refund and Reimbursement Terms',
      'legal.iptaliade.body':
        '<h2>General Principle</h2>' +
        '<p>Invitations sold through VISORA are digital content performed instantly in an electronic environment and delivered immediately to the Buyer. Pursuant to Article 15, paragraph 1(ç) of the Distance Contracts Regulation based on Turkish Law No. 6502 on the Protection of Consumers, products of this nature <strong>are not subject to a right of withdrawal.</strong></p>' +
        '<h2>What Does This Mean?</h2>' +
        '<ul><li>As soon as your payment is confirmed, your invitation is automatically generated, published and delivered to you.</li>' +
        '<li>Therefore, requests for cancellation, return or refund for reasons such as "I changed my mind" or "I no longer need it" cannot be honored once the order is confirmed.</li>' +
        '<li>By accepting the <a href="mesafeli-satis-sozlesmesi.html">Distance Sales Agreement</a> at checkout, you agree to this condition.</li></ul>' +
        '<h2>Exception: Technical Error</h2>' +
        '<p>If, despite your payment being received, your invitation was never generated or delivered solely due to a system error attributable to VISORA, and you report this to us via our <a href="iletisim.html">Contact</a> channels within 7 days, your payment will be fully refunded once the situation is reviewed and confirmed.</p>' +
        '<h2>Incorrect Payment / Duplicate Charge</h2>' +
        '<p>If you notice that the same order was charged more than once due to a technical issue, please contact us along with your bank statement; duplicate charges will be reviewed and refunded.</p>' +
        '<h2>Contact</h2>' +
        '<p>For all requests on this matter, you can reach us via our <a href="iletisim.html">Contact</a> page.</p>' +
        '<p class="legal-updated">Last updated: 19.06.2026</p>',

      'sepet.consent.label': 'I have read the <a href="mesafeli-satis-sozlesmesi.html" target="_blank" rel="noopener">Distance Sales Agreement</a> and acknowledge that the digital content is delivered instantly and that I have no right of withdrawal.',
      'sepet.consent.required': 'You must accept the agreement before proceeding to payment.'
    }
  };

  /* ──────────────────────────────────────────────────────────
     HELPERS
  ────────────────────────────────────────────────────────── */

  function detectLang() {
    var p = new URLSearchParams(window.location.search);
    return p.get('lang') || localStorage.getItem('visora-lang') || 'tr';
  }

  function flattenObject(obj, prefix) {
    var result = {};
    prefix = prefix || '';
    Object.keys(obj).forEach(function (k) {
      var full = prefix ? prefix + '.' + k : k;
      if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
        var nested = flattenObject(obj[k], full);
        Object.keys(nested).forEach(function (nk) { result[nk] = nested[nk]; });
      } else {
        result[full] = obj[k];
      }
    });
    return result;
  }

  /* Load JSON files and flatten (async, HTTP only) */
  function loadFromServer(lang) {
    var files = ['common', 'home', 'collection'];
    var merged = {};
    return Promise.all(
      files.map(function (ns) {
        return fetch('locales/' + lang + '/' + ns + '.json')
          .then(function (r) { return r.ok ? r.json() : {}; })
          .catch(function () { return {}; });
      })
    ).then(function (results) {
      results.forEach(function (obj) {
        var flat = flattenObject(obj);
        Object.keys(flat).forEach(function (k) { merged[k] = flat[k]; });
      });
      return merged;
    });
  }

  /* ──────────────────────────────────────────────────────────
     FADE VEIL
  ────────────────────────────────────────────────────────── */

  var _veil = null;

  function getVeil() {
    if (_veil) return _veil;
    _veil = document.createElement('div');
    _veil.id = 'lang-veil';
    document.body.appendChild(_veil);
    return _veil;
  }

  function fadeIn(cb) {
    var veil = getVeil();
    veil.classList.add('visible');
    setTimeout(cb, 220);
  }

  function fadeOut() {
    var veil = getVeil();
    veil.classList.remove('visible');
  }

  /* ──────────────────────────────────────────────────────────
     DOM APPLICATION
  ────────────────────────────────────────────────────────── */

  function applyTranslations(dict) {
    /* data-i18n → textContent */
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var val = dict[key];
      if (val !== undefined && val !== null) el.textContent = val;
    });

    /* data-i18n-placeholder → placeholder */
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      var val = dict[key];
      if (val !== undefined) el.setAttribute('placeholder', val);
    });

    /* data-i18n-aria → aria-label */
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-aria');
      var val = dict[key];
      if (val !== undefined) el.setAttribute('aria-label', val);
    });

    /* data-i18n-html → innerHTML (for translations containing <br> or markup) */
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-html');
      var val = dict[key];
      if (val !== undefined && val !== null) el.innerHTML = val;
    });

    /* data-i18n-title → title attribute (tooltips) */
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-title');
      var val = dict[key];
      if (val !== undefined) el.setAttribute('title', val);
    });
  }

  function updateToggleUI(lang) {
    var active = document.querySelector('.lang-active');
    var other  = document.querySelector('.lang-other');
    if (active) active.textContent = lang.toUpperCase();
    if (other)  other.textContent  = lang === 'tr' ? 'EN' : 'TR';
  }

  function updateURL(lang) {
    if (!window.history || !window.history.pushState) return;
    var url = new URL(window.location.href);
    url.searchParams.set('lang', lang);
    window.history.pushState({}, '', url.toString());
  }

  /* ──────────────────────────────────────────────────────────
     ENGINE
  ────────────────────────────────────────────────────────── */

  var _cache = {};
  var _currentLang = detectLang();
  var _currentDict = {};

  function getDictForLang(lang) {
    if (_cache[lang]) return Promise.resolve(_cache[lang]);

    /* Try JSON files first (works when served over HTTP) */
    return loadFromServer(lang)
      .then(function (serverDict) {
        /* Merge: server data wins, inline fills gaps */
        var inline = INLINE[lang] || INLINE.tr;
        var merged = Object.assign({}, inline, serverDict);
        _cache[lang] = merged;
        return merged;
      })
      .catch(function () {
        /* Full fallback to inline */
        var dict = INLINE[lang] || INLINE.tr;
        _cache[lang] = dict;
        return dict;
      });
  }

  function init() {
    getDictForLang(_currentLang).then(function (dict) {
      _currentDict = dict;
      applyTranslations(dict);
      updateToggleUI(_currentLang);
      document.documentElement.setAttribute('lang', _currentLang === 'tr' ? 'tr' : 'en');
    });

    /* Lang switch button */
    var btn = document.getElementById('langSwitch');
    if (btn) {
      btn.addEventListener('click', function () {
        var next = _currentLang === 'tr' ? 'en' : 'tr';
        switchLang(next);
      });
    }
  }

  function switchLang(lang) {
    if (lang === _currentLang) return;

    fadeIn(function () {
      getDictForLang(lang).then(function (dict) {
        _currentLang = lang;
        _currentDict = dict;
        localStorage.setItem('visora-lang', lang);
        updateURL(lang);
        applyTranslations(dict);
        updateToggleUI(lang);
        document.documentElement.setAttribute('lang', lang === 'tr' ? 'tr' : 'en');
        fadeOut();
      });
    });
  }

  /* ──────────────────────────────────────────────────────────
     PUBLIC API
  ────────────────────────────────────────────────────────── */

  global.VISORA_I18N = {
    t: function (key) {
      return _currentDict[key] !== undefined ? _currentDict[key] : (INLINE[_currentLang] || {})[key] || key;
    },
    getLang: function () { return _currentLang; },
    switch: switchLang
  };

  /* ── Auto-init ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window);


export const INFO_CONTENT = {
  // Yerleşke
  'STADYUM KAPASİTESİ': 'Şehir üzerindeki baskı gücünü temsil eder. Seviye arttıkça stadyumun fiziksel kapasitesi büyür, bilet gelirleri artar. Unutma; boş kalan her koltuk kulüp kasasından bakım maliyeti olarak eksilir.',
  'Lojistik Ağ': 'Kulübün şehir ekonomisine yayılan kollarıdır. Maç günü dışı yan gelirleri (yiyecek, ürün satışı) belirler. Yüksek seviyelerde oyuncu kondisyonunun (15:00/21:00) daha hızlı dolmasını sağlayan rehabilitasyon etkisine sahiptir.',
  'Koz Odaları': 'Sadece parayı değil, otoriteyi de ağırladığınız yerdir. En yüksek bilet marjını sağlar. Buradaki misafir memnuniyeti, operasyonel başarı şansınıza ve savunma direncinize %5 ile %20 arası gizli çarpan ekler.',
  'Harp Sahası': "Ordunuzun manevra kabiliyetini belirler. Zemin kalitesi arttıkça pas isabeti artar, sakatlık riskleri minimize edilir. Ayrıca rakibin 'Yıldız Markajı' operasyonlarının etkisini azaltan 'Geniş Alan' avantajı sağlar.",
  'Gözlem Kulesi': "Teknolojik güçtür. Yayın gelirlerini doğrudan etkiler. Kripto İletişim Hattı sayesinde rakibin 'Tesis Sızıntısı' ve 'Transfer Sabotajı' operasyonlarının başarı şansını %15'den %50'ye kadar düşürebilir.",

  // Operasyon Odası - Saldırı/Savunma
  'Tier 1-3': "Sosyal medya ve yerel medya üzerinden kamuoyu oluşturma aşamasıdır. 'Medya Karartması' kartı ile hakkınızda çıkan negatif haberlerin yayılmasını %80 oranında durdurabilirsiniz.",
  'Tier 4-6': "Kurumsal baskı ve federasyon alt kurullarını kapsar. 'Köstebek Avı' kartı ile tesislerinize sızmış casusları temizleyebilir, rakip menajere 'Yanıltıcı İstihbarat' verebilirsiniz.",
  'Tier 7-9': "Yüksek yargı ve sistem mekanizmalarına sızma aşamasıdır. 'Hukuk Zırhı' kartı ile soruşturmaları yavaşlatabilir ve olası skandal cezalarını %100'e kadar sümen altı edebilirsiniz.",
  'Tier 10': "Sistemin bizzat kendisi olma halidir. 'Veto Yetkisi' kartı ile rakibin en ağır saldırısını henüz başlamadan, bütçelerini tamamen yakarak iptal edebilirsiniz."
};

export type InfoKey = keyof typeof INFO_CONTENT;

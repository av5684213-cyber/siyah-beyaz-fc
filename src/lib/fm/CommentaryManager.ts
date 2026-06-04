/**
 * ⚠️ DİKKAT: Bu modül kullanılmıyor (deprecated)
 * 
 * Maç yorumları artık şu kaynaklardan sağlanıyor:
 * - enhancedMatchEngine.ts → inline COMMENTARY objesi
 * - matchCommentaryGenerator.ts → generateRichCommentary()
 * 
 * Bu dosya gelecekte kaldırılacaktır. Yeni yorum mantığı eklemeyin.
 */

import { Player, ActiveTactic } from './types';

export enum CommentaryEvent {
  KICK_OFF = 'KICK_OFF',
  GOAL = 'GOAL',
  MISS = 'MISS',
  YELLOW_CARD = 'YELLOW_CARD',
  RED_CARD = 'RED_CARD',
  INJURY = 'INJURY',
  TACTICAL_OBSERVATION = 'TACTICAL_OBSERVATION',
  OPERATION_HINT = 'OPERATION_HINT',
  HALF_TIME = 'HALF_TIME',
  FULL_TIME = 'FULL_TIME',
  PRESSURE = 'PRESSURE',
  OFFSIDE_TRAP_SUCCESS = 'OFFSIDE_TRAP_SUCCESS',
  OFFSIDE_TRAP_FAILURE = 'OFFSIDE_TRAP_FAILURE',
}

interface CommentaryContext {
  minute: number;
  score: { home: number; away: number };
  player?: Player;
  tactic?: ActiveTactic;
  activeOperations?: string[]; // e.g. ['LOBBY_CARD', 'MEDIA_CARD']
  homeTeamName: string;
  awayTeamName: string;
}

export class CommentaryManager {
  private templates: Record<CommentaryEvent, string[]> = {
    [CommentaryEvent.KICK_OFF]: [
      "Hakem saatine baktı ve düdüğünü çaldı! Dev karşılaşma başladı.",
      "Ve başlama vuruşu yapıldı! İki takıma da başarılar diliyoruz.",
      "Taraftarlar hazır, oyuncular hazır... Maçın ilk düdüğü geldi!",
      "Top yuvarlanmaya başladı, futbolun tüm güzelliklerinin sahaya yansımasını diliyoruz.",
      "Maç başladı! {home} bugün mutlak galibiyet parolasıyla sahada.",
    ],
    [CommentaryEvent.GOAL]: [
      "GOOOOOOOOOOL! {player} fileleri havalandırdı! İnanılmaz bir vuruş!",
      "GOL! {player} topu ağlara gönderiyor! Tribünler yıkılıyor!",
      "AĞLARA GİTTİ! {player} skor tabelasını değiştiriyor!",
      "MÜKEMMEL BİR GOL! {player} kaleciyi çaresiz bıraktı.",
      "GOOOL! Dakika {minute} ve top ağlarda! {player} sahneye çıktı.",
      "SAYIN SEYİRCİLER GOL! {player} adeta iğne deliğinden geçirdi topu!",
      "MÜTHİŞ BİR BİTİRİCİLİK! {player} skor yükünü sırtlamaya devam ediyor.",
      "GOL! {player} bu sezonki formunu bu golle taçlandırıyor.",
      "TOP FİLELERDE! {player} takımını öne geçiren (veya farkı açan) golü attı!",
      "HAYIRLI OLSUN! {player} gol perdesini (veya gol silsilesini) sürdürüyor!",
    ],
    [CommentaryEvent.MISS]: [
      "Dışarıda! Az farkla kaçtı!",
      "Ah, inanılmaz bir fırsat tepildi! {player} çerçeveyi bulamadı.",
      "Kaleyi yokladı ama top yan ağlarda kaldı.",
      "Kaleciyle karşı karşıyaydı ama {player} topu dağlara taşlara vurdu!",
      "Maalesef... Bu pozisyon goldür diye ayağa kalktı tüm tribün ama dışarıda.",
    ],
    [CommentaryEvent.YELLOW_CARD]: [
      "Hakem elini cebine attı... Sarı kart {player} için.",
      "Sert bir müdahale ve ardından gelen sarı kart. {player} dikkatli olmalı.",
      "Hakem avantajı kesti, şimdi {player} ismini not defterine yazıyor.",
    ],
    [CommentaryEvent.RED_CARD]: [
      "KIRMIZI KART! {player} oyun dışı kalıyor!",
      "İnanılmaz! Hakem doğrudan kırmızı kartını çıkardı. {player} şokta.",
      "{home} sahada 10 kişi kalıyor! {player} için maç bitti.",
    ],
    [CommentaryEvent.INJURY]: [
      "Eyvah... {player} yerde kaldı, sağlık ekipleri sahaya giriyor.",
      "Oyun durdu. {player} ayağını tutuyor, durumu ciddi görünüyor.",
      "{home}'de zorunlu değişiklik hazırlığı var, {player} devam edemeyecek gibi.",
    ],
    [CommentaryEvent.TACTICAL_OBSERVATION]: [
      "{home} bugün {tactic} dizilişiyle sahada, belli ki galibiyet istiyorlar.",
      "Teknik direktörün dokunuşlarını hissediyoruz, takım çok disiplinli görünüyor.",
      "Sahadaki yayılım mükemmel, {tactic} sistemi tıkır tıkır işliyor.",
      "{tactic} ile orta sahayı kalabalık tutuyorlar, rakibe nefes aldırmıyorlar.",
    ],
    [CommentaryEvent.OPERATION_HINT]: [
      "Hakem bugün kararlarında çok kararlı görünüyor, {home} lehine çalınan düdükler tribünleri ayağa kaldırdı!",
      "Maç öncesi çıkan haberler oyuncuları kamçılamış gibi, inanılmaz bir hırsla sahadalar.",
      "Sanki görünmez bir el maça yön veriyor, tribünlerdeki atmosfer bile bir başka bugün.",
      "Arka plan operasyonları mı desek yoksa hırs mı? {home} adeta devleşiyor.",
    ],
    [CommentaryEvent.HALF_TIME]: [
      "İlk yarı sona erdi! {score} ile soyunma odasına gidiliyor.",
      "İlk 45 dakikanın son düdüğü geldi. Kısa bir aradan sonra tekrar buradayız.",
    ],
    [CommentaryEvent.FULL_TIME]: [
      "Ve maç bitti! {home} {score} {away}. Unutulmaz bir mücadele izledik.",
      "Maçın son düdüğü çaldı! Kazanan taraf büyük bir sevinç içinde.",
    ],
    [CommentaryEvent.PRESSURE]: [
      "Abluka devam ediyor! {home} rakip kaleyi kuşattı.",
      "Baskı iyice arttı, gol her an gelebilir gibi hisseder gibi olduk.",
      "Rakip savunma etten duvar ördü ama {home} delmeye çalışıyor.",
    ],
    [CommentaryEvent.OFFSIDE_TRAP_SUCCESS]: [
      "OFSAYT TUZAĞI! Savunma hattı mükemmel zamanlamayla ileri atıldı ve rakip forvet çizginin arkasında kaldı!",
      "Harika bir ofsayt tuzağı! Stoperler adeta tek bir vücut gibi hareket etti, hakem bayrağı kaldırdı!",
      "Ofsayt tuzağı kusursuz çalıştı! {home} savunma hattı rakip hücumunu tamamen etkisiz hale getirdi.",
      "Savunma hattının disiplini muhteşem! Birlikte ileri atılarak ofsayt tuzağı kuruyorlar ve başarıyla uyguluyorlar.",
      "Yakın markaj ve mükemmel zamanlama! Ofsayt tuzağı bir kez daha devreye girdi ve rakip atak böğüldü.",
    ],
    [CommentaryEvent.OFFSIDE_TRAP_FAILURE]: [
      "Ofsayt tuzağı bozuldu! Savunma hattı yarıldı, kaleci devreye girmek zorunda kaldı!",
      "Zamanlama hatası! Ofsayt tuzağı tutmadı ve rakip forvet savunma arkasına sızdı, çok tehlikeli!",
      "Stoperler arasındaki uyum bozuldu, ofsayt tuzağı çalışmadı! {home} ciddi bir tehlike atlattı.",
      "Ofsayt tuzağı riski göze alınıyor ama bu sefer tutmadı. Savunma hattı geri çekilmekte zorlandı.",
    ],
  };

  public generate(event: CommentaryEvent, ctx: CommentaryContext): string {
    const list = this.templates[event] || ["Maçta hareketli dakikalar..."];
    let template = list[Math.floor(Math.random() * list.length)];

    // Inject operation context if relevant
    if (ctx.activeOperations && ctx.activeOperations.length > 0 && Math.random() > 0.6 && event !== CommentaryEvent.GOAL) {
      const hintList = this.templates[CommentaryEvent.OPERATION_HINT];
      template = hintList[Math.floor(Math.random() * hintList.length)];
    }

    // Replace placeholders
    return template
      .replace(/{player}/g, ctx.player?.name || 'Oyuncu')
      .replace(/{minute}/g, ctx.minute.toString())
      .replace(/{score}/g, `${ctx.score.home}-${ctx.score.away}`)
      .replace(/{home}/g, ctx.homeTeamName)
      .replace(/{away}/g, ctx.awayTeamName)
      .replace(/{tactic}/g, ctx.tactic?.tactic_type || 'Kendi Sistemi');
  }
}

export const commentaryManager = new CommentaryManager();

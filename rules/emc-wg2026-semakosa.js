/* emc-wg2026-semakosa
 *
 * This file defines a particular transcription system for Early Middle Chinese,
 * that represents the reconstruction of the Qièyùn system described in
 * Wang & Gong, “Reconstructing pharyngealized vowels for Qieyun Division II in
 * Middle Chinese” (to appear), and forms part of the supplementary materials
 * for that paper.
 * 
 * The particular transcription system defined in this file is used in the
 * dataset and web app in:
 * 
 *   https://semakosa.github.io/middle-chinese/
 *
 * The character-level CSV dataset distributed with this repository is generated
 * mechanically from rhyme-book data by applying this derivation scheme. The
 * underlying data and much of the computational infrastructure come from the
 * nk2028 ecosystem: https://github.com/nk2028/tshet-uinh-js etc.
 * 
 * The rules themselves are mostly taken from unt.js, a larger rule set written
 * by unt, published in the nk2028 tshet-uinh-examples repository:
 * 
 *   https://github.com/nk2028/tshet-uinh-examples/blob/main/unt.js
 * 
 * @author semakosa
 */

/** @type { 音韻地位['屬於'] } */
const is = (...x) => 音韻地位.屬於(...x);
/** @type { 音韻地位['判斷'] } */
const when = (...x) => 音韻地位.判斷(...x);

if (!音韻地位) {
  /* Options */
  let isZH = typeof document === 'undefined' || (document.documentElement?.lang?.startsWith('zh') ?? true);

  return [
    isZH ? '記　號' : 'Notation',

    ['聲調記號', 0, {
      text: isZH ? null : 'Tone Marks',
      options: [
        { text: isZH ? '上ʔ 去h' : 'shàng [ʔ], qù [h]', value: ',ʔ,h,' },
        { text: isZH ? '上 X 去 H' : 'shàng [X], qù [H]', value: ',X,H,' },
        { text: isZH ? '省略' : 'None', value: ',,,' },
      ],
    }],

    ['字母有降部時的RTR', 1, {
      text: isZH ? '字母有降部時，RTR 符號加在' : 'For symbols with descenders, place the RTR diacritic',
      options: [
        { text: isZH ? '上方，如 p᫡' : 'Above, e.g. [p᫡]', value: '᫡' },
        { text: isZH ? '下方，如 p̙' : 'Below, e.g. [p̙]', value: '̙' },
      ],
    }],

    ['見組非三等寫小舌音', true, {
      text: isZH ? null : 'Transcribe Type-A dorsal initials as uvulars',
      description: isZH ? '也包括曉、匣母非三等' : 'Type-A dorsals include the 見 Jiàn group, 曉 Xiǎo, and 匣 Xiá',
    }],

    isZH ? '調　整' : 'Adjustments',

    ['幫組拼ɨə時添加w介音', true, {
      text: isZH ?
        '幫組拼 ɨ、ə 時添加 w 介音（蒸、登、豪韻除外）' :
        'Insert [w] between labials and [ɨ]/[ə]',
      description: isZH ? null : `Except in the 蒸 Zhēng, 登 Dēng, and 豪 Háo rhymes`,
    }],
  ];
}

function get聲母() {
  if (is`云母 開口 非 (深咸攝 入聲)`) return ''; // 云母開口爲零聲母，但煜、曄小韻（視爲“合口”）除外
  let 聲母 = {
    幫: 'p', 滂: 'pʰ', 並: 'b', 明: 'm',
    端: 't', 透: 'tʰ', 定: 'd', 泥: 'n', 來: 'l',
    知: 'ʈ', 徹: 'ʈʰ', 澄: 'ɖ', 孃: 'ɳ',
    見: 'k', 溪: 'kʰ', 羣: 'ɡ', 疑: 'ŋ', 曉: 'x', 匣: 'ɣ', 云: 'w',
    影: 'ʔ',
    精: 'ts', 清: 'tsʰ', 從: 'dz', 心: 's', 邪: 'z',
    莊: 'tʂ', 初: 'tʂʰ', 崇: 'dʐ', 生: 'ʂ', 俟: 'ʐ',
    章: 'tɕ', 昌: 'tɕʰ', 常: 'dʑ', 書: 'ɕ', 船: 'ʑ', 日: 'ɲ', 以: 'j',
  }[音韻地位.母];
  if (is`(幫端精見影組 或 來母) 非 三等`) 聲母 = [...聲母].map(c => c === 'ʰ' ? c : c + '̙').join('');
  return 聲母;
}

function get介音() {
  let 類介音 = { A: 'j', B: 'ɨ̯' }[音韻地位.類] ?? ''; // chóngniǔ treatment
  let 呼介音 = is`合口 非 云母` ? 'w' : '';
  return 類介音 + 呼介音;
}

function get音節核尾() {
  let [韻列表, 核] = [
    ['脂　│　　　│幽　│　　│真臻　│侵　　', 'i'],
    ['之　│微　　│　　│蒸　│殷　　│　　　', 'ɨ'],
    ['尤侯│＿＿＿│＿＿│東＿│文＿＿│＿＿＿', 'u'],
    ['支　│齊祭　│蕭宵│青　│先仙　│鹽添　', 'e'],
    ['佳　│皆　　│　　│耕　│山　　│咸　　', 'eˤ'],
    ['魚　│灰咍廢│豪　│登　│元魂痕│覃嚴凡', 'ə'],
    ['虞模│　　　│　　│冬鍾│　　　│　　　', 'o'],
    ['＿＿│＿＿＿│＿＿│江＿│＿＿＿│＿＿＿', 'oˤ'],
    ['麻　│夬　　│肴　│庚清│刪　　│銜　　', is`二等` ? 'aˤ' : 'a'],
    ['歌　│泰　　│　　│陽唐│寒　　│談　　', 'ɑ'],
  ].find(e => e[0].includes(音韻地位.韻));
  let 尾 = ['', ...'jwŋnm'][韻列表.split('│').findIndex(e => e.includes(音韻地位.韻))];
  if (is`入聲`) 尾 = { ŋ: 'k', n: 't', m: 'p' }[尾];
  return { 核, 尾 };
}

function get聲調() {
  return 選項.聲調記號.split(',').at('平上去入'.indexOf(音韻地位.聲) - is`全濁` * 4);
}

function get音節() {
  const 音節 = {
    聲母: get聲母(),
    介音: get介音(),
    ...get音節核尾(),
    聲調: get聲調(),
  };

  if (is`四等` && 音節.核 === 'i') 音節.聲母 = 音節.聲母.replace(/̙/g, ''); // 地
  if (選項.見組非三等寫小舌音) 音節.聲母 = { k̙: 'q', k̙ʰ: 'qʰ', ŋ̙: 'ɴ', x̙: 'χ', ɣ̙: 'ʁ' }[音節.聲母] ?? 音節.聲母;

  if (['p', 'ŋ', 'ɣ'].includes(音節.聲母[0])) 音節.聲母 = 音節.聲母.replace('̙', 選項.字母有降部時的RTR);

  // Add grade medials not already supplied by get介音()
  音節.介音 = when([
    ['C類', 'ɨ̯'],
    ['莊組 三等', 'ɨ̯'],
    ['銳音 三等 非 以母', 'j'],
    ['', ''],
  ]) + 音節.介音;

  if (is`支韻`) 音節.核 = "ie";
  if (選項.幫組拼ɨə時添加w介音 && ['ɨ', 'ə'].includes(音節.核) && is`幫組 非 曾攝 非 效攝`) 音節.介音 += 'w';

  if (is`四等` && 音節.核 !== 'e') 音節.介音 = 'j' + 音節.介音; // 爹小韻
  if (音節.核[0] === 'ɨ') 音節.介音 = 音節.介音.replace('ɨ̯', '');
  if (is`銳音 開口` && 音節.核[0] === 'i') 音節.介音 = 音節.介音.replace('j', '');
  if (/[ɕʑɲj]/.test(音節.聲母)) 音節.介音 = 音節.介音.replace('j', '');
  if (['u', 'o'].includes(音節.核[0])) 音節.介音 = 音節.介音.replace('w', '');

  // So as not to burden the notation with a separate symbol ʉ
  if (音節.介音 === 'ɨ̯w') {
    音節.介音 = when([
      ['幫組', 'ɨ̯'],
      ['', 'wɨ̯']
    ]);
  }

  音節.首 = 音節.聲母 + 音節.介音;
  音節.韻基 = 音節.核 + 音節.尾;
  音節.帶調韻基 = 音節.核 + 音節.尾 + 音節.聲調;
  音節.韻母 = 音節.介音 + 音節.韻基;
  音節.帶調韻母 = 音節.介音 + 音節.帶調韻基;
  return 音節;
}

const 音節 = get音節();
return 音節.聲母 + 音節.帶調韻母;

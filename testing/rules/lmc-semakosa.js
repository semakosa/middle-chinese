/* lmc-semakosa
 * Experimental transcription schemes for Late Middle Chinese.
 *
 * Implements the underlying representation of Late Middle Chinese phonology as
 * specified in Wang and Gong (to appear), §5.3 and Appendix C. The goal is to
 * derive surface pronunciations from the underlying representation alone,
 * without reference to any particular early rhyme-book categories.
 *
 * Later northwestern developments are much more conjectural.
 *
 * Currently divided into three stages:
 * - "普通晚期中古": Wang and Gong, broadly on a Late Tang model;
 * - "晚期中古（西北）": a northwestern stage broadly corresponding to
 *   Takata’s (1988) reconstructed Hexi pronunciation;
 * - "晚期河西漢語": a later Hexi stage, broadly stage reflecting later
 *   features in Khotanese-script and earlier ones in Tangut materials.
 *
 * Incorporates various rules written by unt.
 * 
 * @author semakosa
 */

/** @type { 音韻地位['屬於'] } */
const is = (...x) => 音韻地位.屬於(...x);
/** @type { 音韻地位['判斷'] } */
const when = (...x) => 音韻地位.判斷(...x);

const 顯示形式 = 選項.顯示形式 ?? '表層';
const 演變階段 = 選項.演變階段 ?? '普通晚期中古';
const is表層 = 顯示形式 !== '底層';

if (!音韻地位) return [
  // Options
  ['演變階段', [1,
    { value: '普通晚期中古', text: '普通晚期中古漢語 ≈ Wang and Gong' },
    { value: '晚期中古（西北）', text: '中期西北方音 ≈ 高田 (1988) 河西音' },
    { value: '晚期河西漢語', text: '晚期河西漢語：于闐文字及早期西夏文資料' },
  ]],

  '顯示',

  ['顯示形式', [2,
    { value: '底層', text: '底層形式：Cʕ/Cɰ/Cj + WG 韻基' },
    { value: '表層', text: '表層形式：韻基 /a/ 作 ɑ a ɛ等' },
  ]],
  ['聲調', [1,
    { value: '方言學式', text: '方言學式：¹ 陰平，² 陽平……' },
    { value: '高田', text: '高田式：¹ 陰平，₁ 陽平……' },
    { value: 'Baxter', text: 'Baxter 式：X/H；清化後無法反映字音' }
  ]],

  '調整',

  ['部分蟹攝二等入假攝', true],
  ['部分流攝脣音入遇攝', true],
];

const 非組普通聲母 = {
  幫: 'pf',
  滂: 'pfʰ',
  並: 'bv',
  明: 'ɱ',
};

const 表層低元音 = {
  前: 'a',
  後: 'ɑ',
};

function 調整音韻地位() {
  function 調整(表達式, 調整屬性, 字頭串 = null) {
    if (typeof 字頭串 === 'string' && !字頭串.includes(字頭)) return;
    if (is(表達式)) 音韻地位 = 音韻地位.調整(調整屬性);
  }

  // 輕唇化例外：沿用 A/B。
  調整('明母 尤韻', { 等: '一', 類: null, 韻: '侯' });
  調整('明母 東韻', { 等: '一', 類: null });

  // 雄、熊等。
  if (is`云母 通攝 舒聲`) {
    音韻地位 = 音韻地位.調整('匣母', ['匣母三等']);
  }

  const 蟹二入假字 = [
    '崖咼(呙)扠涯搋派差絓畫(画)罣罷(罢)',
    '佳鼃娃釵(钗)卦柴',
    '哇洼蛙灑蝸話(话)掛挂查叉杈衩',
  ].join('');

  const 流脣入遇字 = [
    '浮戊母罦罘蜉矛茂覆懋拇某負(负)阜',
    '謀(谋)部畝(亩)畮婦(妇)不否桴富牟缶',
    '復複(复)副牡',
  ].join('');

  if (選項.部分蟹攝二等入假攝 !== false) {
    調整('蟹攝 二等', { 韻: '麻' }, 蟹二入假字);
    調整('見母 開口 二等 佳韻', { 韻: '麻' }, '解');
    // NW materials show keaX as _ga, ka_, etc., but _heaX/H_ as _hei, he_, etc.
  }

  if (選項.部分流攝脣音入遇攝 !== false) {
    調整('幫組 尤侯韻', { 韻: is`尤韻` ? '虞' : '模' }, 流脣入遇字);
  }
}

調整音韻地位();

const 初始韻圖等 = when([
  ['莊組 三等', '二'], // 莊三化二, as in NW materials.
  ['幫組 C類', [
    ['止蟹攝', '四'],
    ['咸山攝', '二'],
    ['', '一'],
  ]],
  ['', 音韻地位.韻圖等],
]);

function get聲母() {
  return when([
    ['幫組 C類', 非組普通聲母[音韻地位.母]],

    // Fixed merger: 常 = 船, 崇 = 俟.
    ['崇母', 'ʐ'],
    ['常母', 'ʑ'],

    // Fixed non-short spelling: 見組一二等 remain uvular.
    ['見溪疑曉匣母 一二等', {
      見: 'q',
      溪: 'qʰ',
      疑: 'ɴ',
      曉: 'χ',
      匣: 'ʁ',
    }[音韻地位.母]],

    ['', {
      幫: 'p', 滂: 'pʰ', 並: 'b', 明: 'm',
      端: 't', 透: 'tʰ', 定: 'd', 泥: 'n', 來: 'l',
      知: 'ʈ', 徹: 'ʈʰ', 澄: 'ɖ', 孃: 'ɳ',
      精: 'ts', 清: 'tsʰ', 從: 'dz', 心: 's', 邪: 'z',
      莊: 'tʂ', 初: 'tʂʰ', 崇: 'dʐ', 生: 'ʂ', 俟: 'ʐ',
      章: 'tɕ', 昌: 'tɕʰ', 常: 'dʑ', 書: 'ɕ', 船: 'ʑ',
      日: 'ɲ', 以: 'j',
      見: 'k', 溪: 'kʰ', 羣: 'ɡ', 疑: 'ŋ',
      影: 'ʔ', 曉: 'x', 匣: 'ɣ', 云: '',
    }[音韻地位.母]],
  ]);
}

function get等介音(韻圖等) {
  return { 一: '', 二: 'ʕ', 三: 'ɰ', 四: 'j' }[韻圖等] ?? '';
}

function get合口介音() {
  return when([
    ['流深咸攝', ''],
    ['虞模韻', 'w'],
    ['', 音韻地位.呼 === '合' ? 'w' : ''],
  ]);
}

function 入聲化(韻基) {
  // WG-style bases do not list entering-tone rimes separately.
  return 韻基
    .replace(/m$/, 'p')
    .replace(/n$/, 't')
    .replace(/ŋ$/, 'k');
}

function get底層韻基() {
  const 攝到韻基 = {
    止: 'ɨj',
    遇: 'ɨ',
    流: 'ɨw',
    蟹: 'aj',
    果: 'a',
    假: 'a',
    效: 'aw',
    臻: 'ɨn',
    深: 'ɨm',
    山: 'an',
    咸: 'am',
    曾: 'ɨŋ',
    通: 'ɨwŋ',
    梗: 'ajŋ',
    宕: 'aŋ',
    江: 'awŋ',
  };

  let 韻基 = 攝到韻基[音韻地位.攝];
  if (音韻地位.聲 === '入') 韻基 = 入聲化(韻基);
  return 韻基;
}

function get聲調() {
  const is陰 = is`全清 或 次清 或 次濁 上入聲`;
  const 調 = is`全濁 上聲` ? '去' : 音韻地位.聲;
  const 調型 = 選項.聲調 ?? '調類數字';

  // Conservative dialects with a medieval NW substrate often retain a separate
  // 陽去. It is therefore reasonable to use the 7-tone system generally for all
  // medieval stages here.

  return {
    方言學式: is陰
      ? { 平: '¹', 上: '³', 去: '⁵', 入: '⁷' }
      : { 平: '²', 上: '⁴', 去: '⁶', 入: '⁸' },
    高田: is陰
      ? { 平: '¹', 上: '²', 去: '³', 入: '⁴' }
      : { 平: '₁', 上: '₂', 去: '₃', 入: '₄' },
    Baxter: is陰
      ? { 平: '', 上: 'X', 去: 'H', 入: '' }
      : { 平: '', 上: 'X', 去: 'H', 入: '' },
  }[調型][調];
}

function get底層音節() {
  return {
    聲母: get聲母(),
    韻圖等: 初始韻圖等,
    等介音: get等介音(初始韻圖等),
    合口介音: get合口介音(),
    韻基: get底層韻基(),
    聲調: get聲調(),
  };
}

/* -------------------------------------------------------------------------- */
/* 演變階段                                                                   */
/* -------------------------------------------------------------------------- */

function applyMap(值, 對照表) {
  return 對照表[值] ?? 值;
}

function 西北強制合口(音節) {
  // Crucial ordering: only original open /ɨ/ with -ɰ- is rounded here.
  // Later apicalized /ɨj/ > /ɨ/ must not feed this change.
  if (音節.韻基 === 'ɨ') {
    音節.合口介音 = 'w';
  }
}

function 西北化聲母(聲母) {
  // 非組：pf-style > f-style.
  聲母 = applyMap(聲母, {
    pf: 'f',
    'pfʰ': 'f',
    bv: 'v',
    'ɱ': 'ʋ',
  });

  // 濁塞音、塞擦音清化，後接 ɦ；濁擦音直接清化為清擦音。
  聲母 = applyMap(聲母, {
    b: 'pɦ',
    d: 'tɦ',
    'ɖ': 'ʈɦ',
    'ɡ': 'kɦ',

    dz: 'tsɦ',
    'dʐ': 'tʂɦ',
    'dʑ': 'tɕɦ',

    v: 'f',
    z: 's',
    'ʐ': 'ʂ',
    'ʑ': 'ɕ',
    'ɣ': 'x',
    'ʁ': 'χ',
  });

  // 鼻音及近鼻音的西北式發展。
  return applyMap(聲母, {
    m: 'mb',
    n: 'nd',
    'ɳ': 'nɻ',
    'ɲ': 'ʑ',
    'ŋ': 'ŋɡ',
    'ɴ': 'ɴɢ',
  });
}

function 西北化韻基(韻基) {
  // 宕、江合流；梗攝鼻化雙元音化。這些形式不再進一步表層化。
  韻基 = applyMap(韻基, {
    aŋ: 'ɔũ',
    ajŋ: 'ɛĩ',
  });

  // 入聲尾擦化。
  return 韻基
    .replace(/p$/, 'β')
    .replace(/t$/, 'r')
    .replace(/k$/, 'ɣ');
}

function 西北化音節(音節) {
  西北強制合口(音節);

  音節.聲母 = 西北化聲母(音節.聲母);
  音節.韻基 = 西北化韻基(音節.韻基);

  // Raise -ek but not -eŋ; pace Takata reflected in his materials
  if (音節.韻基 === 'ajɣ' && ['ɰ', 'j'].includes(音節.等介音)) {
    音節.韻基 = 'ɨjɣ';
  }
}

function 河西止攝齒音化(音節) {
  if (音節.韻基 !== 'ɨj') return;
  if (!is`精組 或 莊組`) return;
  if (音節.合口介音 === 'w') return; // nobody says sī for 雖

  音節.韻基 = 'ɨ';

  // S- moves to rank I; implemented here by deleting the grade medial.
  if (is`精組`) {
    音節.韻圖等 = '一';
    音節.等介音 = '';
  }
}


function 河西化聲母(聲母) {
  // 西北層的 -ɦ 塞音、塞擦音在河西層併入送氣類；擦音已於前一層完成清化。
  聲母 = applyMap(聲母, {
    'pɦ': 'pʰ',
    'tɦ': 'tʰ',
    'ʈɦ': 'ʈʰ',
    'kɦ': 'kʰ',

    'tsɦ': 'tsʰ',
    'tʂɦ': 'tʂʰ',
    'tɕɦ': 'tɕʰ',
  });

  return 聲母;
}

function 河西化韻基(音節) {
  // 火類 -a > -ɔ; -aɣ and -awɣ merge as -ɔɣ.
  音節.韻基 = applyMap(音節.韻基, {
    aɣ: 'ɔɣ',
    awŋ: 'ɔũ',
    awɣ: 'ɔɣ',
  });

  if (音節.韻基 === 'a' && 音節.等介音 === '') {
    音節.韻基 = 'ɔ';
  }

  // -aj raises after rank III/IV medials.
  if (音節.韻基 === 'aj' && ['ɰ', 'j'].includes(音節.等介音)) {
    音節.韻基 = 'ɨj';
  }
}

function 河西化音節(音節) {
  音節.聲母 = 河西化聲母(音節.聲母);
  河西止攝齒音化(音節); // Apicalization must precede iai > i.
  河西化韻基(音節);

  // ŋɡw and ɴɢw > w in certain environments
  if (音節.合口介音 === 'w'
    && (/^[aɔ]/.test(音節.韻基) || 音節.韻基 === 'ɨj')
    && /[ŋɴ][ɡɢ]/.test(音節.聲母)) {
    音節.聲母 = "w";
    音節.合口介音 = '';
  }

  // 知 finally merges with 章 or 莊, depending on palatality.
  if (/ʈ/.test(音節.聲母)) {
    音節.聲母 = 音節.聲母.replace(
      "ʈ",
      /[jɰ]/.test(音節.等介音)
        ? 'tɕ' : 'tʂ'
    )
  }
}

function 執行階段音變(音節) {
  if (演變階段 === '普通晚期中古') return;

  西北化音節(音節);

  if (演變階段 === '晚期河西漢語') {
    河西化音節(音節);
  }
}

/* -------------------------------------------------------------------------- */
/* 表層化                                                                     */
/* -------------------------------------------------------------------------- */

function 表層化低元音(韻基, 韻圖等) {
  if (!韻基.startsWith('a')) return 韻基;

  let 前低 = 表層低元音.前;
  const 後低 = 表層低元音.後;

  // ɛ before most codas in rank III/IV; include NW lenited codas too.
  if (/^a[jwmnptβrɣ]/.test(韻基) && ['三', '四'].includes(韻圖等)) {
    前低 = 'ɛ';
  }

  // Rank I and plain low velar-coda bases use the old-A back low vowel.
  const isPlainVelarLow = /^a[ŋkɣ]$/.test(韻基);
  const 用後低 = 韻圖等 === '一' || isPlainVelarLow;

  return 韻基.replace(/^a/, 用後低 ? 後低 : 前低);
}

function 表層化高元音(韻基, 韻圖等) {
  // ɨj > i; later 梗攝 ɨjk/ɣ > ik/ɣ
  if (/^ɨj/.test(韻基)) return 韻基.replace('ɨj', 'i');


  // ɨm/ɨp and NW ɨβ > im/iβ.
  if (/^ɨ[mpβ]$/.test(韻基)) {
    return 韻基.replace(/^ɨ/, 'i');
  }

  // ɨn/ɨt and NW ɨr.
  if (/^ɨ[ntr]$/.test(韻基)) {
    if (演變階段 === '普通晚期中古' && is`B類 合口 或 C類 非 開口`) return 韻基.replace(/^ɨ/, 'u');
    // wɨn → un not justified in later NW materials.
    if (韻圖等 === '四') return 韻基.replace(/^ɨ/, 'i');
    if (['一', '二'].includes(韻圖等)) return 韻基.replace(/^ɨ/, 'ə');
    return 韻基;
  }

  // ɨwŋ/ɨwk and NW ɨwɣ > uŋ/uk/uɣ. For rank I, o is supported by much of the
  // evidence. SJa and SKo distinguish 東三 ung from 鐘 ong, but this distinction
  // is ignored here.
  if (/^ɨw[ŋkɣ]$/.test(韻基)) {
    return 韻基.replace(/^ɨw/,
      ['一', '二'].includes(韻圖等) && 演變階段 === '普通晚期中古' ? 'o' : 'u'
    );
  }

  if (['一', '二'].includes(韻圖等)) {
    return 韻基.replace(/^ɨ/, 'ə');
  }

  return 韻基;
}

function get表層韻基(韻基, 韻圖等) {
  // Include NW -ɣ from earlier -k.
  韻基 = 韻基.replace(/^aj(?=[ŋkɣ]$)/, 'ɛ');

  韻基 = 表層化低元音(韻基, 韻圖等);
  韻基 = 表層化高元音(韻基, 韻圖等);

  return 韻基;
}

function 底層to表層(音節) {
  音節.韻基 = get表層韻基(音節.韻基, 音節.韻圖等);

  // 遇攝 as u.
  if (音節.合口介音 === 'w' && /^[ɨəɯ]$/.test(音節.韻基)) {
    音節.合口介音 = '';
    音節.韻基 = 音節.等介音 === '' && 演變階段 === '普通晚期中古' ? 'o' : 'u';
    // o in the earliest stage is supported by much of the evidence, parallel to
    // the treatment of ɨwŋ, ɨwk above.
  }

  // If the rime already begins with u or o, do not double-write w.
  if (/^[uo]/.test(音節.韻基)) {
    音節.合口介音 = '';
  }

  // Avoid Cɰ-u.
  if (音節.合口介音 === 'w' && 音節.等介音 === 'ɰ' && /^u/.test(音節.韻基)) {
    音節.等介音 = '';
  }

  // There is no evidence in NW-oriented materials for treating pɑw as pwɑw.

  // Surface 云母.
  if (音節.聲母 === '' && 音節.等介音 === 'ɰ' && 音節.合口介音 === '') {
    音節.聲母 = 'ɣ';
  }

  // Avoid Cɰ-ɨ.
  if (音節.等介音 === 'ɰ' && /^ɨ/.test(音節.韻基)) {
    音節.等介音 = '';
  }

  // Orthographic conventions imported from the repo's EMC scheme: neutralize
  // acute + j before i only, but neutralize all III/IV markers after palatals.
  if (is`銳音 開口` && 音節.韻基[0] === 'i') {
    音節.等介音 = 音節.等介音.replace('j', '');
  }

  if (/[jɕʑɲ]/.test(音節.聲母)) {
    音節.等介音 = 音節.等介音
      .replace('j', '')
      .replace('ɰ', '');
  }

  // Most remaining ɰ is printed ɨ before overt vowels.
  if (/^[aɑɛoɔʉui]/.test(音節.韻基)) {
    音節.等介音 = 音節.等介音.replace('ɰ', 'ɨ');
  }

  // This is a cheat: labiodentalized -am, etc. show both rank-I and rank-II
  // behaviour in the same materials, so we remove the ʕayn here.
  if (/[fvɱʋ]/.test(音節.聲母) && is`咸山攝`) {
    音節.等介音 = 音節.等介音.replace('ʕ', '');
  }

  if (音節.聲母 === 'ʔ' && 音節.等介音 === 'ʕ') {
    音節.聲母 = 'ʔˤ';
    音節.等介音 = '';
  }
}

function get介音(音節) {
  return 音節.等介音 === 'j'
    ? 音節.等介音 + 音節.合口介音
    : 音節.合口介音 + 音節.等介音;
}

function get帶調韻基(音節) {
  if (選項.聲調 === '附加符號') {
    return 音節.韻基[0] + 音節.聲調 + 音節.韻基.slice(1);
  }

  return 音節.韻基 + 音節.聲調;
}

function get音節() {
  const 音節 = get底層音節();

  執行階段音變(音節);
  if (is表層) 底層to表層(音節);

  音節.介音 = get介音(音節);
  音節.帶調韻基 = get帶調韻基(音節);

  return 音節;
}

const 音節 = get音節();
return 音節.聲母 + 音節.介音 + 音節.帶調韻基;

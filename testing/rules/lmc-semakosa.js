/* Experimental transcription schemes for Late Middle Chinese
 *
 * Implements the underlying representation of Late Middle Chinese phonology as
 * specified in Wang and Gong (to appear), Section 5.3 and Appendix C. The
 * goal is to derive surface pronunciations from the underlying representation
 * alone, without reference to any particular early rhyme book categories.
 * 
 * Later northwestern developments are much more conjectural.
 * 
 * Adapted from various rules written by unt.
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

if (!音韻地位) return [
  ['顯示形式|顯示\n底層 = rank-medial + WG 韻基；表層 = A 式外觀', [2,
    { value: '底層', text: '底層形式：Cʕ/Cɰ/Cj + WG 韻基' },
    { value: '表層', text: '表層形式：保留 A 的大致外觀' },
  ]],

  ['演變階段', [1,
    { value: '普通晚期中古', text: '普通晚期中古：非組作 pf' },
    { value: '晚期中古（西北）', text: '晚期中古（西北）：合口化、止攝齒音化、濁阻清化帶 ɦ、入聲尾擦化' },
    { value: '晚期河西漢語', text: '晚期河西漢語：在西北層上再清化、擦音合流、若干低元音高化' },
  ]],

  '韻',
  ['部分蟹攝二等入假攝', true],
  ['部分流攝脣音入遇攝', true],

  '調',
  ['聲調', [4, '五度符號', '附加符號', '調類數字', 'Baxter']],
];

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
    '佳鼃娃解釵(钗)卦柴',
    '哇洼蛙灑蝸話(话)掛挂查叉杈衩',
  ].join('');

  const 流脣入遇字 = [
    '浮戊母罦罘蜉矛茂覆懋拇某負(负)阜',
    '謀(谋)部畝(亩)畮婦(妇)不否桴富牟缶',
    '復複(复)副牡',
  ].join('');

  if (選項.部分蟹攝二等入假攝 !== false) {
    調整('蟹攝 二等', { 韻: '麻' }, 蟹二入假字);
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
      幫: 'p',   滂: 'pʰ',  並: 'b',   明: 'm',
      端: 't',   透: 'tʰ',  定: 'd',   泥: 'n',   來: 'l',
      知: 'ʈ',   徹: 'ʈʰ',  澄: 'ɖ',   孃: 'ɳ',
      精: 'ts',  清: 'tsʰ', 從: 'dz',  心: 's',   邪: 'z',
      莊: 'tʂ',  初: 'tʂʰ', 崇: 'dʐ',  生: 'ʂ',   俟: 'ʐ',
      章: 'tɕ',  昌: 'tɕʰ', 常: 'dʑ',  書: 'ɕ',   船: 'ʑ',
      日: 'ɲ',   以: 'j',
      見: 'k',   溪: 'kʰ',  羣: 'ɡ',   疑: 'ŋ',
      影: 'ʔ',   曉: 'x',   匣: 'ɣ',   云: '',
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
  const 調型 = 選項.聲調 ?? 'Baxter';

  return {
    五度符號: is陰
      ? { 平: '˦˨', 上: '˦˥', 去: '˧˨˦', 入: '˦' }
      : { 平: '˨˩', 上: '˨˦', 去: '˨˨˦', 入: '˨' },
    附加符號: { 平: '̀', 上: '́', 去: '̌', 入: '' },
    調類數字: { 平: '¹', 上: '²', 去: '³', 入: '⁴' },
    Baxter: { 平: '', 上: 'X', 去: 'H', 入: '' },
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

function 西北止攝齒音化(音節) {
  if (音節.韻基 !== 'ɨj') return;
  if (!is`精組 或 莊組`) return;

  音節.韻基 = 'ɨ';

  // S- moves to rank I: implemented by deleting the grade medial here.
  if (is`精組`) {
    音節.韻圖等 = '一';
    音節.等介音 = '';
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

  // 濁阻音清化，後接 ɦ。
  聲母 = applyMap(聲母, {
    b: 'b̥ɦ',
    d: 'd̥ɦ',
    'ɖ': 'ɖ̥ɦ',
    'ɡ': 'ɡ̊ɦ',

    dz: 'd̥z̥ɦ',
    'dʐ': 'd̥ʐ̥ɦ',
    'dʑ': 'd̥ʑ̊ɦ',

    v: 'v̥ɦ',
    z: 'z̥ɦ',
    'ʐ': 'ʐ̥ɦ',
    'ʑ': 'ʑ̊ɦ',
    'ɣ': 'ɣ̊ɦ',
    'ʁ': 'ʁ̥ɦ',
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
    awŋ: 'ɔũ',
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
  西北止攝齒音化(音節);

  音節.聲母 = 西北化聲母(音節.聲母);
  音節.韻基 = 西北化韻基(音節.韻基);
}

function 河西清化聲母(聲母) {
  // 西北帶 ɦ 的濁阻音在河西層完全清化；塞音、塞擦音併入送氣類。
  聲母 = applyMap(聲母, {
    'b̥ɦ': 'pʰ',
    'd̥ɦ': 'tʰ',
    'ɖ̥ɦ': 'ʈʰ',
    'ɡ̊ɦ': 'kʰ',

    'd̥z̥ɦ': 'tsʰ',
    'd̥ʐ̥ɦ': 'tʂʰ',
    'd̥ʑ̊ɦ': 'tɕʰ',

    'v̥ɦ': 'f',
    'z̥ɦ': 's',
    'ʐ̥ɦ': 'ʂ',
    'ʑ̊ɦ': 'ɕ',
    'ɣ̊ɦ': 'x',
    'ʁ̥ɦ': 'χ',
  });
  
  return 聲母;
}

function 河西化韻基(音節) {
  // 火類 -a > -ɔ; -aɣ and -awɣ merge as -ɔɣ.
  音節.韻基 = applyMap(音節.韻基, {
    aɣ: 'ɔɣ',
    awɣ: 'ɔɣ',
  });
  
  if (音節.韻基 === 'a' && 音節.等介音 === '') {
    音節.韻基 = 'ɔ';
  }

  // -aj raises after rank III/IV medials.
  if (音節.韻基 === 'aj' && ['ɰ', 'j'].includes(音節.等介音)) {
    音節.韻基 = 'ɨj';
  }

  // Entering-tone counterpart: -ajɣ > -ɨɣ in rank III/IV.
  if (音節.韻基 === 'ajɣ' && ['ɰ', 'j'].includes(音節.等介音)) {
    音節.韻基 = 'ɨɣ';
  }
}

function 河西化音節(音節) {
  音節.聲母 = 河西清化聲母(音節.聲母);
  河西化韻基(音節);
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
  // ɨj > i.
  if (韻基 === 'ɨj') return 'i';

  // ɨm/ɨp and NW ɨβ > im/iβ.
  if (/^ɨ[mpβ]$/.test(韻基)) {
    return 韻基.replace(/^ɨ/, 'i');
  }

  // ɨn/ɨt and NW ɨr.
  if (/^ɨ[ntr]$/.test(韻基)) {
    if (is`B類 合口 或 C類 非 開口`) return 韻基.replace(/^ɨ/, 'u');
    if (韻圖等 === '四') return 韻基.replace(/^ɨ/, 'i');
    if (['一', '二'].includes(韻圖等)) return 韻基.replace(/^ɨ/, 'ə');
    return 韻基;
  }

  // ɨwŋ/ɨwk and NW ɨwɣ > uŋ/uk/uɣ.
  if (/^ɨw[ŋkɣ]$/.test(韻基)) {
    return 韻基.replace(/^ɨw/, 'u');
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

  // wɨ-like open high vowel is printed u.
  if (音節.合口介音 === 'w' && /^[ɨəɯ]$/.test(音節.韻基)) {
    音節.合口介音 = '';
    音節.韻基 = 'u';
  }

  // If the rime already begins with u, do not double-write w.
  if (/^u/.test(音節.韻基)) {
    音節.合口介音 = '';
  }

  // Remove III/IV marker after palatal initials.
  if (/[jɕʑɲ]/.test(音節.聲母)) {
    音節.等介音 = 音節.等介音
      .replace('j', '')
      .replace('ɰ', '');
  }

  // Avoid Cɰ-u.
  if (音節.合口介音 === 'w' && 音節.等介音 === 'ɰ' && /^u/.test(音節.韻基)) {
    音節.等介音 = '';
  }

  // Surface 云母.
  if (音節.聲母 === '' && 音節.等介音 === 'ɰ' && 音節.合口介音 === '') {
    音節.聲母 = 'ɣ';
  }

  // Avoid Cɰ-ɨ.
  if (音節.等介音 === 'ɰ' && /^ɨ/.test(音節.韻基)) {
    音節.等介音 = '';
  }

  // Most remaining ɰ is printed ɨ before overt vowels.
  if (/^[aɑɛoɔʉui]/.test(音節.韻基)) {
    音節.等介音 = 音節.等介音.replace('ɰ', 'ɨ');
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
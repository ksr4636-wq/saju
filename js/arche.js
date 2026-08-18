/* ============================================================
   캐릭터 유형 일러스트 — 격국 10종
   ------------------------------------------------------------
   특정 작품의 인물이 아니라 장르별 아키타입을 형상화한 것이다.
   실존 인물이나 저작권 있는 캐릭터를 참조하지 않는다.
   테두리 색은 그 격국이 속한 십성 그룹의 색을 쓴다.
     비겁 → 화 · 식상 → 목 · 재성 → 토 · 관성 → 금 · 인성 → 수
   ============================================================ */

const ARCHE_OH = {비견:"화", 겁재:"화", 록겁:"화",
                  식신:"목", 상관:"목",
                  편재:"토", 정재:"토",
                  편관:"금", 정관:"금",
                  편인:"수", 정인:"수"};

/* 공통 부품 */
function _bust(skin, cloth){
  return `<path d="M60 74 q-27 3 -32 26 q-2 12 -1 20 l66 0 q1 -8 -1 -20 q-5 -23 -32 -26 z" fill="${cloth}"/>
          <circle cx="60" cy="52" r="20" fill="${skin}"/>`;
}
function _eyes(y, r){
  const yy = y||50, rr = r||2.1;
  return `<circle cx="53" cy="${yy}" r="${rr}" fill="#23262B"/><circle cx="67" cy="${yy}" r="${rr}" fill="#23262B"/>`;
}
const SKIN = "#E8CBAE", SKIN2 = "#DDBE9C";

/* 소품 배지 — 원 안쪽 우하단 고정 영역 (중심 92,92 / 반지름 18) */
function _badge(inner, c){
  return `<circle cx="92" cy="92" r="19" fill="#FBFAF8" stroke="${c}" stroke-width="1.6" opacity=".97"/>
          <g transform="translate(92,92)">${inner}</g>`;
}

const ARCHE_ART = {
  /* 정관 — 원칙을 지키는 실무 주인공 : 정장·안경 + 서류 도장 */
  정관:(c)=>`
    ${_bust(SKIN, "#3A3F47")}
    <path d="M40 48 q0 -22 20 -22 q20 0 20 22 q-4 -12 -20 -12 q-16 0 -20 12 z" fill="#2B2F36"/>
    <path d="M60 76 l-9 6 l9 10 l9 -10 z" fill="#F2EFEA"/>
    <path d="M60 82 l-4 4 l4 14 l4 -14 z" fill="${c}"/>
    <rect x="45" y="46" width="13" height="9" rx="2" fill="none" stroke="#23262B" stroke-width="1.5"/>
    <rect x="62" y="46" width="13" height="9" rx="2" fill="none" stroke="#23262B" stroke-width="1.5"/>
    <path d="M58 50 h4" stroke="#23262B" stroke-width="1.5"/>
    ${_eyes(51,1.7)}
    ${_badge(`<rect x="-7" y="-9" width="14" height="17" rx="1.5" fill="#F2EFEA" stroke="#C6C3BC"/>
      <path d="M-4 -4 h8 M-4 0 h8 M-4 4 h5" stroke="#9DA2AA" stroke-width="1.2"/>
      <circle cx="4" cy="5" r="4.5" fill="${c}" opacity=".9"/>`, c)}`,

  /* 편관 — 위기에 투입되는 해결사 : 헬멧 + 무전기 */
  편관:(c)=>`
    ${_bust(SKIN, "#5A4632")}
    <path d="M36 50 q0 -24 24 -24 q24 0 24 24 l0 4 l-48 0 z" fill="${c}"/>
    <path d="M34 52 q26 -6 52 0 l0 5 q-26 -5 -52 0 z" fill="#2B2F36"/>
    <path d="M60 26 q4 0 4 8 l-8 0 q0 -8 4 -8 z" fill="#F2EFEA"/>
    ${_eyes(58,2.1)}
    <path d="M50 68 q10 5 20 0" stroke="#B08A62" stroke-width="1.6" fill="none"/>
    ${_badge(`<rect x="-5" y="-6" width="10" height="15" rx="2.5" fill="#3A3F47"/>
      <rect x="-3" y="-11" width="1.8" height="6" fill="#3A3F47"/>
      <circle cx="0" cy="-1" r="2" fill="${c}"/>
      <path d="M-3 4 h6 M-3 7 h6" stroke="#8E939B" stroke-width="1.2"/>`, c)}`,

  /* 정재 — 곳간을 쥔 살림꾼 : 앞치마 + 주판 */
  정재:(c)=>`
    ${_bust(SKIN, "#8E939B")}
    <path d="M38 50 q0 -24 22 -24 q22 0 22 24 q-6 -6 -22 -6 q-16 0 -22 6 z" fill="#4E4034"/>
    <path d="M46 92 q14 -6 28 0 l0 28 l-28 0 z" fill="#F2EFEA"/>
    <path d="M46 96 h28" stroke="#C6C3BC" stroke-width="1.4"/>
    ${_eyes(52,2)}
    <path d="M52 62 q8 4 16 0" stroke="#B08A62" stroke-width="1.6" fill="none"/>
    ${_badge(`<rect x="-9" y="-8" width="18" height="16" rx="1.5" fill="#EDEAE3" stroke="#B9B6AE"/>
      <path d="M-9 -2 h18 M-9 3 h18" stroke="#C6C3BC" stroke-width="1"/>
      <circle cx="-5" cy="-5" r="2" fill="${c}"/><circle cx="1" cy="-5" r="2" fill="${c}"/>
      <circle cx="-5" cy="0" r="2" fill="#9DA2AA"/><circle cx="5" cy="0" r="2" fill="${c}"/>
      <circle cx="-1" cy="5" r="2" fill="${c}"/>`, c)}`,

  /* 편재 — 판을 짜는 기획자 : 상승 그래프 보드 */
  편재:(c)=>`
    ${_bust(SKIN, "#6E747E")}
    <path d="M39 48 q2 -22 21 -22 q19 0 21 22 q-5 -9 -12 -6 q-9 4 -18 0 q-8 -3 -12 6 z" fill="#3A2E22"/>
    ${_eyes(50,2.1)}
    <path d="M51 62 q9 6 18 0" stroke="#B08A62" stroke-width="1.7" fill="none"/>
    ${_badge(`<rect x="-10" y="-9" width="20" height="16" rx="1.5" fill="#F6F4F0" stroke="#B9B6AE"/>
      <path d="M-7 3 l4 -6 l4 4 l6 -8" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5 -7 l2.5 0 l0 2.5" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <rect x="-5" y="9" width="11" height="3" rx="1.5" fill="${c}"/>`, c)}`,

  /* 정인 — 길을 아는 조력자 : 펼친 책 + 빛 */
  정인:(c)=>`
    ${_bust(SKIN, "#4A5560")}
    <path d="M39 54 q0 -28 21 -28 q21 0 21 28 q-4 -16 -21 -16 q-17 0 -21 16 z" fill="#9DA2AA"/>
    <path d="M39 54 q-4 9 1 14 q3 -8 2 -14 z" fill="#9DA2AA"/>
    <path d="M81 54 q4 9 -1 14 q-3 -8 -2 -14 z" fill="#9DA2AA"/>
    ${_eyes(53,2)}
    <path d="M52 65 q8 4 16 0" stroke="#B08A62" stroke-width="1.6" fill="none"/>
    ${_badge(`<path d="M-10 -1 q5 -5 10 -1 q5 -4 10 1 l0 9 q-5 -4 -10 0 q-5 -4 -10 0 z" fill="#F2EFEA" stroke="#B9B6AE"/>
      <path d="M0 -2 l0 9" stroke="#C6C3BC" stroke-width="1.1"/>
      <path d="M-10 -1 q5 -5 10 -1 q5 -4 10 1" fill="none" stroke="${c}" stroke-width="1.8"/>
      <circle cx="0" cy="-9" r="3" fill="${c}" opacity=".85"/>
      <path d="M0 -15 l0 2.5 M-5 -13 l1.8 1.8 M5 -13 l-1.8 1.8" stroke="${c}" stroke-width="1.4" stroke-linecap="round"/>`, c)}`,

  /* 편인 — 은둔한 전문가 : 후드 + 돋보기 */
  편인:(c)=>`
    ${_bust(SKIN2, "#2B3440")}
    <path d="M34 60 q0 -34 26 -34 q26 0 26 34 q-6 -6 -8 -14 q-4 -10 -18 -10 q-14 0 -18 10 q-2 8 -8 14 z" fill="#39434F"/>
    <path d="M42 46 q6 -12 18 -12 q12 0 18 12 q-8 -6 -18 -6 q-10 0 -18 6 z" fill="#2B3440"/>
    ${_eyes(54,2)}
    ${_badge(`<circle cx="-2" cy="-2" r="8" fill="none" stroke="${c}" stroke-width="2.2"/>
      <circle cx="-2" cy="-2" r="6" fill="#DDE6EC" opacity=".6"/>
      <path d="M4 4 l6 6" stroke="${c}" stroke-width="2.8" stroke-linecap="round"/>
      <path d="M-6 -1 h3 M-1 -5 h4 M-5 3 h6" stroke="#6E747E" stroke-width="1.2"/>`, c)}`,

  /* 식신 — 모두의 끼니를 챙기는 사람 : 앞치마 + 냄비 */
  식신:(c)=>`
    ${_bust(SKIN, "#C6C3BC")}
    <path d="M38 50 q2 -24 22 -24 q20 0 22 24 q-8 -10 -22 -10 q-14 0 -22 10 z" fill="#4E4034"/>
    <path d="M44 90 q16 -7 32 0 l0 30 l-32 0 z" fill="#F2EFEA"/>
    <path d="M52 88 l4 -8 M68 88 l-4 -8" stroke="#F2EFEA" stroke-width="3" stroke-linecap="round"/>
    ${_eyes(52,2.1)}
    <path d="M51 63 q9 7 18 0" stroke="#B08A62" stroke-width="1.8" fill="none"/>
    ${_badge(`<path d="M-9 -1 q9 -3 18 0 l-2 11 q-7 3 -14 0 z" fill="${c}"/>
      <ellipse cx="0" cy="-1" rx="9" ry="2.6" fill="#EDEAE3"/>
      <path d="M-11 0 q-3 1 -1 4 M11 0 q3 1 1 4" stroke="${c}" stroke-width="1.8" fill="none"/>
      <path d="M-4 -8 q3 -4 0 -7 M4 -8 q3 -4 0 -7" stroke="#B9B6AE" stroke-width="1.6" fill="none" stroke-linecap="round"/>`, c)}`,

  /* 상관 — 판을 뒤집는 문제아 천재 : 마이크 + 물음표 */
  상관:(c)=>`
    ${_bust(SKIN, "#F2EFEA")}
    <path d="M38 50 q0 -24 22 -24 q22 0 22 24 q-4 -8 -14 -8 q4 -8 -4 -10 q-6 8 -18 4 q-6 6 -8 14 z" fill="#2B2F36"/>
    ${_eyes(50,2.2)}
    <path d="M50 63 q10 8 20 -2" stroke="#B08A62" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M28 40 q0 -7 5.5 -7 q5.5 0 5.5 5.5 q0 4.5 -5.5 5.5 l0 3" stroke="${c}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <circle cx="33.5" cy="52" r="1.7" fill="${c}"/>
    ${_badge(`<rect x="-4" y="-10" width="8" height="14" rx="4" fill="#3A3F47"/>
      <circle cx="0" cy="-9" r="4.6" fill="${c}"/>
      <path d="M0 4 l0 6 M-5 10 h10" stroke="#3A3F47" stroke-width="2.2" stroke-linecap="round"/>`, c)}`,

  /* 비견·록겁 — 혼자서도 가는 독립군 : 배낭 + 지도 */
  비견:(c)=>`
    ${_bust(SKIN, "#7A6A55")}
    <path d="M38 48 q3 -22 22 -22 q19 0 22 22 q-7 -8 -22 -8 q-15 0 -22 8 z" fill="#4E4034"/>
    <path d="M33 86 q-7 4 -7 15 l0 12 l12 0 l0 -20 z" fill="${c}"/>
    <path d="M87 86 q7 4 7 15 l0 12 l-12 0 l0 -20 z" fill="${c}"/>
    <path d="M37 90 q23 -8 46 0" stroke="${c}" stroke-width="2.8" fill="none"/>
    ${_eyes(50,2.1)}
    <path d="M52 63 q8 5 16 0" stroke="#B08A62" stroke-width="1.7" fill="none"/>
    ${_badge(`<path d="M-11 -5 l7.5 -3.5 l7 3.5 l7.5 -3.5 l0 12 l-7.5 3.5 l-7 -3.5 l-7.5 3.5 z" fill="#F2EFEA" stroke="#B9B6AE"/>
      <path d="M-3.5 -8.5 l0 15 M3.5 -5 l0 15" stroke="#C6C3BC" stroke-width="1"/>
      <path d="M-7 1 q4 -6 8 -1 q3 4 7 -1" stroke="${c}" stroke-width="1.6" fill="none"/>`, c)}`,

  /* 겁재·양인 — 타고난 승부사 : 헤드밴드 + 스톱워치 */
  겁재:(c)=>`
    ${_bust(SKIN, "#3A3F47")}
    <path d="M38 48 q4 -22 22 -22 q18 0 22 22 q-6 -6 -10 -2 q-6 -8 -14 -4 q-8 4 -10 -2 q-6 2 -10 8 z" fill="#2B2F36"/>
    <path d="M39 43 q21 -7 42 0 l0 5 q-21 -6 -42 0 z" fill="${c}"/>
    <path d="M34 96 q26 -8 52 0" stroke="${c}" stroke-width="3.6" fill="none"/>
    ${_eyes(53,2.2)}
    <path d="M52 66 q8 3 16 0" stroke="#B08A62" stroke-width="1.7" fill="none"/>
    ${_badge(`<circle cx="0" cy="1" r="10" fill="#EDEAE3" stroke="#6E747E" stroke-width="1.8"/>
      <path d="M0 1 l0 -6 M0 1 l4.5 3" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
      <rect x="-2.5" y="-12" width="5" height="3.5" rx="1.2" fill="#6E747E"/>
      <path d="M8 -8 l4 -4" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`, c)}`
};
ARCHE_ART["록겁"] = ARCHE_ART["비견"];
ARCHE_ART["정재"] = ARCHE_ART["정재"];

/* 캐릭터 유형 일러스트 생성 */
function archeArt(type, size){
  const s = size || 120;
  const key = ARCHE_ART[type] ? type : "비견";
  const oh = ARCHE_OH[key] || "금";
  const c = OH_HEX[oh];
  const name = (typeof ARCHE !== "undefined" && ARCHE[key]) ? ARCHE[key].name : "";
  // 피규어 사진이 준비되면 우선 사용 (img/arche/{key}.webp)
  const f = (typeof ARCHE_PHOTO !== "undefined") ? ARCHE_PHOTO[key] : null;
  if (f) return `<span class="dogfig" style="width:${s}px;height:${s}px">
      <img src="img/arche/${f}.webp" width="${s}" height="${s}" loading="lazy"
        alt="${name}" title="${name}"
        onerror="this.parentNode.outerHTML=archeSvg('${key}',${s})">
      <span class="dogring oh-bd-${oh}"></span></span>`;
  return archeSvg(key, s);
}
function archeSvg(key, s){
  const oh = ARCHE_OH[key] || "금";
  const c = OH_HEX[oh];
  const name = (typeof ARCHE !== "undefined" && ARCHE[key]) ? ARCHE[key].name : "";
  return `<span class="dogfig archefig oh-bg2-${oh}" style="width:${s}px;height:${s}px">
    <svg viewBox="0 0 120 120" width="${s}" height="${s}" role="img" aria-label="${name}">
      ${ARCHE_ART[key](c)}
    </svg>
    <span class="dogring oh-bd-${oh}"></span></span>`;
}

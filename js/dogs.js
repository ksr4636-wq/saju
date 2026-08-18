/* ============================================================
   견종 캐릭터 — 인라인 SVG
   일간 10종에 대응하는 견종을 직접 그린다.
   외부 이미지 의존 없음. 목걸이 색은 일간의 오행 색을 쓴다.
   ============================================================ */

const OH_HEX = {목:"#2E6F5E", 화:"#B03A2E", 토:"#9A7B34", 금:"#6E747E", 수:"#2B3440"};

/* 공통 부품 */
function _eye(x, y, r, color, shine){
  return `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r*1.08}" fill="${color||'#23262B'}"/>`
       + `<circle cx="${x+r*0.34}" cy="${y-r*0.4}" r="${r*0.3}" fill="#fff" opacity="${shine===false?0:.9}"/>`;
}
function _nose(x, y, w, dark){
  return `<path d="M${x-w} ${y-w*0.45} q${w} -${w*0.55} ${w*2} 0 q0 ${w*0.95} -${w} ${w*1.05} q-${w} -${w*0.1} -${w} -${w*1.05} z"
    fill="${dark||'#23262B'}"/>`;
}
function _collar(color){
  return `<path d="M36 96 q24 13 48 0 l0 8 q-24 13 -48 0 z" fill="${color}" opacity=".92"/>
          <circle cx="60" cy="108" r="4.6" fill="${color}"/>
          <circle cx="60" cy="108" r="2.2" fill="#fff" opacity=".55"/>`;
}

/* 견종별 정의 */
const DOG_ART = {
  /* 갑 — 그레이트 데인 : 길고 각진 얼굴, 반접힌 귀, 회색 */
  갑: (c)=>`
    <path d="M34 48 q-14 -20 -3 -27 q14 5 17 25 z" fill="#6E747E"/>
    <path d="M86 48 q14 -20 3 -27 q-14 5 -17 25 z" fill="#6E747E"/>
    <path d="M36 46 q-9 -14 -2 -19 q9 4 11 18 z" fill="#4E545C"/>
    <path d="M84 46 q9 -14 2 -19 q-9 4 -11 18 z" fill="#4E545C"/>
    <path d="M60 30 q26 0 26 30 q0 30 -26 42 q-26 -12 -26 -42 q0 -30 26 -30 z" fill="#7A8089"/>
    <ellipse cx="60" cy="82" rx="14" ry="15" fill="#8E939B"/>
    ${_eye(48,58,4.4)} ${_eye(72,58,4.4)}
    ${_nose(60,76,5.4)}
    <path d="M53 88 q7 5 14 0" stroke="#4E545C" stroke-width="2" fill="none" stroke-linecap="round"/>
    ${_collar(c)}`,

  /* 을 — 웰시 코기 : 크고 둥근 뾰족귀, 넓은 볼, 황갈+흰 블레이즈 */
  을: (c)=>`
    <path d="M32 46 q-6 -26 6 -30 q11 8 12 28 z" fill="#C79A5E"/>
    <path d="M88 46 q6 -26 -6 -30 q-11 8 -12 28 z" fill="#C79A5E"/>
    <path d="M35 44 q-3 -18 4 -21 q7 6 8 20 z" fill="#E8C9A0"/>
    <path d="M85 44 q3 -18 -4 -21 q-7 6 -8 20 z" fill="#E8C9A0"/>
    <ellipse cx="60" cy="66" rx="31" ry="28" fill="#C79A5E"/>
    <path d="M60 40 q7 22 0 44 q-7 -22 0 -44 z" fill="#F3EFE7"/>
    <ellipse cx="60" cy="82" rx="17" ry="13" fill="#F3EFE7"/>
    ${_eye(48,60,4.2)} ${_eye(72,60,4.2)}
    ${_nose(60,77,5)}
    <path d="M52 87 q8 6 16 0" stroke="#8A6A38" stroke-width="2" fill="none" stroke-linecap="round"/>
    ${_collar(c)}`,

  /* 병 — 골든 리트리버 : 둥글게 늘어진 귀, 황금색, 웃는 입 */
  병: (c)=>`
    <path d="M30 48 q-17 -2 -16 20 q1 25 17 29 q7 -3 4 -13 q-9 -17 -5 -36 z" fill="#B37E31"/>
    <path d="M90 48 q17 -2 16 20 q-1 25 -17 29 q-7 -3 -4 -13 q9 -17 5 -36 z" fill="#B37E31"/>
    <path d="M32 54 q-9 2 -8 16 q1 16 10 20 q-5 -18 -2 -36 z" fill="#CE9440"/>
    <path d="M88 54 q9 2 8 16 q-1 16 -10 20 q5 -18 2 -36 z" fill="#CE9440"/>
    <ellipse cx="60" cy="64" rx="28" ry="27" fill="#D9A24F"/>
    <ellipse cx="60" cy="82" rx="16" ry="13" fill="#EBC079"/>
    ${_eye(49,58,4.3)} ${_eye(71,58,4.3)}
    ${_nose(60,76,5.2)}
    <path d="M50 86 q10 9 20 0" stroke="#8A6224" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <path d="M56 88 q4 6 8 0" fill="#C0655E"/>
    ${_collar(c)}`,

  /* 정 — 카발리에 : 길게 늘어진 물결 귀, 흰바탕+밤색 패치, 큰 눈 */
  정: (c)=>`
    <path d="M34 46 q-19 4 -18 28 q1 26 12 34 q6 4 9 -3 q-4 -10 -8 -18 q-4 -20 5 -41 z" fill="#7E3E24"/>
    <path d="M86 46 q19 4 18 28 q-1 26 -12 34 q-6 4 -9 -3 q4 -10 8 -18 q4 -20 -5 -41 z" fill="#7E3E24"/>
    <path d="M35 56 q-11 5 -10 22 q1 18 9 25 q-8 -22 1 -47 z" fill="#9B5334"/>
    <ellipse cx="60" cy="64" rx="24" ry="24" fill="#F6F2EC"/>
    <path d="M60 41 q-15 1 -18 15 q9 4 18 3 z" fill="#7E3E24"/>
    <path d="M60 41 q15 1 18 15 q-9 4 -18 3 z" fill="#7E3E24"/>
    <ellipse cx="60" cy="78" rx="13" ry="12" fill="#FCFAF6"/>
    ${_eye(50,61,6)} ${_eye(70,61,6)}
    ${_nose(60,74,4.6)}
    <path d="M54 83 q6 5 12 0" stroke="#9A8272" stroke-width="2" fill="none" stroke-linecap="round"/>
    ${_collar(c)}`,

  /* 무 — 세인트 버나드 : 큰 머리, 넓은 드롭 귀, 흰+적갈 패치, 처진 볼 */
  무: (c)=>`
    <path d="M26 48 q-16 1 -15 19 q1 20 14 24 q5 -21 1 -43 z" fill="#8A4B2A"/>
    <path d="M94 48 q16 1 15 19 q-1 20 -14 24 q-5 -21 -1 -43 z" fill="#8A4B2A"/>
    <path d="M60 32 q34 2 34 30 q0 22 -12 32 q-10 8 -22 8 q-12 0 -22 -8 q-12 -10 -12 -32 q0 -28 34 -30 z" fill="#F4EEE6"/>
    <path d="M60 33 q-24 1 -30 20 q6 8 17 7 q6 -18 13 -19 z" fill="#8A4B2A"/>
    <path d="M60 33 q22 1 28 17 q-8 5 -15 3 q-5 -14 -13 -16 z" fill="#8A4B2A"/>
    <ellipse cx="60" cy="84" rx="21" ry="15" fill="#FBF8F3"/>
    <path d="M32 74 q-4 14 6 20 q4 -10 2 -20 z" fill="#EDE4D8"/>
    <path d="M88 74 q4 14 -6 20 q-4 -10 -2 -20 z" fill="#EDE4D8"/>
    ${_eye(47,60,4)} ${_eye(73,60,4)}
    <path d="M42 65 q4 6 8 2" stroke="#C4B29C" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M78 65 q-4 6 -8 2" stroke="#C4B29C" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    ${_nose(60,78,6.4)}
    <path d="M60 86 q-9 9 -15 3 M60 86 q9 9 15 3" stroke="#B9A794" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    ${_collar(c)}`,

  /* 기 — 셰틀랜드 쉽독 : 세미프릭 귀, 긴 주둥이, 세이블+흰 목도리 */
  기: (c)=>`
    <path d="M36 44 q-6 -22 3 -25 q9 7 9 24 z" fill="#A87A45"/>
    <path d="M84 44 q6 -22 -3 -25 q-9 7 -9 24 z" fill="#A87A45"/>
    <path d="M37 26 q-4 -4 -1 -7 q6 2 7 8 z" fill="#F3EFE7"/>
    <path d="M83 26 q4 -4 1 -7 q-6 2 -7 8 z" fill="#F3EFE7"/>
    <path d="M60 34 q25 4 25 28 q0 26 -25 40 q-25 -14 -25 -40 q0 -24 25 -28 z" fill="#A87A45"/>
    <path d="M60 36 q5 20 0 38 q-5 -18 0 -38 z" fill="#F3EFE7"/>
    <ellipse cx="60" cy="84" rx="12" ry="14" fill="#F3EFE7"/>
    <path d="M30 86 q30 20 60 0 q-4 16 -30 18 q-26 -2 -30 -18 z" fill="#F6F3ED"/>
    <path d="M34 90 q26 15 52 0" stroke="#DDD6C8" stroke-width="1.4" fill="none"/>
    ${_eye(49,58,3.9)} ${_eye(71,58,3.9)}
    ${_nose(60,80,4.6)}
    <path d="M55 90 q5 4 10 0" stroke="#8A6A38" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    ${_collar(c)}`,

  /* 경 — 도베르만 : 크고 뾰족한 귀, 검정+탄 포인트 */
  경: (c)=>`
    <path d="M36 44 q-5 -30 2 -33 q10 12 10 32 z" fill="#2B2F36"/>
    <path d="M84 44 q5 -30 -2 -33 q-10 12 -10 32 z" fill="#2B2F36"/>
    <path d="M38 42 q-3 -22 2 -24 q7 9 7 23 z" fill="#4A4038"/>
    <path d="M82 42 q3 -22 -2 -24 q-7 9 -7 23 z" fill="#4A4038"/>
    <path d="M60 32 q26 3 26 28 q0 27 -26 42 q-26 -15 -26 -42 q0 -25 26 -28 z" fill="#2B2F36"/>
    <ellipse cx="60" cy="84" rx="13" ry="15" fill="#8A5C33"/>
    <ellipse cx="48" cy="52" rx="4.5" ry="3" fill="#8A5C33"/>
    <ellipse cx="72" cy="52" rx="4.5" ry="3" fill="#8A5C33"/>
    ${_eye(48,60,4,"#0F1113")} ${_eye(72,60,4,"#0F1113")}
    ${_nose(60,80,5,"#15171A")}
    <path d="M55 90 q5 4 10 0" stroke="#5B3E22" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    ${_collar(c)}`,

  /* 신 — 시바견 : 작은 삼각 뾰족귀, 적갈+흰 우라지로 */
  신: (c)=>`
    <path d="M36 44 q-4 -21 3 -23 q8 7 8 22 z" fill="#B5713C"/>
    <path d="M84 44 q4 -21 -3 -23 q-8 7 -8 22 z" fill="#B5713C"/>
    <path d="M38 42 q-2 -13 3 -15 q5 5 5 14 z" fill="#8A4E24"/>
    <path d="M82 42 q2 -13 -3 -15 q-5 5 -5 14 z" fill="#8A4E24"/>
    <ellipse cx="60" cy="66" rx="30" ry="27" fill="#B5713C"/>
    <path d="M44 52 q5 -4 9 1 q-5 2 -9 -1 z" fill="#F3EFE7"/>
    <path d="M76 52 q-5 -4 -9 1 q5 2 9 -1 z" fill="#F3EFE7"/>
    <path d="M60 66 q-19 6 -18 18 q4 12 18 13 q14 -1 18 -13 q1 -12 -18 -18 z" fill="#F3EFE7"/>
    ${_eye(49,60,4.1)} ${_eye(71,60,4.1)}
    ${_nose(60,78,5)}
    <path d="M60 84 q-7 7 -11 2 M60 84 q7 7 11 2" stroke="#8A6A48" stroke-width="2" fill="none" stroke-linecap="round"/>
    ${_collar(c)}`,

  /* 임 — 시베리안 허스키 : 뾰족귀, 흑백 마스크, 파란 눈 */
  임: (c)=>`
    <path d="M35 44 q-5 -25 3 -27 q9 9 9 26 z" fill="#3A3F47"/>
    <path d="M85 44 q5 -25 -3 -27 q-9 9 -9 26 z" fill="#3A3F47"/>
    <path d="M37 42 q-3 -16 3 -18 q6 6 6 17 z" fill="#B9AFA4"/>
    <path d="M83 42 q3 -16 -3 -18 q-6 6 -6 17 z" fill="#B9AFA4"/>
    <ellipse cx="60" cy="65" rx="30" ry="28" fill="#F2EFEA"/>
    <path d="M60 37 q-21 3 -24 20 q6 6 13 3 q4 -14 11 -15 z" fill="#3A3F47"/>
    <path d="M60 37 q21 3 24 20 q-6 6 -13 3 q-4 -14 -11 -15 z" fill="#3A3F47"/>
    <path d="M60 52 q-6 3 -6 12 q0 4 6 4 q6 0 6 -4 q0 -9 -6 -12 z" fill="#3A3F47"/>
    <ellipse cx="60" cy="82" rx="15" ry="13" fill="#FBF9F5"/>
    ${_eye(48,60,4.3,"#2F6F92")} ${_eye(72,60,4.3,"#2F6F92")}
    ${_nose(60,77,5)}
    <path d="M60 83 q-7 7 -11 2 M60 83 q7 7 11 2" stroke="#9AA0A8" stroke-width="2" fill="none" stroke-linecap="round"/>
    ${_collar(c)}`,

  /* 계 — 스탠더드 푸들 : 곱슬 머리, 늘어진 곱슬 귀 */
  계: (c)=>`
    <path d="M30 54 q-12 2 -11 20 q1 17 12 21 q7 -3 5 -12 q-8 -12 -6 -29 z" fill="#8E939B"/>
    <path d="M90 54 q12 2 11 20 q-1 17 -12 21 q-7 -3 -5 -12 q8 -12 6 -29 z" fill="#8E939B"/>
    <circle cx="26" cy="70" r="7" fill="#8E939B"/><circle cx="24" cy="84" r="6.4" fill="#8E939B"/>
    <circle cx="94" cy="70" r="7" fill="#8E939B"/><circle cx="96" cy="84" r="6.4" fill="#8E939B"/>
    <ellipse cx="60" cy="66" rx="27" ry="26" fill="#A8ADB5"/>
    <circle cx="44" cy="40" r="11" fill="#9DA2AA"/><circle cx="60" cy="34" r="12.5" fill="#9DA2AA"/>
    <circle cx="76" cy="40" r="11" fill="#9DA2AA"/><circle cx="52" cy="32" r="8.5" fill="#B0B5BC"/>
    <circle cx="70" cy="33" r="8" fill="#B0B5BC"/>
    <ellipse cx="60" cy="82" rx="13" ry="13" fill="#B7BCC3"/>
    ${_eye(50,60,4)} ${_eye(70,60,4)}
    ${_nose(60,77,4.8)}
    <path d="M55 87 q5 4 10 0" stroke="#7B8189" stroke-width="1.9" fill="none" stroke-linecap="round"/>
    ${_collar(c)}`
};

/* 피규어 사진이 있는 일간 (img/dogs/*.webp)
   없는 일간은 아래 SVG 캐릭터로 자동 대체된다. */
const DOG_PHOTO = {갑:"gap", 을:"eul", 병:"byeong", 정:"jeong", 무:"mu",
                   기:"gi", 경:"gyeong", 신:"sin", 임:"im", 계:"gye"};

/* 견종 캐릭터 — 사진이 있으면 사진, 없으면 SVG */
function dogArt(gan, size){
  const s = size || 120;
  const breed = (typeof DOG !== "undefined" && DOG[gan]) ? DOG[gan].breed : "";
  const f = DOG_PHOTO[gan];
  if(!f) return dogSvg(gan, s);
  const oh = GAN_OH[GAN.indexOf(gan)];
  return `<span class="dogfig" style="width:${s}px;height:${s}px">
    <img src="img/dogs/${f}.webp" width="${s}" height="${s}" loading="lazy"
      alt="${breed} 피규어" title="${breed}"
      onerror="this.parentNode.outerHTML=dogSvg('${gan}',${s})">
    <span class="dogring oh-bd-${oh}"></span></span>`;
}

/* 견종 캐릭터 SVG 생성 (대체용) */
function dogSvg(gan, size){
  const oh = GAN_OH[GAN.indexOf(gan)];
  const c  = OH_HEX[oh] || "#6E747E";
  const art = DOG_ART[gan];
  const s = size || 120;
  const breed = (typeof DOG !== "undefined" && DOG[gan]) ? DOG[gan].breed : "";
  return `<svg viewBox="0 0 120 120" width="${s}" height="${s}" class="dogsvg"
    role="img" aria-label="${breed} 캐릭터">
    <ellipse cx="60" cy="112" rx="30" ry="5" fill="#000" opacity=".07"/>
    ${art(c)}
  </svg>`;
}

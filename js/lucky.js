/* ============================================================
   럭키 가이드 — 오늘의 일진 × 내 사주 → GO / STOP
   ------------------------------------------------------------
   판정은 LLM 추론이 아니라 생극제화 규칙에서 결정론적으로 도출한다.
   같은 사람 · 같은 날 · 같은 고민이면 언제나 같은 답이 나온다.
   출력 스키마는 지정된 JSON 형식을 그대로 따른다.
     { decision, decision_label, saju_reason, action_tip, lucky_item }
   ============================================================ */

/* 오행별 행운 요소 */
const LUCKY = {
  목:{color:"초록색", item:["작은 화분","초록색 노트","민트색 소품"],
      food:["샐러드","녹차","제철 나물"], act:["아침에 5분 산책","새 플레이리스트 만들기"]},
  화:{color:"빨강·주황", item:["빨간 립스틱이나 넥타이","주황색 볼펜","포인트 양말"],
      food:["따뜻한 아메리카노","매콤한 점심","군고구마"], act:["창가 자리 앉기","한 명에게 먼저 인사하기"]},
  토:{color:"노랑·베이지", item:["도자기 머그","베이지 가방","나무 소재 소품"],
      food:["단호박 수프","누룽지","꿀 넣은 차"], act:["책상 한 칸 정리","점심 후 10분 앉아 쉬기"]},
  금:{color:"흰색·실버", item:["은색 액세서리","흰 셔츠","금속 펜"],
      food:["아이스 아메리카노","배·도라지차","흰살 생선"], act:["안 쓰는 파일 지우기","알림 30분 끄기"]},
  수:{color:"검정·네이비", item:["네이비 머플러","검정 노트","유리컵"],
      food:["물 자주 마시기","해물 요리","시원한 보리차"], act:["조용한 카페 30분","자기 전 폰 멀리 두기"]}
};

/* 고민 분야 */
const CATEGORIES = [
  {k:"일",     emo:"💼", ph:"오늘 연차 쓸까? / 이 제안 지금 보낼까?"},
  {k:"연애",   emo:"💗", ph:"오늘 그 사람한테 선톡할까?"},
  {k:"돈",     emo:"💰", ph:"오늘 이거 매수해도 될까?"},
  {k:"소비",   emo:"🛒", ph:"장바구니에 담아둔 거 결제할까?"},
  {k:"인간관계",emo:"🤝", ph:"오늘 그 모임 나갈까?"},
  {k:"건강",   emo:"🌿", ph:"오늘 와인 한 잔 할까?"}
];

/* 분야별 십성 가중치 */
const CAT_W = {
  일:      {정관:12, 편관:8,  식신:10, 정인:6,  상관:-12, 겁재:-8},
  연애:    {정재:10, 편재:8,  정관:10, 식신:8,  편관:-6,  겁재:-10, 편인:-6},
  돈:      {정재:14, 편재:10, 식신:8,  겁재:-16, 비견:-8, 편인:-6},
  소비:    {정인:10, 정관:8,  비견:4,  편재:-14, 겁재:-14, 상관:-8},
  인간관계:{비견:10, 식신:10, 정재:6,  정인:6,  상관:-12, 겁재:-10},
  건강:    {식신:12, 정인:12, 정관:4,  편관:-14, 겁재:-10, 상관:-8, 편인:-6}
};

/* 분야별 문장 재료 */
const CAT_TXT = {
  일: {
    go:["오늘은 결재판 들고 가면 통과될 기운이에요.","일 얘기를 꺼내기 딱 좋은 날입니다.","오늘 던진 제안이 생각보다 멀리 갑니다."],
    stop:["오늘은 조용히 자기 자리 지키는 게 이득입니다.","말보다 저장 버튼이 필요한 날이에요.","내일 같은 말을 하면 반응이 달라질 겁니다."],
    tipGo:["결론부터 말하세요. 오늘은 짧을수록 잘 통합니다.","오전에 처리하세요. 늦어질수록 힘이 빠집니다."],
    tipStop:["보내기 전에 한 번만 다시 읽으세요.","오늘 하고 싶은 말은 메모에 적어두고 내일 꺼내세요."]},
  연애: {
    go:["먼저 연락해도 어색하지 않은 날입니다.","오늘은 용기 낸 쪽이 예쁘게 보입니다.","가볍게 던진 한마디가 잘 붙는 날이에요."],
    stop:["오늘은 읽씹당해도 서운해할 기운이 아닙니다.","마음이 앞서서 말이 길어질 수 있는 날이에요.","오늘 참으면 내일 훨씬 자연스러워집니다."],
    tipGo:["길게 쓰지 마세요. 한 줄이면 충분합니다.","안부보다 구체적인 얘기가 잘 통합니다."],
    tipStop:["보낼 말을 써두기만 하고 전송은 미루세요.","오늘은 답장 속도에 의미를 두지 마세요."]},
  돈: {
    go:["숫자를 차분히 볼 수 있는 날입니다.","오늘은 계산이 잘 맞아떨어집니다.","작게 시작하기엔 나쁘지 않은 날이에요."],
    stop:["오늘은 지갑이 얇아지기 쉬운 기운입니다.","확신이 드는 그 느낌이 오늘은 좀 위험합니다.","급하게 결정하면 수수료만 남습니다."],
    tipGo:["한도를 먼저 정하고 시작하세요.","오늘 정한 기준은 오늘 안에 적어두세요."],
    tipStop:["창을 닫고 하루만 두세요. 내일도 있습니다.","누가 추천한 거면 오늘은 특히 미루세요."]},
  소비: {
    go:["필요한 걸 제값에 사는 날입니다.","오늘 산 물건은 오래 잘 씁니다.","고민하던 그거, 오늘은 후회 안 합니다."],
    stop:["오늘은 지름신이 근무 중입니다.","장바구니가 유난히 예뻐 보이는 날이에요.","할인율에 마음이 흔들리기 쉬운 날입니다."],
    tipGo:["살 거 하나만 정하고 들어가세요.","리뷰는 최근 것 세 개만 보면 충분합니다."],
    tipStop:["장바구니에 그대로 두고 하루만 지나 보세요.","결제 직전에 총액을 소리 내어 읽어보세요."]},
  인간관계: {
    go:["사람 만나기 좋은 날입니다.","오늘은 웃는 얼굴이 잘 먹힙니다.","오랜만에 연락해도 반갑게 받아줄 기운이에요."],
    stop:["오늘은 말이 한 끗 어긋나기 쉬운 날입니다.","가만히 있어도 오해가 붙을 수 있어요.","오늘의 모임은 체력만 쓰고 끝날 수 있습니다."],
    tipGo:["먼저 안부를 물으세요. 오늘은 그게 제일 잘 통합니다.","계산할 일 있으면 먼저 나서보세요."],
    tipStop:["단톡방에서 오늘은 읽기만 하세요.","하고 싶은 조언은 삼일만 묵혀두세요."]},
  건강: {
    go:["몸이 무리 없이 받아주는 날입니다.","컨디션 흐름이 나쁘지 않은 날이에요.","오늘은 여유롭게 즐겨도 뒤탈이 적은 날입니다."],
    stop:["오늘은 몸이 평소만큼 받아주지 않습니다.","한 잔이 두 잔 되기 쉬운 날이에요.","내일 아침이 유난히 무겁게 느껴질 수 있는 날입니다."],
    tipGo:["사이사이 물을 마시면 훨씬 편합니다.","좋아하는 걸로 한 잔만, 천천히 드세요."],
    tipStop:["오늘은 따뜻한 차로 바꿔보세요. 내일 아침이 가볍습니다.","꼭 드시겠다면 딱 한 잔에서 멈추기로 미리 정해두세요."]}
};

/* 질문 키워드 → 분야 자동 추정 */
const KEYWORD = [
  {c:"일",     w:["연차","휴가","퇴사","이직","보고","회의","제안","면접","발표","계약","상사","야근","지원","이력서"]},
  {c:"연애",   w:["선톡","고백","연락","소개팅","데이트","썸","만나자","답장","프로포즈","헤어","재회"]},
  {c:"돈",     w:["매수","매도","투자","주식","코인","적금","대출","환전","청약","펀드"]},
  {c:"소비",   w:["살까","결제","지름","장바구니","구매","주문","할부","세일","할인"]},
  {c:"건강",   w:["술을","술마","술먹","술한","와인","맥주","소주","위스키","막걸리","한잔","음주","야식","운동","헬스","러닝","다이어트","밤새","밤샘","금주","해장"]},
  {c:"인간관계",w:["모임","약속","연락처","친구","동창","가족","술자리","회식","경조사","부탁","만날까","놀까"]}
];
function guessCategory(q){
  if(!q) return null;
  const t = q.replace(/\s/g,"");
  for(const {c,w} of KEYWORD) if(w.some(k=>t.includes(k))) return c;
  return null;
}

/* 날짜 → 일진 */
function ganjiOfDate(y,m,d){
  const i = ((jdn(y,m,d)+49)%60+60)%60;
  return {idx:i, gan:GAN[i%10], ji:JI[i%12], ko:gz(i), hj:gzH(i)};
}

/* 결정론적 난수 (같은 입력 → 같은 문장) */
function pick(arr, seed){
  let h=0; const s=String(seed);
  for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))>>>0;
  return arr[h%arr.length];
}

/* ---------- 점수 산출 (일진 인덱스 기준) ---------- */
function _luckyScore(r, cat, tIdx, ctx){
  const T = {gan:GAN[tIdx%10], ji:JI[tIdx%12]};
  const tJiIdx = tIdx%12;
  const dGan = r.dGan;
  const sip   = sipseong(dGan, T.gan);
  const jiSip = sipseong(dGan, JI_BONGI[tJiIdx]);
  const {strong, helpful, heavy, dj, minV, maxV} = ctx;

  let score = 50; const why = []; let rel = null;
  const add = (v,t)=>{ score += v; if(t) why.push({s:v, t}); };

  if(helpful.includes(sip)) add(16, strong
      ? `오늘 들어오는 ${josa(sip,"이","가")} 넘치는 기운을 밖으로 빼줍니다.`
      : `오늘 들어오는 ${josa(sip,"이","가")} 부족한 힘을 채워줍니다.`);
  else if(heavy.includes(sip)) add(-16, strong
      ? `오늘의 ${josa(sip,"은","는")} 이미 강한 쪽에 더 얹는 기운입니다.`
      : `오늘의 ${josa(sip,"은","는")} 안 그래도 바쁜 사람을 더 쓰게 만듭니다.`);
  if(helpful.includes(jiSip)) add(8);
  else if(heavy.includes(jiSip)) add(-8);

  if(YUKHAP.some(p=>(p[0]===dj&&p[1]===tJiIdx)||(p[1]===dj&&p[0]===tJiIdx))){
    rel="합"; add(16, `오늘 지지 ${T.ji}가 내 일지 ${JI[dj]}와 합(合)을 이룹니다. 일이 매끄럽게 붙는 날이에요.`); }
  else if(SAMHAP.some(g=>g.includes(dj)&&g.includes(tJiIdx)&&dj!==tJiIdx)){
    rel="삼합"; add(12, `오늘 지지가 내 일지와 삼합(三合)으로 묶입니다. 함께 하는 일이 잘 굴러갑니다.`); }
  else if(CHUNG.some(p=>(p[0]===dj&&p[1]===tJiIdx)||(p[1]===dj&&p[0]===tJiIdx))){
    rel="충"; add(-18, `오늘 지지 ${T.ji}가 내 일지 ${JI[dj]}를 정면으로 칩니다(沖). 평소보다 덜컹거리는 날입니다.`); }
  else if(dj===tJiIdx){ rel="같음"; add(4); }

  const tOh = [...new Set([GAN_OH[GAN.indexOf(T.gan)], JI_OH[tJiIdx]])];
  const fills = tOh.filter(k=>r.oh[k]===minV && minV<maxV);
  const piles = tOh.filter(k=>r.oh[k]===maxV && minV<maxV);
  if(fills.length) add(10, `평소 부족한 ${fills.join("·")} 기운이 오늘 들어옵니다.`);
  else if(piles.length===2) add(-10, `이미 많은 ${piles[0]} 기운이 오늘 더 얹힙니다.`);

  const W = CAT_W[cat] || {};
  const cw = (W[sip]||0) + Math.round((W[jiSip]||0)*0.5);
  if(cw) add(cw, cw>0 ? `${cat} 문제에는 오늘의 ${sip}이 유리하게 작용합니다.`
                      : `${cat} 문제에서는 오늘의 ${sip}이 발목을 잡기 쉽습니다.`);

  return {score, why, rel, sip, jiSip};
}

/* ---------- 메인 ---------- */
function luckyGuide(r, category, question, dateObj){
  const D = dateObj || new Date();
  const y=D.getFullYear(), m=D.getMonth()+1, d=D.getDate();
  const T = ganjiOfDate(y,m,d);
  const cat = category || "일";

  const dGan = r.dGan;
  const gise = getGise(r);
  const strong = gise.cnt >= 2;
  const ctx = {
    strong,
    helpful: strong ? ["식신","상관","편재","정재","정관","편관"] : ["편인","정인","비견","겁재"],
    heavy:   strong ? ["편인","정인","비견","겁재"] : ["식신","상관","편재","정재","정관","편관"],
    dj: r.dayJi,
    minV: Math.min(...OH_LIST.map(k=>r.oh[k])),
    maxV: Math.max(...OH_LIST.map(k=>r.oh[k]))
  };

  // 일진은 60일 주기이므로 60갑자 전체가 곧 완전한 분포다.
  // 그 중앙값을 기준으로 삼아 GO/STOP이 한쪽으로 쏠리지 않게 한다.
  const all = [];
  for(let i=0;i<60;i++) all.push(_luckyScore(r, cat, i, ctx).score);
  const sorted = all.slice().sort((a,b)=>a-b);
  const median = (sorted[29]+sorted[30])/2;

  const cur = _luckyScore(r, cat, T.idx, ctx);
  const go = cur.score >= median;
  const rank = all.filter(v=>v < cur.score).length;      // 60일 중 몇 번째로 좋은 날인지
  const pct = Math.round(rank/59*100);

  // 행운 요소 — 나에게 유리한 오행
  const dOh = GAN_OH[GAN.indexOf(dGan)];
  const luckOh = strong ? SAENG[dOh] : OH_LIST.find(k=>SAENG[k]===dOh);
  const L = LUCKY[luckOh];
  const seed = `${r.nameKo||""}${y}${m}${d}${cat}`;
  const luckyItem = `${L.color} ${pick(L.item,seed)} · ${pick(L.food,seed+"f")}`;

  const txt = CAT_TXT[cat] || CAT_TXT.일;
  const head = pick(go?txt.go:txt.stop, seed+"h");
  const tip  = pick(go?txt.tipGo:txt.tipStop, seed+"t");
  const side = cur.why.filter(w => go ? w.s > 0 : w.s < 0)
                      .sort((a,b)=> go ? b.s-a.s : a.s-b.s);
  const lead = side.length ? side[0].t
    : `일진이 내 사주와 크게 부딪히지도, 특별히 밀어주지도 않는 무난한 날입니다.`;
  const reason = `오늘은 ${T.ko}(${T.hj})일. ${lead} ${head}`;

  return {
    decision: go ? "GO" : "STOP",
    decision_label: go ? "오늘 하면 딱 좋아요!" : "오늘은 잠시 접어두세요!",
    saju_reason: reason,
    action_tip: tip,
    lucky_item: luckyItem,
    _meta:{
      date:`${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`,
      today:T, score:cur.score, median, pct, category:cat, question:question||"",
      sip:cur.sip, jiSip:cur.jiSip, rel:cur.rel, strong, luckOh,
      why:cur.why.map(w=>w.t), luckyAct:pick(L.act,seed+"a")
    }
  };
}

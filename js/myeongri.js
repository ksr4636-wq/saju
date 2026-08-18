/* ============================================================
   고전 명리 분석 엔진
   ------------------------------------------------------------
   근거 체계
     - 격국(格局)·순용역용   : 《자평진전》 체계
     - 조후(調候)·한난조습   : 《궁통보감》 체계
     - 기세(氣勢)·통관       : 《적천수》 체계
   모든 판정은 생극제화(生剋制化) 논리로만 도출하며,
   신살(神煞)은 길흉 판단 근거로 사용하지 않는다.
   ============================================================ */

/* ---------- 지장간 (월률분야) ---------- */
/* 여기(餘氣) · 중기(中氣) · 정기(正氣) 순 */
const JIJANGGAN = [
  {yeogi:"임", junggi:null, jeonggi:"계"},  // 자
  {yeogi:"계", junggi:"신",  jeonggi:"기"},  // 축
  {yeogi:"무", junggi:"병",  jeonggi:"갑"},  // 인
  {yeogi:"갑", junggi:null, jeonggi:"을"},  // 묘
  {yeogi:"을", junggi:"계",  jeonggi:"무"},  // 진
  {yeogi:"무", junggi:"경",  jeonggi:"병"},  // 사
  {yeogi:"병", junggi:"기",  jeonggi:"정"},  // 오
  {yeogi:"정", junggi:"을",  jeonggi:"기"},  // 미
  {yeogi:"무", junggi:"임",  jeonggi:"경"},  // 신
  {yeogi:"경", junggi:null, jeonggi:"신"},  // 유
  {yeogi:"신", junggi:"정",  jeonggi:"무"},  // 술
  {yeogi:"무", junggi:"갑",  jeonggi:"임"}   // 해
];

/* 건록(建祿) — 일간의 12운성 록지 */
const GEONROK = {갑:2, 을:3, 병:5, 정:6, 무:5, 기:6, 경:8, 신:9, 임:11, 계:0};
/* 양인(羊刃) — 양간에만 성립 (음간 양인은 유파에 따라 다름) */
const YANGIN  = {갑:3, 병:6, 무:6, 경:9, 임:0};

/* 사길신 / 사흉신 (자평진전 순용·역용) */
const GILSIN  = ["정관","정재","편재","정인","식신"];
const HYUNGSIN= ["편관","상관","편인","겁재"];

/* ---------- 격국 판정 ---------- */
function getGyeok(r){
  const dGan = r.dGan, mJi = r.mJi;
  const hid = JIJANGGAN[mJi];
  const stems = [r.pillars[0].gan, r.pillars[1].gan, r.pillars[3].gan]; // 일간 제외
  const note = [];

  // 1) 건록격 / 양인격 우선 판정
  if (GEONROK[dGan] === mJi)
    return {name:"건록격", type:"록겁", ju:null, via:"월지가 일간의 록(祿) 자리",
      cls:"중립", hidden:hid,
      desc:"월령이 일간 자신의 자리입니다. 격을 남에게서 빌리지 않고 스스로 서는 구조라, 밖에서 취할 것(재성·관성)이 어디에 놓였는지가 성패를 가릅니다."};
  if (YANGIN[dGan] === mJi)
    return {name:"양인격", type:"록겁", ju:null, via:"월지가 일간의 양인(羊刃) 자리",
      cls:"흉신", hidden:hid,
      desc:"일간의 기세가 월령에서 극도로 왕성한 구조입니다. 넘치는 힘을 관성(官殺)으로 다스리거나 식상으로 흘려보낼 때 큰 그릇이 됩니다."};

  // 2) 투간(透干) 확인 — 정기 > 중기 > 여기 순
  let tu = null, via = null;
  for (const [k,label] of [["jeonggi","정기(正氣)"],["junggi","중기(中氣)"],["yeogi","여기(餘氣)"]]) {
    const h = hid[k];
    if (h && stems.includes(h)) { tu = h; via = `월지 ${JI[mJi]}의 ${label} ${josa(h,"이","가")} 천간에 투출`; break; }
  }
  let gyeom = null;
  if (!tu) { tu = hid.jeonggi; via = `천간에 투출한 지장간이 없어 월지 ${JI[mJi]}의 정기 ${josa(tu,"으로","로")} 격을 정함`; }
  else if (tu !== hid.jeonggi) {
    // 정기가 투출하지 않고 중기·여기가 투출한 경우 — 월령 정기격을 겸격으로 병기
    gyeom = sipseong(dGan, hid.jeonggi);
    // 음간은 양인이 성립하지 않으므로 겁재 겸격은 월겁(月劫)으로 표기한다
    if(gyeom==="겁재" && YANGIN[dGan]!==mJi) gyeom="월겁";
  }

  const sip = sipseong(dGan, tu);
  const cls = GILSIN.includes(sip) ? "길신" : (HYUNGSIN.includes(sip) ? "흉신" : "중립");
  const NAME = {정관:"정관격", 편관:"편관격(칠살격)", 정재:"정재격", 편재:"편재격",
                정인:"정인격", 편인:"편인격", 식신:"식신격", 상관:"상관격",
                비견:"건록격", 겁재:"양인격", 월겁:"월겁격(月劫格)"};
  return {name:NAME[sip]||sip+"격", type:sip, ju:tu, via, cls, hidden:hid, gyeom,
          gyeomName: gyeom ? (NAME[gyeom]||gyeom+"격") : null,
          desc:GYEOK_DESC[sip] || ""};
}

const GYEOK_DESC = {
  정관:"질서와 책임을 통해 자신을 세우는 구조입니다. 제도·조직·규범 안에서 능력이 가장 잘 드러나며, 절차를 지키는 것이 곧 경쟁력이 됩니다.",
  편관:"압력을 감당하며 돌파하는 구조입니다. 안정된 환경보다 난이도가 높은 과제에서 진가가 나오며, 그 힘을 다스릴 장치가 있어야 소모되지 않습니다.",
  정재:"성실한 축적으로 결과를 만드는 구조입니다. 정확한 계산과 신뢰가 자산이 되며, 급한 확장보다 꾸준한 관리가 어울립니다.",
  편재:"흐름을 읽고 판을 운용하는 구조입니다. 활동 반경과 관계망이 곧 자원이며, 벌린 것을 거두는 체계를 함께 갖출 때 완성됩니다.",
  정인:"배움과 명분으로 자신을 지탱하는 구조입니다. 자격·문서·전문성이 기반이 되며, 축적한 것을 밖으로 내보내는 통로가 필요합니다.",
  편인:"독자적인 사유로 깊이를 만드는 구조입니다. 남이 가지 않는 영역에서 강하며, 사유가 실행으로 전환되는 지점을 스스로 설계해야 합니다.",
  식신:"꾸준한 생산으로 자신을 표현하는 구조입니다. 만들어내는 과정 자체가 안정의 근거가 되며, 결과물이 재화로 이어질 때 순환이 완성됩니다.",
  상관:"기존의 틀을 다시 짜는 재능의 구조입니다. 통찰과 표현이 무기이며, 그 예리함이 어디를 향하는지에 따라 평가가 크게 갈립니다.",
  비견:"자립으로 서는 구조입니다.", 겁재:"경쟁 속에서 힘을 내는 구조입니다."
};

/* ---------- 성격(成格)·파격(破格) 판정 ---------- */
function getSeonggyeok(r, gyeok){
  const dGan=r.dGan;
  // 천간에 드러난 것과 지지에만 잠긴 것을 구분한다.
  // 천간 투출은 작용력이 크고, 지지 암장은 잠재적 작용으로 본다.
  const openSet = new Set(), hidSet = new Set();
  r.pillars.forEach(p=>{ if(p.ganSip!=="일원") openSet.add(p.ganSip); hidSet.add(p.jiSip); });
  const has     = k => openSet.has(k) || hidSet.has(k);
  const open    = k => openSet.has(k);
  const hidOnly = k => !openSet.has(k) && hidSet.has(k);
  const hasAny  = arr => arr.some(has);
  const openAny = arr => arr.some(open);
  const W = k => open(k) ? "" : " (천간에 드러나지 않고 지지에 잠겨 있어 작용은 완만합니다)";

  const g = gyeok.type;
  const R = {ok:[], risk:[], rule:""};

  switch(g){
    case "정관":
      R.rule = "정관은 사길신이므로 순용(順用)한다 — 재성으로 생하고 인성으로 보호하며, 상관의 극을 피한다.";
      if(hasAny(["정재","편재"])) R.ok.push("재성이 있어 관을 생합니다(財生官). 실질이 뒷받침된 명예입니다.");
      if(hasAny(["정인","편인"])) R.ok.push("인성이 있어 관을 받아 나에게 전합니다(官印相生). 자리가 곧 성장으로 이어집니다.");
      if(open("상관")) R.risk.push("상관이 천간에 드러나 정관을 극합니다(傷官見官). 옳은 말이 규범과 충돌하는 자리로, 표현의 수위 조절이 성패를 가릅니다.");
      break;
    case "편관":
      R.rule = "칠살은 사흉신이므로 역용(逆用)한다 — 식신으로 제(制)하거나 인성으로 화(化)한다.";
      if(has("식신")) R.ok.push("식신이 칠살을 제어합니다(食神制殺). 압박을 생산으로 바꾸는 가장 안정된 구조입니다.");
      if(hasAny(["정인","편인"])) R.ok.push("인성이 칠살의 기운을 돌려 나를 돕습니다(殺印相生). 위기가 곧 배움이 됩니다.");
      if(has("겁재")) R.ok.push(gyeok.name==="양인격"
        ? "양인이 칠살과 맞서 균형을 잡습니다(羊刃合殺)."
        : "겁재가 칠살의 압력을 함께 받아내 부담을 나눕니다.");
      if(hasAny(["정재","편재"]) && !has("식신") && !hasAny(["정인","편인"]))
        R.risk.push("재성이 칠살을 더 생하는데(財生殺) 제어할 식신·인성이 약합니다. 일을 벌일수록 부담이 커지는 구조이니 감당 범위를 정해두는 편이 좋습니다.");
      break;
    case "정재": case "편재":
      R.rule = "재성은 사길신이므로 순용한다 — 식상으로 생하고 관성으로 지키며, 비겁의 탈취를 막는다.";
      if(hasAny(["식신","상관"])) R.ok.push("식상이 재를 생합니다(食傷生財). 만들어낸 것이 재화로 이어지는 순환입니다.");
      if(hasAny(["정관","편관"])) R.ok.push("관성이 비겁을 눌러 재를 지킵니다. 제도와 계약이 자산을 보호합니다.");
      if(hasAny(["비견","겁재"]) && !hasAny(["정관","편관"]))
        R.risk.push("비겁이 재를 나눠 가지는데(比劫奪財) 이를 제어할 관성이 약합니다. 공동 사업과 보증에서 특히 경계가 필요합니다.");
      break;
    case "정인": case "편인":
      R.rule = "인수는 사길신이므로 순용한다 — 관살로 생하고, 신강하면 식상·재로 흘려보낸다. 재성이 인수를 깨는 것을 경계한다.";
      if(hasAny(["정관","편관"])) R.ok.push("관살이 인수를 생합니다(官印相生). 책임을 맡을수록 실력이 쌓이는 구조입니다.");
      if(hasAny(["식신","상관"])) R.ok.push("식상이 있어 쌓은 것을 밖으로 내보낼 통로가 있습니다.");
      if(openAny(["정재","편재"])) R.risk.push("재성이 인수를 극합니다(財剋印). 눈앞의 이익을 좇을 때 기반이 흔들릴 수 있어, 배움과 실리의 우선순위를 분명히 해야 합니다.");
      break;
    case "식신":
      R.rule = "식신은 사길신이므로 순용한다 — 재성으로 흐르게 하고, 편인이 이를 빼앗는 것을 경계한다.";
      if(hasAny(["정재","편재"])) R.ok.push("식신이 재로 흐릅니다(食神生財). 생산이 곧 수익이 되는 구조입니다.");
      if(has("편관")) R.ok.push("식신이 칠살을 제어합니다(食神制殺). 압박을 감당할 장치가 마련되어 있습니다.");
      if(open("편인")) R.risk.push("편인이 식신을 극합니다(梟神奪食). 생각이 많아져 산출이 줄어드는 흐름이니, 준비와 실행의 비율을 의식적으로 관리해야 합니다.");
      break;
    case "상관":
      R.rule = "상관은 사흉신이므로 역용한다 — 재성으로 흘려보내거나(傷官生財) 인성으로 제어한다(傷官佩印).";
      if(hasAny(["정재","편재"])) R.ok.push("상관이 재로 흐릅니다(傷官生財). 재능이 실질적 성과로 전환되는 가장 좋은 통로입니다.");
      if(hasAny(["정인","편인"])) R.ok.push("인성이 상관을 제어합니다(傷官佩印). 예리함에 절제가 더해져 품격이 생깁니다.");
      if(open("정관")) R.risk.push("정관이 천간에 함께 드러나 상관과 충돌합니다(傷官見官). 조직의 규범과 자기 견해가 부딪히는 자리이니, 발언의 시점과 형식을 설계할 필요가 있습니다.");
      else if(hidOnly("정관")) R.note = "정관이 지지에 잠겨 있습니다. 상관견관의 충돌이 겉으로 터지지는 않으나, 규범과 자기 견해 사이의 내적 긴장으로 남는 배치입니다.";
      if(!hasAny(["정재","편재","정인","편인"])) R.risk.push("상관을 받아줄 재성도, 다스릴 인성도 뚜렷하지 않습니다. 재능이 소모로 끝나지 않도록 결과물을 남기는 형식을 정해두는 편이 좋습니다.");
      break;
    case "록겁": default:
      R.rule = "건록·양인은 일간 자신의 자리이므로, 밖에서 취할 재성과 관성이 어디에 놓였는지로 성패를 본다.";
      if(hasAny(["정관","편관"])) R.ok.push("관성이 있어 넘치는 기세를 다스립니다. 책임을 맡을수록 안정됩니다.");
      if(hasAny(["정재","편재"])) R.ok.push("재성이 있어 힘을 쓸 대상이 분명합니다.");
      if(hasAny(["식신","상관"])) R.ok.push("식상이 있어 기운을 흘려보낼 통로가 있습니다.");
      if(!hasAny(["정관","편관","정재","편재","식신","상관"]))
        R.risk.push("기세는 강한데 이를 쓸 재성·관성·식상이 뚜렷하지 않습니다. 힘의 출구를 스스로 만들어야 하는 구조입니다.");
      break;
  }
  R.state = R.ok.length && !R.risk.length ? "성격(成格)에 가까움"
          : (R.ok.length && R.risk.length ? "성격 요소와 파격 요소가 함께 있음"
          : (R.risk.length ? "파격(破格) 요소가 두드러짐" : "보조 요소가 뚜렷하지 않음"));
  return R;
}

/* ---------- 기세(적천수) — 득령·득지·득세 ---------- */
function getGise(r){
  const dGan=r.dGan, dOh=GAN_OH[GAN.indexOf(dGan)];
  const helps = oh => oh===dOh || SAENG[oh]===dOh;   // 같은 오행이거나 나를 생하는 오행

  const mOh = JI_OH[r.mJi];
  const deukRyeong = helps(mOh);
  const dayJiOh = JI_OH[r.dayJi];
  const deukJi = helps(dayJiOh);

  let sup=0, tot=0;
  r.pillars.forEach((p,i)=>{
    if(i!==2){ tot++; if(helps(GAN_OH[GAN.indexOf(p.gan)])) sup++; }
    tot++; if(helps(JI_OH[JI.indexOf(p.ji)])) sup++;
  });
  const deukSe = sup/tot >= 0.5;

  const cnt=[deukRyeong,deukJi,deukSe].filter(Boolean).length;
  let level, desc;
  if(cnt===3 && sup/tot>=0.62){ level="태왕(太旺)"; desc="월령·일지·전체 세력을 모두 얻어 일간의 기세가 대단히 강합니다. 힘을 억누르기보다 쓸 곳으로 흘려보내는 것이 순리입니다."; }
  else if(cnt===3){ level="신강(身强)"; desc="월령·일지·세력의 세 요소를 모두 얻었으나 돕는 기운의 총량이 압도적이지는 않습니다. 강한 편에 속하며, 힘을 받아낼 대상이 있어야 순환이 이루어집니다."; }
  else if(cnt===2){ level="신강(身强)"; desc="세 요소 중 둘을 얻어 일간이 강합니다. 스스로 밀고 나갈 동력은 충분하니, 그 힘을 받아낼 대상이 있어야 합니다."; }
  else if(cnt===1){ level="신약(身弱)"; desc="세 요소 중 하나만 얻어 일간이 약한 편입니다. 벌인 일에 비해 지탱할 힘이 부족해지기 쉬우니, 돕는 기운을 곁에 두는 것이 우선입니다."; }
  else { level="태약(太弱)"; desc="월령·일지·세력 어느 쪽도 얻지 못해 일간이 매우 약합니다. 맞서기보다 대세를 따르는 편이 유리한 구조로 봅니다."; }

  // 통관(通關) — 강하게 대립하는 두 오행 사이를 잇는 오행
  let tonggwan=null;
  const oh=r.oh;
  for(const a of OH_LIST){
    const b=GEUK[a];
    if(oh[a]>=2 && oh[b]>=2){
      const mid=SAENG[a];                       // a가 생하고, mid가 b를 생하는 오행
      if(SAENG[mid]===b) tonggwan={a,b,mid,have:oh[mid]};
    }
  }
  return {deukRyeong, deukJi, deukSe, cnt, level, desc, ratio:sup/tot, tonggwan};
}

/* ---------- 조후(궁통보감) — 한난조습 ---------- */
const SEASON = [
  {ji:[2,3,4],  name:"봄", ch:"목이 왕성한 계절", need:"한기가 남아 있어 병화(丙)의 온기가, 목이 지나치면 경금(庚)의 다듬음이 요긴합니다."},
  {ji:[5,6,7],  name:"여름", ch:"화가 왕성한 계절", need:"조열해지기 쉬워 임계수(壬癸)의 윤택함이 우선입니다. 물이 마르지 않도록 금(金)이 수원을 대주면 더욱 좋습니다."},
  {ji:[8,9,10], name:"가을", ch:"금이 왕성한 계절", need:"금이 날카롭고 건조해지므로 임수(壬)로 씻어내거나 정화(丁)로 단련하는 배치가 요긴합니다."},
  {ji:[11,0,1], name:"겨울", ch:"수가 왕성한 계절", need:"한랭하고 습해 병정화(丙丁)의 온기가 무엇보다 먼저입니다. 온기가 없으면 좋은 배치도 힘을 쓰기 어렵습니다."}
];
function getJohu(r){
  const s = SEASON.find(x=>x.ji.includes(r.mJi));
  const stems = r.pillars.map(p=>p.gan);
  const jis = r.pillars.map(p=>JI.indexOf(p.ji));

  // 한난 지수: 사오미 지지·병정 천간 = 난 / 해자축 지지·임계 천간 = 한
  let warm=0, cold=0;
  jis.forEach(j=>{ if([5,6,7].includes(j)) warm++; if([11,0,1].includes(j)) cold++; });
  stems.forEach(g=>{ if(["병","정"].includes(g)) warm++; if(["임","계"].includes(g)) cold++; });
  // 조습 지수: 미술 = 조 / 축진 = 습
  let dry=0, wet=0;
  jis.forEach(j=>{ if([7,10].includes(j)) dry++; if([1,4].includes(j)) wet++; });

  const hasFire = stems.some(g=>["병","정"].includes(g)) || jis.some(j=>[5,6].includes(j));
  const hasWater= stems.some(g=>["임","계"].includes(g)) || jis.some(j=>[11,0].includes(j));

  let yong=null, met=null, advise="";
  if(s.name==="겨울" || cold-warm>=2){ yong="화(火) — 온기"; met=hasFire;
    advise = met ? "원국에 화가 있어 한기를 풀어줍니다. 조후가 어느 정도 갖추어진 배치입니다."
                 : "원국에 화가 뚜렷하지 않아 한기를 풀 장치가 부족합니다. 따뜻하고 밝은 환경, 낮 시간대의 활동, 사람이 모이는 자리가 실제로 도움이 되는 유형입니다."; }
  else if(s.name==="여름" || warm-cold>=2){ yong="수(水) — 윤택"; met=hasWater;
    advise = met ? "원국에 수가 있어 조열을 식혀줍니다. 조후가 어느 정도 갖추어진 배치입니다."
                 : "원국에 수가 뚜렷하지 않아 열기를 식힐 장치가 부족합니다. 속도를 늦추는 습관, 충분한 휴식과 수분, 조용한 공간이 실제 컨디션을 좌우합니다."; }
  else if(s.name==="가을"){ yong="수(水)로 씻거나 화(火)로 단련"; met=hasWater||hasFire;
    advise = met ? "금기를 다룰 수 또는 화가 원국에 있습니다. 날카로움이 쓰임으로 전환될 여지가 있는 배치입니다."
                 : "금기를 다듬을 수도 화도 뚜렷하지 않습니다. 예리함이 관계에서 마찰로 나타나기 쉬우니 표현의 완충 장치를 두는 편이 좋습니다."; }
  else { yong="화(火)의 온기 또는 금(金)의 절제"; met=hasFire;
    advise = met ? "봄의 기운을 펼칠 온기가 갖추어져 있습니다."
                 : "온기가 부족해 시작한 일이 자라나기까지 시간이 걸립니다. 초반의 더딤을 실패로 읽지 않는 것이 중요합니다."; }

  let balance;
  if(dry-wet>=2) balance="조(燥)한 쪽으로 기울어 있습니다. 여유와 윤기를 만드는 습관이 균형을 잡아줍니다.";
  else if(wet-dry>=2) balance="습(濕)한 쪽으로 기울어 있습니다. 정체되지 않도록 움직임과 환기가 필요합니다.";
  else balance="조습의 균형은 크게 치우치지 않았습니다.";

  return {season:s, yong, met, advise, balance, warm, cold, dry, wet};
}

/* ---------- 억부용신 ---------- */
function getYongsin(r, gise){
  const dOh=GAN_OH[GAN.indexOf(r.dGan)];
  if(gise.cnt>=2){
    return {type:"억부(抑扶)", pick:[SAENG[dOh], GEUK[dOh], OH_LIST.find(k=>GEUK[k]===dOh)],
      label:"식상 · 재성 · 관성",
      desc:`일간이 강하므로 힘을 덜어내는 쪽을 씁니다. 만들어 내보내는 일(식상 ${SAENG[dOh]}), 대상을 다루는 일(재성 ${GEUK[dOh]}), 책임을 지는 일(관성 ${OH_LIST.find(k=>GEUK[k]===dOh)})에서 기운이 순환합니다. 억누르기보다 쓸 곳을 만드는 것이 핵심입니다.`};
  }
  return {type:"억부(抑扶)", pick:[OH_LIST.find(k=>SAENG[k]===dOh), dOh],
    label:"인성 · 비겁",
    desc:`일간이 약하므로 돕는 쪽을 씁니다. 배우고 기대는 일(인성 ${OH_LIST.find(k=>SAENG[k]===dOh)}), 동료와 함께하는 일(비겁 ${dOh})이 기반이 됩니다. 혼자 감당하는 구조보다 지지 기반을 먼저 갖추는 편이 유리합니다.`};
}

/* ============================================================
   최종 해석 구성 — 지시서의 4단 구조
   1) 성격과 심리적 기저  2) 사회적 역량과 성취 방향
   3) 환경적 조언        4) 주체적인 삶을 위한 제언
   ============================================================ */
function analyzeClassic(r){
  const gyeok = getGyeok(r);
  const seong = getSeonggyeok(r, gyeok);
  const gise  = getGise(r);
  const johu  = getJohu(r);
  const yong  = getYongsin(r, gise);
  return {gyeok, seong, gise, johu, yong};
}

/* ============================================================
   4단 구조 해설 생성
   ============================================================ */
function classicSections(r){
  const A = analyzeClassic(r);
  const {gyeok, seong, gise, johu, yong} = A;
  const dGan = r.dGan, ig = ILGAN_DESC[dGan];
  const dOh = GAN_OH[GAN.indexOf(dGan)];
  const S = [];

  /* ── 1) 성격과 심리적 기저 ── */
  const b1 = [];
  b1.push(`일간은 <b>${dGan}(${GAN_H[GAN.indexOf(dGan)]})</b>, ${ig.hj} ${ig.img}의 상(象)입니다. ${ig.pos}이 본바탕이며, ${ig.neg}이 이면의 과제로 따릅니다.`);
  b1.push(`기세로 보면 <b>${gise.level}</b>입니다. 득령 ${gise.deukRyeong?"○":"×"} · 득지 ${gise.deukJi?"○":"×"} · 득세 ${gise.deukSe?"○":"×"} — ${gise.desc}`);
  const djSip = r.pillars[2].jiSip;
  b1.push(`일지 <b>${JI[r.dayJi]}(${JI_H[r.dayJi]})</b>는 일간에게 ${djSip}에 해당합니다. 일지는 가장 안쪽의 자리이므로, 겉으로 드러나는 태도보다 <b>${SIP[djSip].lit}</b>의 성향이 내면의 기본값으로 작동한다고 봅니다.`);
  if(gise.tonggwan){
    const t = gise.tonggwan;
    b1.push(t.have>0
      ? `원국에서 ${t.a}과 ${t.b}이 맞서는데 사이를 잇는 ${t.mid}이 있어 기운이 통합니다(通關). 상반된 요구를 중재하는 데 익숙한 심리 구조입니다.`
      : `원국에서 ${t.a}과 ${t.b}이 직접 맞서고 사이를 이을 ${t.mid}이 없습니다. 양립하기 어려운 두 요구 사이에서 긴장이 반복되기 쉬우며, ${t.mid}에 해당하는 역할을 의식적으로 끌어들이는 것이 심리적 안정의 관건입니다.`);
  }
  S.push({t:"1. 성격과 심리적 기저", b:b1});

  /* ── 2) 사회적 역량과 성취 방향 ── */
  const b2 = [];
  b2.push(`격국은 <b>${gyeok.name}</b>입니다. ${gyeok.via}하여 정했습니다.`
    + (gyeok.gyeomName ? ` 월령의 정기로 보면 ${gyeok.gyeomName}을 겸하는 배치입니다.` : ""));
  b2.push(gyeok.desc);
  b2.push(`<span class="hint">${seong.rule}</span>`);
  if(seong.ok.length)   b2.push(`<b>격을 이루는 요소</b><br>${seong.ok.join("<br>")}`);
  if(seong.risk.length) b2.push(`<b>격을 흔드는 요소</b><br>${seong.risk.join("<br>")}`);
  if(seong.note)        b2.push(`<span class="hint">${seong.note}</span>`);
  b2.push(`종합하면 <b>${seong.state}</b>입니다. 격의 성패는 고정된 결과가 아니라, 위 요소들이 대운에서 어떻게 보강되거나 눌리는지에 따라 달라집니다.`);
  b2.push(`억부(抑扶)로 본 쓰임은 <b>${yong.label}</b>입니다. ${yong.desc}`);
  S.push({t:"2. 사회적 역량과 성취 방향", b:b2});

  /* ── 3) 환경적 조언 (조후) ── */
  const b3 = [];
  b3.push(`월지 <b>${JI[r.mJi]}</b>, ${johu.season.name}에 태어났습니다. ${johu.season.ch}이며, ${johu.season.need}`);
  b3.push(`이 원국의 조후용신은 <b>${johu.yong}</b>입니다. ${johu.advise}`);
  b3.push(`한난(寒暖)은 난 ${johu.warm} 대 한 ${johu.cold}, 조습(燥濕)은 조 ${johu.dry} 대 습 ${johu.wet}입니다. ${johu.balance}`);
  b3.push(`<span class="hint">조후는 격국의 우열과 별개로, 그 사람이 어떤 환경에서 편안함을 느끼고 실제로 힘을 내는가를 봅니다. 격이 잘 짜였어도 조후가 어긋나면 성취에 비해 체감하는 만족이 낮아지기 쉽습니다.</span>`);
  S.push({t:"3. 환경적 조언", b:b3});

  /* ── 4) 주체적인 삶을 위한 제언 ── */
  const b4 = [];
  const strong = gise.cnt >= 2;
  b4.push(`<b>능력이 발휘되는 환경</b> — ${
    gyeok.type==="정관" ? "역할과 책임이 문서로 명확한 조직. 절차가 갖추어진 곳일수록 실력이 그대로 평가로 이어집니다."
    : gyeok.type==="편관" ? "난이도가 높고 책임이 무거운 과제. 다만 마감과 권한이 함께 주어져야 소모가 아닌 성장이 됩니다."
    : gyeok.type==="정재" ? "성과가 수치로 축적되는 일. 짧은 승부보다 반복 가능한 구조를 만드는 자리."
    : gyeok.type==="편재" ? "사람과 정보가 오가는 넓은 무대. 다만 회수와 정산의 체계가 함께 있어야 남습니다."
    : gyeok.type==="정인" ? "전문성과 자격이 신뢰의 근거가 되는 영역. 배운 것을 가르치거나 문서로 남기는 자리."
    : gyeok.type==="편인" ? "선례가 적은 영역을 혼자 깊이 파는 일. 실행 시점을 외부에서 정해주는 장치가 있으면 더 좋습니다."
    : gyeok.type==="식신" ? "꾸준히 산출물이 쌓이는 일. 과정 자체가 안정의 근거가 되는 자리."
    : gyeok.type==="상관" ? "기존 방식을 다시 설계하는 일. 다만 평가자가 결과물로 판단해 주는 환경이어야 합니다."
    : "스스로 판을 정하고 책임지는 자리. 다만 힘을 쓸 대상이 분명해야 합니다."}`);
  b4.push(`<b>보완할 점</b> — ${
    seong.risk.length ? "위 '격을 흔드는 요소'가 실제 생활에서 반복되는 마찰의 지점입니다. 이를 성격 결함으로 볼 것이 아니라, 구조상 예측 가능한 리스크로 두고 사전에 장치를 마련하는 편이 효율적입니다."
    : "뚜렷한 파격 요소는 보이지 않습니다. 다만 격을 이루는 요소에 지나치게 기대면 그 하나가 흔들릴 때 전체가 함께 흔들립니다. 대안 경로를 하나 더 두는 것이 안전합니다."}`);
  b4.push(`<b>기운을 쓰는 방향</b> — ${strong
    ? `일간이 강하므로 채우기보다 <b>덜어내는</b> 쪽이 순리입니다. 만들어 내보내고(식상), 대상을 다루고(재성), 책임을 지는(관성) 활동에 시간을 배분할수록 기운이 순환합니다. 쉬는 것보다 쓰는 것이 오히려 안정을 줍니다.`
    : `일간이 약하므로 쓰기보다 <b>채우는</b> 쪽이 먼저입니다. 배우고(인성), 함께할 사람을 두는(비겁) 데 자원을 쓰는 것이 장기적으로 성과를 키웁니다. 혼자 다 감당하는 방식은 이 구조에서 가장 비효율적입니다.`}`);
  if(!johu.met) b4.push(`<b>환경 설계</b> — 조후가 충족되지 않은 배치입니다. ${johu.advise} 이는 성격을 바꾸라는 뜻이 아니라, 물리적 환경과 생활 리듬을 조정하는 것만으로도 체감이 달라진다는 의미입니다.`);
  b4.push(`<span class="hint">여기까지의 내용은 고정된 운명이 아니라 <b>구조적 경향성</b>입니다. 같은 원국이라도 어떤 환경을 선택하고 무엇을 보완하느냐에 따라 실제 삶은 크게 달라집니다. 사주는 결과를 알려주는 도구가 아니라, 자신이 어디에 강하고 어디가 취약한지를 미리 알고 설계에 쓰는 참고 자료입니다.</span>`);
  S.push({t:"4. 주체적인 삶을 위한 제언", b:b4});

  return {sections:S, A};
}

/* ===== 데이터 ===== */
/* 데이터는 js/data.js 에서 window.SAJU_DATA 로 주입 */
const D = window.SAJU_DATA;
const EPOCH_Y = 1900; // 1900-01-01 00:00 UTC 기준 분

/* ===== 상수 ===== */
const GAN  = "갑을병정무기경신임계".split("");
const JI   = "자축인묘진사오미신유술해".split("");
const GAN_H= "甲乙丙丁戊己庚辛壬癸".split("");
const JI_H = "子丑寅卯辰巳午未申酉戌亥".split("");
const GAN_OH = ["목","목","화","화","토","토","금","금","수","수"];
const JI_OH  = ["수","토","목","목","토","화","화","토","금","금","토","수"];
const GAN_YY = ["양","음","양","음","양","음","양","음","양","음"];
const JI_YY  = ["양","음","양","음","양","음","양","음","양","음","양","음"];
const JI_BONGI = ["계","기","갑","을","무","병","정","기","경","신","무","임"];
const JI_ANIMAL= ["쥐","소","호랑이","토끼","용","뱀","말","양","원숭이","닭","개","돼지"];
const OH_LIST = ["목","화","토","금","수"];
const SAENG = {목:"화",화:"토",토:"금",금:"수",수:"목"};
const GEUK  = {목:"토",토:"수",수:"화",화:"금",금:"목"};
const OHODUN  = {갑:"병",기:"병",을:"무",경:"무",병:"경",신:"경",정:"임",임:"임",무:"갑",계:"갑"};
const OSEODUN = {갑:"갑",기:"갑",을:"병",경:"병",병:"무",신:"무",정:"경",임:"경",무:"임",계:"임"};
const JI_NAME = ["자시","축시","인시","묘시","진시","사시","오시","미시","신시","유시","술시","해시"];

/* 지지 관계 */
const YUKHAP = [[0,1],[2,11],[3,10],[4,9],[5,8],[6,7]];              // 육합
const SAMHAP = [[8,0,4],[11,3,7],[2,6,10],[5,9,1]];                  // 삼합(신자진 해묘미 인오술 사유축)
const SAMHAP_OH = ["수","목","화","금"];
const CHUNG  = [[0,6],[1,7],[2,8],[3,9],[4,10],[5,11]];              // 충
const WONJIN = [[0,7],[1,6],[2,9],[3,8],[4,11],[5,10]];              // 원진

/* ===== 유틸 ===== */
function pad(n,w){ return String(n).padStart(w,"0"); }
function gz(i){ i=((i%60)+60)%60; return GAN[i%10]+JI[i%12]; }
function gzH(i){ i=((i%60)+60)%60; return GAN_H[i%10]+JI_H[i%12]; }
function gzIndex(g,j){ const a=GAN.indexOf(g), b=JI.indexOf(j);
  for(let n=0;n<60;n++) if(n%10===a && n%12===b) return n; return -1; }

/* 율리우스적일 */
function jdn(y,m,d){
  let yy=y, mm=m;
  if(mm<=2){ yy-=1; mm+=12; }
  let b=0;
  if(y>1582 || (y===1582 && (m>10 || (m===10 && d>=15)))){
    const a=Math.floor(yy/100); b = 2 - a + Math.floor(a/4);
  }
  return Math.floor(365.25*(yy+4716)) + Math.floor(30.6001*(mm+1)) + d + b - 1524;
}

/* 1900-01-01 UTC 기준 분 <-> 날짜 */
function toMin(y,m,d,h,mi){ return (jdn(y,m,d)-jdn(1900,1,1))*1440 + h*60 + mi; }
function fromMin(min){
  const days = Math.floor(min/1440);
  let rem = min - days*1440;
  const J = jdn(1900,1,1) + days;
  // JDN -> 그레고리력
  let a=J+32044, b=Math.floor((4*a+3)/146097), c=a-Math.floor(146097*b/4);
  let dd=Math.floor((4*c+3)/1461), e=c-Math.floor(1461*dd/4), mm=Math.floor((5*e+2)/153);
  const day=e-Math.floor((153*mm+2)/5)+1;
  const month=mm+3-12*Math.floor(mm/10);
  const year=100*b+dd-4800+Math.floor(mm/10);
  return {y:year,m:month,d:day,h:Math.floor(rem/60),mi:rem%60};
}

/* 표준시: 시계상 시각 -> UTC분 */
function localToUtc(y,m,d,h,mi){
  const naive = toMin(y,m,d,h,mi);
  const tz = D.tz;
  for(let i=tz.length-1;i>=0;i--){
    const off = tz[i][1];
    const utc = naive - off;
    const lo = tz[i][0];
    const hi = (i===tz.length-1) ? Infinity : tz[i+1][0];
    if(utc>=lo && utc<hi) return {utc, off};
  }
  return {utc: naive-540, off:540};
}

/* 균시차(분) - NOAA 알고리즘. 오차 수 초 수준 */
function eqTime(y,m,d,h,mi){
  const rad = Math.PI/180;
  // 율리우스일(소수). jdn은 정오 기준 정수이므로 -0.5 후 시각 가산
  const JD = jdn(y,m,d) - 0.5 + ((h||0)*60+(mi||0))/1440;
  const t  = (JD - 2451545.0)/36525.0;
  const L0 = (280.46646 + t*(36000.76983 + t*0.0003032)) % 360;
  const M  = 357.52911 + t*(35999.05029 - 0.0001537*t);
  const e  = 0.016708634 - t*(0.000042037 + 0.0000001267*t);
  const seconds = 21.448 - t*(46.815 + t*(0.00059 - t*0.001813));
  const e0 = 23 + (26 + seconds/60)/60;
  const omega = 125.04 - 1934.136*t;
  const oc = e0 + 0.00256*Math.cos(omega*rad);
  const y2 = Math.tan(oc*rad/2)**2;
  const E = y2*Math.sin(2*L0*rad) - 2*e*Math.sin(M*rad)
          + 4*e*y2*Math.sin(M*rad)*Math.cos(2*L0*rad)
          - 0.5*y2*y2*Math.sin(4*L0*rad) - 1.25*e*e*Math.sin(2*M*rad);
  return 4*E/rad;
}

/* 절기 탐색 */
function findJeol(utcMin){
  const f = D.flat;
  let lo=0, hi=f.length-1, ans=0;
  if(utcMin < f[0][0]) return {idx:0, ji:f[0][1], t:f[0][0], prev:null};
  while(lo<=hi){ const mid=(lo+hi)>>1;
    if(f[mid][0]<=utcMin){ ans=mid; lo=mid+1; } else hi=mid-1; }
  return {idx:ans, ji:f[ans][1], t:f[ans][0],
          next: (ans+1<f.length)? f[ans+1][0] : null};
}
function sajuYear(utcMin){
  let y=null;
  for(let Y=1900;Y<=2050;Y++){ if(D.ipchun[Y]!==undefined && D.ipchun[Y]<=utcMin) y=Y; else break; }
  return y;
}

/* ===== 사주 산출 ===== */
function computeSaju(o){
  // o: {y,m,d,h,mi,gender,trueSolar,lon}
  const {utc, off} = localToUtc(o.y,o.m,o.d,o.h,o.mi);
  const lon = (o.lon===undefined)?126.978:o.lon;
  let corr = 0;
  if(o.trueSolar) corr = (lon-135)*4 + eqTime(o.y,o.m,o.d,o.h,o.mi);
  // 보정된 '현지 태양시' 시계값 (초 단위 정밀도 유지)
  const localNaive = toMin(o.y,o.m,o.d,o.h,o.mi);
  const effFloat = localNaive + (o.trueSolar ? (corr + (540-off)) : 0);
  const eff = fromMin(Math.floor(effFloat));
  eff.sec = Math.floor((effFloat - Math.floor(effFloat))*60);
  const dayFrac = ((effFloat % 1440) + 1440) % 1440;   // 자정 기준 경과 분(소수)
  // 절기 판정은 실제 순간(UTC) 기준 - 보정 무관
  const J = findJeol(utc);
  const sy = sajuYear(utc);
  if(sy===null) throw new Error("1900~2050년 범위만 지원합니다.");

  const yIdx = ((sy-4)%60+60)%60;
  const yGan = GAN[yIdx%10];
  const mJi = J.ji;
  const inGan = OHODUN[yGan];
  const steps = ((mJi-2)%12+12)%12;
  const mGan = GAN[(GAN.indexOf(inGan)+steps)%10];
  const mIdx = gzIndex(mGan, JI[mJi]);

  // 일주 (야자시설: 일진은 자정에 변경)
  let dRef = {y:eff.y,m:eff.m,d:eff.d};
  if(o.jajaMode==="jeong" && dayFrac>=23*60){
    const nx = fromMin(toMin(eff.y,eff.m,eff.d,eff.h,eff.mi)+60);
    dRef = {y:nx.y,m:nx.m,d:nx.d};
  }
  const dIdx = ((jdn(dRef.y,dRef.m,dRef.d)+49)%60+60)%60;
  const dGan = GAN[dIdx%10];

  // 시주 (소수 정밀도 사용)
  const hf = dayFrac/60;
  const hJi = (hf>=23||hf<1) ? 0 : Math.floor((hf-1)/2)+1;
  // 시진 경계까지 남은 분 (경계 근접 경고용)
  const bStart = (hJi===0) ? 23*60 : (hJi*2-1)*60;
  let toEdge = Math.min(((dayFrac-bStart)%1440+1440)%1440, ((bStart+120-dayFrac)%1440+1440)%1440);
  const hGan = GAN[(GAN.indexOf(OSEODUN[dGan])+hJi)%10];
  const hIdx = gzIndex(hGan, JI[hJi]);

  const pillars = [
    {key:"연주", label:"年", gan:yGan, ji:JI[yIdx%12], idx:yIdx},
    {key:"월주", label:"月", gan:mGan, ji:JI[mJi],     idx:mIdx},
    {key:"일주", label:"日", gan:dGan, ji:JI[dIdx%12], idx:dIdx},
    {key:"시주", label:"時", gan:hGan, ji:JI[hJi],     idx:hIdx},
  ];

  // 오행 집계 (천간4 + 지지4)
  const oh = {목:0,화:0,토:0,금:0,수:0};
  pillars.forEach(p=>{ oh[GAN_OH[GAN.indexOf(p.gan)]]++; oh[JI_OH[JI.indexOf(p.ji)]]++; });

  // 십성
  pillars.forEach(p=>{
    p.ganSip = (p.key==="일주") ? "일원" : sipseong(dGan, p.gan);
    p.jiSip  = sipseong(dGan, JI_BONGI[JI.indexOf(p.ji)]);
  });

  // 대운
  const isYang = GAN.indexOf(yGan)%2===0;
  const forward = (isYang && o.gender==="남") || (!isYang && o.gender==="여");
  let days;
  if(forward) days = (J.next - utc)/1440;
  else        days = (utc - J.t)/1440;
  const daeunNum = Math.max(1, Math.round(days/3));
  const daeun = [];
  for(let k=1;k<=9;k++){
    const i = forward ? (mIdx+k) : (mIdx-k);
    daeun.push({age: daeunNum+(k-1)*10, gz: gz(i), idx:((i%60)+60)%60,
                sip: sipseong(dGan, GAN[(((i%60)+60)%60)%10])});
  }

  return {
    input:o, utcOff:off, corrMin:corr, eff, pillars, oh, dGan,
    sajuYear:sy, forward, daeunNum, daeunDays:days, daeun,
    jeolT:J.t, jeolNext:J.next, hJi, mJi, toEdge, dayFrac,
    dayJi: JI.indexOf(pillars[2].ji), yearJi: yIdx%12
  };
}

function sipseong(dayGan, target){
  const dO=GAN_OH[GAN.indexOf(dayGan)], dY=GAN_YY[GAN.indexOf(dayGan)];
  const tO=GAN_OH[GAN.indexOf(target)], tY=GAN_YY[GAN.indexOf(target)];
  const same = dY===tY;
  if(tO===dO) return same?"비견":"겁재";
  if(SAENG[dO]===tO) return same?"식신":"상관";
  if(GEUK[dO]===tO)  return same?"편재":"정재";
  if(GEUK[tO]===dO)  return same?"편관":"정관";
  if(SAENG[tO]===dO) return same?"편인":"정인";
  return "?";
}

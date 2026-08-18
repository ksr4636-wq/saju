/* ===== 상태 ===== */
let people = [];
let current = null;

async function refreshPeople(){
  try{ people = await DB.list(); }
  catch(e){ people=[]; toast(e.message, true); }
  renderList(); renderPairPickers(); if($("l-who")) renderLuckPickers();
}
function $(id){ return document.getElementById(id); }
function esc(s){ return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }

/* ===== 탭 ===== */
function tab(name){
  ["one","pair","luck"].forEach(t=>{
    $("tab-"+t).setAttribute("aria-selected", String(t===name));
    $("pane-"+t).classList.toggle("hide", t!==name);
  });
  if(name==="pair") renderPairPickers();
  if(name==="luck") renderLuckPickers();
}

/* ===== 입력 읽기 ===== */
function readForm(){
  const y=+$("f-y").value, m=+$("f-m").value, d=+$("f-d").value;
  const h=+$("f-h").value, mi=+$("f-mi").value;
  if(!y||!m||!d) throw new Error("생년월일을 모두 입력하세요.");
  if(y<1900||y>2050) throw new Error("1900~2050년만 지원합니다.");
  if(m<1||m>12) throw new Error("월은 1~12 사이여야 합니다.");
  const dim=new Date(y,m,0).getDate();
  if(d<1||d>dim) throw new Error(`${y}년 ${m}월은 ${dim}일까지입니다.`);
  if(h<0||h>23||mi<0||mi>59) throw new Error("시각을 다시 확인하세요.");
  return {
    nameKo: $("f-nk").value.trim(), nameHj: $("f-nh").value.trim(),
    y,m,d,h,mi, gender:$("f-g").value,
    trueSolar: $("f-ts").checked,
    jajaMode: $("f-jj").value
  };
}

/* ===== 분석 ===== */
function analyze(){
  let f;
  try{ f = readForm(); }
  catch(e){ showErr("one-err", e.message); return; }
  hideErr("one-err");

  const r = computeSaju(f);
  r.nameKo=f.nameKo; r.nameHj=f.nameHj; r.gender=f.gender; r.form=f;
  current = r;
  renderChart(r);
  $("btn-interp").disabled = false;
  $("one-interp").innerHTML = "";
  $("one-result").classList.remove("hide");
  $("one-result").scrollIntoView({behavior:"smooth",block:"nearest"});
}

function pillarCell(p, role){
  const oh = role==="gan" ? GAN_OH[GAN.indexOf(p.gan)] : JI_OH[JI.indexOf(p.ji)];
  const ko = role==="gan" ? p.gan : p.ji;
  const hj = role==="gan" ? GAN_H[GAN.indexOf(p.gan)] : JI_H[JI.indexOf(p.ji)];
  return `<div><span class="glyph oh-${oh}">${hj}<span class="ko">${ko}</span></span></div>`;
}

function renderChart(r){
  const P=r.pillars;
  let h = `<div class="board">
    <div class="rh"></div>${P.map(p=>`<div class="ch">${p.key}<br><span style="font-weight:400;color:var(--ink-4)">${p.label}</span></div>`).join("")}
    <div class="rh">천간</div>${P.map(p=>pillarCell(p,"gan")).join("")}
    <div class="rh">십성</div>${P.map(p=>`<div class="sip">${p.ganSip}</div>`).join("")}
    <div class="rh">지지</div>${P.map(p=>pillarCell(p,"ji")).join("")}
    <div class="rh">십성</div>${P.map(p=>`<div class="sip">${p.jiSip}</div>`).join("")}
  </div>`;

  const e=r.eff, f=r.form;
  h += `<div class="meta">
    <span><b>입력</b> ${f.y}-${pad(f.m,2)}-${pad(f.d,2)} ${pad(f.h,2)}:${pad(f.mi,2)} (시계상)</span>
    <span><b>적용 표준시</b> UTC${(r.utcOff/60>=0?"+":"")}${(r.utcOff/60).toFixed(1)}</span>
    ${f.trueSolar?`<span><b>진태양시 보정</b> ${r.corrMin>=0?"+":""}${r.corrMin.toFixed(1)}분 → ${pad(e.h,2)}:${pad(e.mi,2)}:${pad(e.sec||0,2)}</span>`:`<span><b>진태양시 보정</b> 사용 안 함</span>`}
    <span><b>사주 연도</b> ${r.sajuYear} (입춘 기준)</span>
    <span><b>시진</b> ${JI_NAME[r.hJi]}</span>
  </div>`;

  if(r.utcOff!==540 && r.utcOff!==510)
    h += `<div class="flag">출생 시점에 서머타임이 적용 중이었습니다 (당시 표준시 UTC+${(r.utcOff/60).toFixed(1)}). 시계에 보이던 시각을 그대로 입력하셨다면 이 보정이 이미 반영되었습니다.</div>`;
  else if(r.utcOff===510)
    h += `<div class="flag">출생 시점의 한국 표준시는 동경 127.5도 기준 UTC+08:30이었습니다. 이 차이가 반영되었습니다.</div>`;

  if(r.toEdge < 3)
    h += `<div class="flag bad">보정된 시각이 시진(時辰) 경계에서 ${r.toEdge.toFixed(1)}분 이내입니다. 출생 시각이 몇 분만 달라도 시주가 바뀝니다. 출생 기록을 다시 확인하시기 바랍니다.</div>`;
  const toJeol = Math.min((r.jeolNext-toUtcOf(r))/1440, (toUtcOf(r)-r.jeolT)/1440);
  if(toJeol*1440 < 180)
    h += `<div class="flag bad">절기 절입 시각과 ${(toJeol*1440).toFixed(0)}분 차이입니다. 월주(그리고 입춘이라면 연주)가 바뀔 수 있는 경계입니다. 반드시 재확인하세요.</div>`;

  h += `<div class="card" style="margin-top:18px"><h2>오행 분포</h2>
        <div style="display:flex;gap:26px;flex-wrap:wrap;align-items:center">
        <div style="width:290px">${ohPentagon(r.oh)}</div>
        <div style="flex:1;min-width:250px">${sipBars(r)}</div></div></div>`;

  const curAge = new Date().getFullYear() - r.form.y + 1;
  h += `<div class="card"><h2>대운 — ${r.forward?"순행":"역행"} · ${r.daeunNum}세 시작</h2>
        ${daeunTimeline(r, curAge)}
        <div style="font-size:11.5px;color:var(--ink-3);margin-top:6px">
        절입까지 ${r.daeunDays.toFixed(3)}일 ÷ 3 = ${(r.daeunDays/3).toFixed(2)} → 반올림 ${r.daeunNum}세.
        테두리 표시는 현재 나이(${curAge}세) 구간입니다.</div></div>`;

  $("one-chart").innerHTML = h;
}
function toUtcOf(r){ return localToUtc(r.form.y,r.form.m,r.form.d,r.form.h,r.form.mi).utc; }

/* ===== 해석 ===== */
function sipCards(t){
  let h=`<div class="sipgrid">`;
  SIP_ORDER.forEach(k=>{
    const n=t.cnt[k]||0, S=SIP[k];
    const state = n===0 ? "none" : (n>=3 ? "many" : "have");
    const tag = n===0 ? "없을 때" : (n>=3 ? "많을 때 (3개 이상)" : "있을 때");
    h+=`<div class="sipcard ${n?"":"off"}">
      <div class="hd"><span class="nm">${k}</span><span class="hj2">${S.hj}</span>
        <span class="qty">${n||"없음"}</span></div>
      <div class="lit">${S.lit}</div>
      <p>${S.what}</p>
      <p><span class="tag">${tag}</span><br>${S[state]}</p>
    </div>`;
  });
  return h+`</div>`;
}
function daeunCards(r){
  const cur=new Date().getFullYear()-r.form.y+1;
  let h="";
  r.daeun.forEach(d=>{
    const on = cur>=d.age && cur<d.age+10;
    const oh=GAN_OH[GAN.indexOf(d.gz[0])];
    h+=`<div class="dcard ${on?"now":""}">
      <div class="dh">
        <span class="dg oh-${oh}">${gzH(d.idx)}</span>
        <span><span class="da">${d.age}~${d.age+9}세</span>
          <span class="ds"> · ${d.gz} · ${d.sip}</span></span>
        ${on?`<span class="badge">지금 이 구간</span>`:""}
      </div>
      <div class="db">${daeunNote(r,d).map(x=>`<p>${x}</p>`).join("")}</div>
    </div>`;
  });
  return h;
}
let interpMode = "light";
function setInterpMode(m){ interpMode = m; showInterp(); }

function showInterp(){
  if(!current) return;
  const head = `<div class="card interp"><h2>분석</h2>
    <div class="modetab">
      <button class="${interpMode==="light"?"on":""}" onclick="setInterpMode('light')">라이트 분석</button>
      <button class="${interpMode==="classic"?"on":""}" onclick="setInterpMode('classic')">고전 명리 분석</button>
    </div>`;
  $("one-interp").innerHTML = head + (interpMode==="light" ? renderLight(current) : renderClassic(current)) + `</div>`;
  $("one-interp").scrollIntoView({behavior:"smooth",block:"nearest"});
}

/* ---------- 라이트 ---------- */
function statBars(stats){
  let h = `<div class="stats">`;
  stats.forEach(s=>{
    h += `<div class="stat">
      <span class="sn oh-${s.oh}">${s.name}</span>
      <span class="sbar"><span class="sfill oh-bg-${s.oh}" style="width:${s.v}%"></span></span>
      <span class="sv">${s.v}</span>
      <span class="sd">${s.desc}</span></div>`;
  });
  return h + `</div>`;
}
function renderLight(r){
  const L = lightAnalysis(r);
  const nm = r.nameKo ? esc(r.nameKo) : "이 사주";
  let h = "";

  h += `<div class="hero">
    <div class="hdog">${dogArt(r.dGan, 96)}</div>
    <div class="hbody">
      <div class="htitle">${L.title}</div>
      <div class="hnick">${L.nick}</div>
    </div></div>`;

  h += `<h3>닮은 견종 — ${L.dog.breed}</h3>
    <div class="dogrow">
      <div class="dogpic">${dogArt(r.dGan, 110)}
        <span class="dogtag oh-${GAN_OH[GAN.indexOf(r.dGan)]}">${r.dGan}(${GAN_H[GAN.indexOf(r.dGan)]}) · ${GAN_OH[GAN.indexOf(r.dGan)]}</span></div>
      <div class="dogtxt"><p>${L.dog.why}</p><p class="ex">${L.dog.scene}</p></div>
    </div>`;

  const gkKey = L.A.gyeok.type === "록겁"
      ? (L.A.gyeok.name === "양인격" ? "겁재" : "비견") : L.A.gyeok.type;
  h += `<h3>캐릭터로 치면 — ${L.gk.name}</h3>
    <div class="dogrow">
      <div class="dogpic">${archeArt(gkKey, 110)}
        <span class="dogtag oh-${ARCHE_OH[gkKey]||"금"}">${L.A.gyeok.name}</span></div>
      <div class="dogtxt">
        <p class="genre">${L.gk.genre}에 나올 법한 인물</p>
        <p>${L.gk.line}</p>
        <p class="ex">${L.gk.scene}</p>
        <p><b>무기</b> ${L.gk.power} &nbsp;·&nbsp; <b>약점</b> ${L.gk.weak}</p>
      </div>
    </div>`;
  if(L.gk.refs && L.gk.refs.length){
    h += `<div class="refs">
      <div class="rhead">이런 인물이 떠오릅니다</div>
      <div class="rchips">${L.gk.refs.map(r=>
        `<span class="chip"><b>${r.n}</b><em>${r.w}</em></span>`).join("")}</div>
      <div class="rnote">비교를 돕기 위해 널리 알려진 배역을 예로 든 것입니다. 각 작품·권리자와 무관하며, 실제 인물의 사주를 분석한 결과가 아닙니다.</div>
    </div>`;
  }

  h += `<h3>능력치</h3>
    ${statBars(L.stats)}
    <p>가장 높은 건 <b>${L.best.name}</b>${L.best.cnt>=3?" — 이건 거의 만렙입니다.":"입니다."}
       ${L.worst.cnt===0
         ? `반대로 <b>${L.worst.name}</b>은 0입니다. 없다고 못 하는 게 아니라, 저절로는 안 나오니 의식적으로 챙겨야 하는 영역입니다.`
         : `상대적으로 낮은 건 <b>${L.worst.name}</b>입니다.`}</p>`;

  h += `<h3>이럴 때 이런 사람</h3>
    <div class="situ">
      <div><span class="sh">🍻 모임에서</span>${L.situ.party}</div>
      <div><span class="sh">✈️ 여행 갈 때</span>${L.situ.trip}</div>
      <div><span class="sh">💢 갈등이 생기면</span>${L.situ.fight}</div>
    </div>`;

  h += `<h3>10년 단위 흐름</h3>`;
  if(L.nowD) h += `<p>지금은 <b>${L.nowD.age}~${L.nowD.age+9}세 ${L.nowD.gz}</b> 구간, <b>${L.nowD.tag}</b>입니다.</p>`;
  h += `<div class="dlite">`;
  L.daeun.forEach(d=>{
    h += `<div class="dl ${d.now?"now":""}">
      <span class="dla">${d.age}세</span>
      <span class="dlg oh-${GAN_OH[GAN.indexOf(d.gz[0])]}">${gzH(d.idx)}</span>
      <span class="dlt">${d.tag}</span></div>`;
  });
  h += `</div>`;

  h += `<div class="note">라이트 분석은 고전 분석과 <b>같은 원국·격국 계산</b>에서 나온 결과를 비유로 옮긴 것입니다.
    견종과 캐릭터 유형은 이해를 돕기 위한 비유이지 실제 성격 판정이 아닙니다.
    더 자세한 근거가 궁금하시면 위 <b>고전 명리 분석</b> 탭을 눌러보세요.</div>`;
  return h;
}

/* ---------- 고전 ---------- */
function renderClassic(r){
  const {sections, A} = classicSections(r);
  let h = `<div class="gyeokbar">
    <span class="gk">${A.gyeok.name}</span>
    <span class="gx">일간 ${r.dGan}(${GAN_H[GAN.indexOf(r.dGan)]}) · ${A.gise.level} · ${A.johu.season.name}생</span>
    <span class="gx2">${A.seong.state}</span></div>`;
  sections.forEach(s=>{ h += `<h3>${s.t}</h3>`; s.b.forEach(p=>h += `<p>${p}</p>`); });

  h += `<h3>참고 — 십성 배치</h3>
    <p>일간 <b>${r.dGan}</b>을 기준으로 나머지 글자가 맡는 역할입니다. 생극제화 관계에서 도출한 배치이며, 그 자체로 길흉을 뜻하지 않습니다.</p>`;
  const cnt={}; r.pillars.forEach(p=>{ if(p.ganSip!=="일원") cnt[p.ganSip]=(cnt[p.ganSip]||0)+1; cnt[p.jiSip]=(cnt[p.jiSip]||0)+1; });
  h += sipCards({cnt});

  h += `<h3>대운 — 10년 단위 기세의 변화</h3>
    <p>대운은 원국을 바꾸지 않습니다. 격을 이루는 요소가 보강되는 시기인지, 흔드는 요소가 강해지는 시기인지를 봅니다. ${r.forward?"순행":"역행"}하며 ${r.daeunNum}세부터 시작합니다.</p>`;
  h += daeunCards(r);

  h += `<div class="note"><b>이 분석의 근거</b> — 격국은 《자평진전》의 월령 취용과 순용·역용 원칙, 조후는 《궁통보감》의 한난조습, 기세는 《적천수》의 득령·득지·득세와 통관 논리를 따랐습니다. 모든 판정은 오행의 생극제화에서 도출했으며, 신살(神煞)은 길흉의 근거로 쓰지 않았습니다.<br><br>
  <b>해석의 성격</b> — 원국 여덟 글자와 절기·대운 계산은 천문 데이터에 근거한 확정값입니다. 그러나 거기서 성향과 지향을 도출하는 부분은 검증된 인과관계가 아니라 전통 해석 체계입니다. 정해진 결과가 아니라 구조적 경향성이며, 기회와 리스크가 함께 존재합니다.</div>`;
  return h;
}

/* ===== 저장 ===== */
async function savePerson(){
  if(!current) return;
  if(!current.nameKo){ showErr("one-err","저장하려면 이름(한글)을 입력하세요."); return; }
  hideErr("one-err");
  const btn=$("btn-save"); btn.disabled=true;
  try{
    await DB.add(current.form);
    await refreshPeople();
    toast(`${current.nameKo} 저장 완료 · ${DB.mode==="cloud"?"계정에 저장됨":"이 브라우저에 저장됨"}`);
  }catch(e){ showErr("one-err", e.message); }
  finally{ btn.disabled=false; }
}
async function delPerson(id){
  if(!confirm("이 사람을 목록에서 삭제할까요?")) return;
  try{ await DB.remove(id); await refreshPeople(); toast("삭제했습니다."); }
  catch(e){ toast(e.message, true); }
}
function recSaju(p){ const r=computeSaju(p); r.nameKo=p.nameKo; r.nameHj=p.nameHj; r.form=p; return r; }

function renderList(){
  const el=$("plist");
  if(!people.length){ el.innerHTML=`<div class="empty">등록된 사람이 없습니다. 위에서 분석 후 <b>목록에 저장</b>을 누르세요.</div>`; return; }
  let h=`<table><thead><tr><th>이름</th><th>생년월일시</th><th>성별</th><th>사주</th><th></th></tr></thead><tbody>`;
  people.forEach(p=>{
    const r=recSaju(p);
    h+=`<tr><td><b>${esc(p.nameKo)}</b>${p.nameHj?` <span class="hj" style="color:var(--ink-3)">${esc(p.nameHj)}</span>`:""}</td>
      <td style="color:var(--ink-3);font-size:12px">${p.y}-${pad(p.m,2)}-${pad(p.d,2)} ${pad(p.h,2)}:${pad(p.mi,2)}</td>
      <td style="font-size:12px">${p.gender}</td>
      <td class="gz">${r.pillars.map(x=>x.gan+x.ji).join(" ")}</td>
      <td><button class="ghost tiny" onclick="delPerson('${p.id}')">삭제</button></td></tr>`;
  });
  h+="</tbody></table>"; el.innerHTML=h;
}

/* ===== 궁합 ===== */
function renderPairPickers(){
  const sel=$("p-base");
  const keep=sel.value;
  sel.innerHTML = people.map(p=>`<option value="${p.id}">${esc(p.nameKo)} (${p.y}-${pad(p.m,2)}-${pad(p.d,2)})</option>`).join("");
  if(keep) sel.value=keep;
  const box=$("p-others");
  if(!people.length){ box.innerHTML=`<div class="empty">먼저 <b>1인 분석</b> 탭에서 사람을 등록하세요.</div>`; $("btn-pair").disabled=true; return; }
  $("btn-pair").disabled=false;
  box.innerHTML = people.map(p=>
    `<label class="chk" style="padding:5px 0"><input type="checkbox" value="${p.id}"> ${esc(p.nameKo)}
     <span style="color:var(--ink-4);font-size:11px">${p.y}-${pad(p.m,2)}-${pad(p.d,2)}</span></label>`).join("");
}

function runPair(){
  const bid=$("p-base").value;
  const base=people.find(p=>p.id===bid);
  const ids=[...$("p-others").querySelectorAll("input:checked")].map(i=>i.value).filter(i=>i!==bid);
  if(!base){ showErr("pair-err","기준이 될 사람을 선택하세요."); return; }
  if(!ids.length){ showErr("pair-err","비교할 상대를 한 명 이상 선택하세요. (기준 본인은 제외됩니다)"); return; }
  hideErr("pair-err");

  const A=recSaju(base);
  const results = ids.map(id=>{ const B=recSaju(people.find(p=>p.id===id)); return {B, R:pairRelation(A,B)}; })
                     .sort((a,b)=>b.R.score-a.R.score);

  let h=`<div class="card"><h2>기준 — ${esc(A.nameKo)}</h2>
    <div style="display:flex;gap:22px;flex-wrap:wrap;align-items:center">
    <div class="gz" style="font-family:Batang,바탕,serif;font-size:19px">${A.pillars.map(x=>x.gan+x.ji).join(" ")}</div>
    <div style="font-size:12px;color:var(--ink-3)">일간 <b style="color:var(--ink)">${A.dGan}</b> · 일지 ${JI[A.dayJi]} · 오행 ${OH_LIST.map(k=>k+A.oh[k]).join(" ")}</div>
    </div></div>`;

  results.forEach(({B,R})=>{
    h+=`<div class="pair">
      <div class="pair-h">
        <span class="nm">${esc(B.nameKo)}</span>
        <span class="gzs">${B.pillars.map(x=>x.gan+x.ji).join(" ")}</span>
        <span class="gauge"><span class="bar"><span class="fill" style="width:${R.score}%"></span></span>
        <span class="n">${R.score}</span></span>
      </div>
      <div class="pair-b">
        <div style="display:flex;gap:22px;flex-wrap:wrap;align-items:center;padding:10px 0 4px">
          <div style="width:250px">${ohPentagon(A.oh, B.oh)}</div>
          <div style="flex:1;min-width:230px">
            ${R.rel.map(x=>`<div class="rel">
              <span class="k">${x.k}</span>
              <span class="v">${x.v}<em>${x.d}</em></span>
              <span class="s ${x.s>0?"p":(x.s<0?"m":"z")}">${x.s>0?"+":""}${x.s}</span></div>`).join("")}
          </div>
        </div>
        <div style="font-size:11.5px;color:var(--ink-3);padding:2px 0 12px">
          채워진 원 = ${esc(A.nameKo)}의 오행 · 점선 원 = ${esc(B.nameKo)}의 오행
        </div>
        <div class="interp" style="border-top:1px solid var(--line-2);padding-top:10px">
          <div class="ptype"><span class="tn">${R.type.k}</span><span class="td">${R.type.d}</span></div>
          ${(()=>{ const PL=pairLight(A,B,R); return `
            <div class="pdogs">
              <span class="pd">${dogArt(A.dGan,72)}<span class="pdn">${esc(A.nameKo)}<br><em>${PL.da.breed}</em></span></span>
              <span class="pdx">＋</span>
              <span class="pd">${dogArt(B.dGan,72)}<span class="pdn">${esc(B.nameKo)}<br><em>${PL.db.breed}</em></span></span>
              <span class="pdt">${esc(josa(A.nameKo,"은","는"))} ${PL.da.breed}, ${esc(josa(B.nameKo,"은","는"))} ${PL.db.breed} 기질입니다.</span>
            </div>
            <div class="pscene">
              <div><span class="ph">✈️ 같이 여행 가면</span>${PL.sc.trip}</div>
              <div><span class="ph">💢 부딪히면</span>${PL.sc.fight}</div>
              <div><span class="ph">💡 이것만 지키면</span>${PL.sc.tip}</div>
              ${PL.fill.length?`<div><span class="ph">🔋 서로 채워주는 능력치</span>${PL.fill.join(" · ")}</div>`:""}
            </div>`; })()}
          ${R.summary.map(x=>`<p>${x}</p>`).join("")}
          <div class="scene ok"><div class="sh">이럴 때 잘 맞습니다</div><div class="st">${R.scenes[0].t}</div></div>
          <div class="scene no"><div class="sh">이럴 때 조심하세요</div><div class="st">${R.scenes[1].t}</div></div>
          <p class="hint" style="margin-top:10px">${R.zodiac}</p>
        </div>
      </div></div>`;
  });

  h+=`<div class="note"><b>점수를 읽는 법</b> — 50점에서 출발해 일지 관계(육합·삼합·충·원진), 일간의 생극 관계, 오행 보완 정도를 더하고 뺀 값입니다. 각 항목의 가중치는 전통 해석에서 중요하게 보는 순서를 반영한 것이지 표준화된 공식이 아닙니다. 낮은 점수가 나쁜 관계를 뜻하지 않습니다 — 충(沖)처럼 마찰로 읽히는 조합이 실제로는 서로를 자극해 성장시키는 관계로 해석되기도 합니다. 사람 사이의 관계는 여기 담기지 않은 요소가 훨씬 많다는 점을 기억해 주세요.</div>`;
  $("pair-out").innerHTML=h;
}

/* ===== 럭키 가이드 ===== */
let luckCat = "일";
function renderLuckPickers(){
  const sel=$("l-who"), keep=sel.value;
  sel.innerHTML = people.map(p=>`<option value="${p.id}">${esc(p.nameKo)} (${p.y}-${pad(p.m,2)}-${pad(p.d,2)})</option>`).join("");
  if(keep) sel.value=keep;
  if(!$("l-date").value){
    const t=new Date();
    $("l-date").value = `${t.getFullYear()}-${pad(t.getMonth()+1,2)}-${pad(t.getDate(),2)}`;
  }
  $("l-cats").innerHTML = CATEGORIES.map(c=>
    `<button type="button" class="cat ${c.k===luckCat?"on":""}" onclick="pickCat('${c.k}')">${c.emo} ${c.k}</button>`).join("");
  $("btn-luck").disabled = !people.length;
  if(!people.length) $("luck-out").innerHTML = `<div class="card"><div class="empty">먼저 <b>1인 분석</b> 탭에서 사주를 저장해 주세요.</div></div>`;
}
function pickCat(k){
  luckCat=k;
  const ph=CATEGORIES.find(c=>c.k===k);
  if(ph) $("l-q").placeholder = ph.ph;
  renderLuckPickers();
}
function runLuck(){
  const p = people.find(x=>x.id===$("l-who").value);
  if(!p){ showErr("luck-err","사주를 선택해 주세요."); return; }
  const dv = $("l-date").value;
  if(!dv){ showErr("luck-err","날짜를 선택해 주세요."); return; }
  hideErr("luck-err");
  const [yy,mm,dd] = dv.split("-").map(Number);
  const r = recSaju(p);
  const q = $("l-q").value.trim();
  const guessed = guessCategory(q);
  const cat = guessed || luckCat;
  const R = luckyGuide(r, cat, q, new Date(yy, mm-1, dd));
  const M = R._meta;
  const go = R.decision === "GO";

  let h = `<div class="card">
    <div class="verdict ${go?"go":"stop"}">
      <div class="vbig">${R.decision}</div>
      <div class="vtxt">
        <div class="vlabel">${R.decision_label}</div>
        ${q?`<div class="vq">“${esc(q)}”</div>`:""}
      </div>
    </div>`;

  const tags=[];
  if(guessed && guessed!==luckCat) tags.push(`<b>${guessed}</b> 분야`);
  if(M.dir) tags.push(M.dir==="in" ? `<b>들이는 결정</b>(사다·시작하다·맺다)`
                                   : `<b>내보내는 결정</b>(팔다·그만두다·끊다)`);
  if(tags.length)
    h += `<p class="hint">질문을 보고 ${tags.join("이자 ")}으로 판단했습니다.</p>`;

  h += `<div class="lucklines">
      <div><span class="lh">왜 그런가요</span>${R.saju_reason}</div>
      <div><span class="lh">이렇게 해보세요</span>${R.action_tip}</div>
      <div><span class="lh">오늘의 행운 요소</span>${R.lucky_item}<br>
        <span class="hint">${M.luckyAct} · 나에게 힘이 되는 기운은 <b>${M.luckOh}</b>입니다.</span></div>
    </div>`;

  h += `<div class="daymeter">
      <div class="dmhead"><b>${M.date}</b> · 일진 <b class="hj">${M.today.hj}</b> ${M.today.ko}
        <span class="dmr">60일 주기 중 상위 ${Math.max(1,100-M.pct)}%</span></div>
      <div class="dmbar"><span class="dmfill ${go?"go":"stop"}" style="width:${M.pct}%"></span>
        <span class="dmmid" title="이 사람의 평균선"></span></div>
      <div class="hint">오늘 일진의 천간은 <b>${M.sip}</b>, 지지는 <b>${M.jiSip}</b>에 해당합니다${M.rel?` · 내 일지와는 <b>${M.rel}</b>`:""}.</div>
    </div>`;

  h += `<details class="jsonbox"><summary>JSON 보기</summary><pre>${esc(JSON.stringify({
      decision:R.decision, decision_label:R.decision_label,
      saju_reason:R.saju_reason, action_tip:R.action_tip, lucky_item:R.lucky_item
    }, null, 2))}</pre></details>`;

  h += `<div class="note">판정은 오늘의 일진과 저장된 사주의 생극·합충 관계에서 규칙으로 계산합니다. 같은 사람·같은 날·같은 분야면 언제나 같은 결과가 나옵니다. 재미와 기분 전환을 위한 기능이며, 중요한 결정의 근거로는 삼지 마세요.</div></div>`;

  $("luck-out").innerHTML = h;
  $("luck-out").scrollIntoView({behavior:"smooth",block:"nearest"});
}

/* ===== 알림 / 오류 ===== */
let toastTimer=null;
function toast(msg, bad){
  const el=$("toast"); el.textContent=msg;
  el.className="toast show"+(bad?" bad":"");
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>{ el.className="toast"; }, 4000);
}
function showErr(id,msg){ const e=$(id); e.textContent=msg; e.classList.remove("hide"); }
function hideErr(id){ $(id).classList.add("hide"); }

/* ===== 인증 UI ===== */
function renderAuth(){
  const bar=$("authbar");
  if(!DB.configured()){
    bar.innerHTML=`<span class="st local">이 브라우저에 저장</span>
      <span class="ax">기록은 이 브라우저에 남습니다. 다른 기기에서도 보려면 config.js에 Supabase 정보를 넣으세요.</span>`;
    return;
  }
  if(DB.signedIn()){
    bar.innerHTML=`<span class="st cloud">내 계정에 저장</span>
      <span class="ax"><b>${esc(DB.user.email||"로그인됨")}</b></span>
      <span class="agrow"></span>
      <button class="ghost tiny" onclick="doMigrate()">이 브라우저 기록 옮기기</button>
      <button class="ghost tiny" onclick="doSignOut()">로그아웃</button>`;
    return;
  }
  bar.innerHTML=`<span class="st local">이 브라우저에 저장</span>
    <span class="ax">이메일로 로그인하면 어느 기기에서든 같은 기록을 볼 수 있습니다.</span>
    <span class="agrow"></span>
    <input id="auth-email" type="email" placeholder="이메일" autocomplete="username" style="width:180px"
      onkeydown="if(event.key==='Enter')$('auth-pw').focus()">
    <input id="auth-pw" type="password" placeholder="비밀번호 (6자 이상)" autocomplete="current-password" style="width:160px"
      onkeydown="if(event.key==='Enter')doLogin()">
    <button class="act tiny" id="btn-login" onclick="doLogin()">로그인 · 가입</button>
    <button class="ghost tiny" onclick="doReset()">비밀번호 재설정</button>`;
}
async function doLogin(){
  const em=$("auth-email").value.trim(), pw=$("auth-pw").value;
  if(!em){ toast("이메일을 입력하세요.", true); return; }
  if(pw.length<6){ toast("비밀번호는 6자 이상이어야 합니다.", true); return; }
  const btn=$("btn-login"); btn.disabled=true; btn.textContent="처리 중…";
  try{
    const res=await DB.signInOrUp(em, pw);
    if(res.needConfirm) toast("가입 확인 메일을 보냈습니다. 메일의 링크를 누른 뒤 다시 로그인하세요.");
    else if(res.created) toast("계정을 만들고 로그인했습니다.");
    else toast("로그인했습니다.");
  }catch(e){ toast(e.message, true); }
  finally{ if($("btn-login")){ btn.disabled=false; btn.textContent="로그인 · 가입"; } }
}
async function doReset(){
  const em=$("auth-email").value.trim();
  if(!em){ toast("먼저 이메일을 입력하세요.", true); return; }
  try{ await DB.resetPassword(em); toast("비밀번호 재설정 메일을 보냈습니다."); }
  catch(e){ toast(e.message, true); }
}
async function doSignOut(){ await DB.signOut(); toast("로그아웃했습니다. 이후 기록은 이 브라우저에 저장됩니다."); }
async function doMigrate(){
  try{ const n=await DB.migrateLocal(); await refreshPeople();
    toast(n? `${n}명을 계정으로 옮겼습니다.` : "옮길 기록이 없습니다."); }
  catch(e){ toast(e.message, true); }
}
function onAuthChanged(){ renderAuth(); refreshPeople(); }

/* ===== 초기화 ===== */
window.addEventListener("DOMContentLoaded", async ()=>{
  $("f-y").value=1990; $("f-m").value=1; $("f-d").value=1; $("f-h").value=12; $("f-mi").value=0;
  try{ await DB.init(); }catch(e){ console.warn(e); }
  renderAuth();
  await refreshPeople();
});

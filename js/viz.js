/* ===== 시각화 ===== */
const OH_COLOR = {목:"var(--mok)",화:"var(--hwa)",토:"var(--to)",금:"var(--geum)",수:"var(--su)"};

/* 오행 상생상극 오각형 */
function ohPentagon(oh, oh2){
  const W=300,H=270,cx=150,cy=138,R=88;
  // 상생 순: 목→화→토→금→수
  const order=["목","화","토","금","수"];
  const pts=order.map((k,i)=>{
    const a=-Math.PI/2 + i*2*Math.PI/5;
    return {k, x:cx+R*Math.cos(a), y:cy+R*Math.sin(a)};
  });
  const P={}; pts.forEach(p=>P[p.k]=p);
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="오행 분포와 상생상극 관계">`;
  // 상생 (외곽 오각형)
  s+=`<polygon points="${pts.map(p=>p.x+","+p.y).join(" ")}" fill="none" stroke="var(--line)" stroke-width="1"/>`;
  // 상극 (내부 별)
  const gk=["목","토","수","화","금"];
  s+=`<polygon points="${gk.map(k=>P[k].x+","+P[k].y).join(" ")}" fill="none" stroke="var(--line-2)" stroke-width="1" stroke-dasharray="3 3"/>`;
  // 노드
  pts.forEach(p=>{
    const n=oh[p.k]||0;
    const r=9+n*4.6;
    s+=`<circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${OH_COLOR[p.k]}" opacity="${n===0?0.13:0.88}"/>`;
    if(oh2){
      const n2=oh2[p.k]||0, r2=9+n2*4.6;
      s+=`<circle cx="${p.x}" cy="${p.y}" r="${r2}" fill="none" stroke="${OH_COLOR[p.k]}" stroke-width="1.6" stroke-dasharray="4 3" opacity="${n2===0?0.25:0.95}"/>`;
    }
    const lx=cx+(R+30)*Math.cos(Math.atan2(p.y-cy,p.x-cx));
    const ly=cy+(R+30)*Math.sin(Math.atan2(p.y-cy,p.x-cx));
    s+=`<text x="${lx}" y="${ly-2}" text-anchor="middle" font-size="12" fill="var(--ink-2)" font-weight="700">${p.k}</text>`;
    s+=`<text x="${lx}" y="${ly+11}" text-anchor="middle" font-size="10.5" fill="var(--ink-3)">${n}${oh2?" / "+(oh2[p.k]||0):""}</text>`;
  });
  s+=`<text x="${cx}" y="${H-10}" text-anchor="middle" font-size="9.5" fill="var(--ink-4)">실선 오각형 = 상생 · 점선 별 = 상극</text>`;
  s+="</svg>";
  return s;
}

/* 십성 막대 */
function sipBars(r){
  const c={};
  r.pillars.forEach(p=>{ if(p.ganSip!=="일원") c[p.ganSip]=(c[p.ganSip]||0)+1; c[p.jiSip]=(c[p.jiSip]||0)+1; });
  const keys=["비견","겁재","식신","상관","편재","정재","편관","정관","편인","정인"];
  const max=Math.max(1,...Object.values(c));
  const W=520,rowH=21,H=keys.length*rowH+8;
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="십성 분포">`;
  keys.forEach((k,i)=>{
    const v=c[k]||0, y=i*rowH+14;
    s+=`<text x="0" y="${y}" font-size="11.5" fill="${v?"var(--ink)":"var(--ink-4)"}">${k}</text>`;
    s+=`<rect x="46" y="${y-9}" width="${(W-80)}" height="11" fill="var(--line-2)"/>`;
    if(v) s+=`<rect x="46" y="${y-9}" width="${(W-80)*v/max}" height="11" fill="var(--ink-2)"/>`;
    s+=`<text x="${W-22}" y="${y}" font-size="11" fill="var(--ink-3)" text-anchor="end">${v||"–"}</text>`;
  });
  s+="</svg>"; return s;
}

/* 대운 타임라인 */
function daeunTimeline(r, curAge){
  const W=760,H=76;
  const n=r.daeun.length, seg=(W-16)/n;
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="대운 흐름">`;
  s+=`<line x1="8" y1="46" x2="${W-8}" y2="46" stroke="var(--line)" stroke-width="1"/>`;
  r.daeun.forEach((d,i)=>{
    const x=8+seg*i+seg/2;
    const oh=GAN_OH[GAN.indexOf(d.gz[0])];
    const act = curAge!=null && curAge>=d.age && curAge<d.age+10;
    s+=`<circle cx="${x}" cy="46" r="${act?7:4.5}" fill="${OH_COLOR[oh]}" opacity="${act?1:.62}"/>`;
    if(act) s+=`<circle cx="${x}" cy="46" r="11" fill="none" stroke="var(--ink)" stroke-width="1"/>`;
    s+=`<text x="${x}" y="26" text-anchor="middle" font-size="15" font-family="Batang,바탕,serif" fill="var(--ink)">${gzH(d.idx)}</text>`;
    s+=`<text x="${x}" y="64" text-anchor="middle" font-size="10" fill="var(--ink-3)">${d.age}세</text>`;
    s+=`<text x="${x}" y="74" text-anchor="middle" font-size="8.5" fill="var(--ink-4)">${d.sip}</text>`;
  });
  s+="</svg>"; return s;
}

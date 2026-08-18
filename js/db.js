/* ============================================================
   저장 계층
   - Supabase 설정이 있으면  : 로그인 후 서버에 저장 (기기 간 공유)
   - 설정이 없거나 미로그인  : 이 브라우저에만 저장 (localStorage)
   두 경우 모두 같은 함수로 접근하도록 감쌌습니다.
   ============================================================ */

const LS_KEY = "saju:people:v1";

const DB = {
  client: null,
  mode: "local",      // "local" | "cloud"
  user: null,

  /* ---------- 초기화 ---------- */
  async init() {
    const c = window.SAJU_CONFIG || {};
    if (!c.SUPABASE_URL || !c.SUPABASE_ANON) return this.mode = "local";
    if (!window.supabase?.createClient) {
      console.warn("supabase-js 를 불러오지 못해 브라우저 저장 모드로 동작합니다.");
      return this.mode = "local";
    }
    this.client = window.supabase.createClient(c.SUPABASE_URL, c.SUPABASE_ANON, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    const { data } = await this.client.auth.getSession();
    this.user = data?.session?.user || null;
    this.mode = this.user ? "cloud" : "local";
    this.client.auth.onAuthStateChange((_e, session) => {
      this.user = session?.user || null;
      this.mode = this.user ? "cloud" : "local";
      if (typeof onAuthChanged === "function") onAuthChanged();
    });
    return this.mode;
  },

  configured() { return !!this.client; },
  signedIn()   { return !!this.user; },
  label() {
    if (!this.client) return "브라우저 저장";
    if (!this.user)   return "로그아웃 상태 · 브라우저 저장";
    return this.user.email || "로그인됨";
  },

  /* ---------- 인증 ---------- */
  /* 이메일 + 비밀번호. 가입과 로그인을 한 버튼에서 처리한다. */
  async signUp(email, password){
    if(!this.client) throw new Error("Supabase가 설정되지 않았습니다.");
    const { data, error } = await this.client.auth.signUp({
      email, password,
      options: { emailRedirectTo: window.location.href.split("#")[0] }
    });
    if (error) throw new Error(this.msg(error));
    // 이메일 확인이 켜져 있으면 세션이 바로 생기지 않는다
    if (!data.session) return { needConfirm: true };
    return { needConfirm: false };
  },
  async signIn(email, password){
    if(!this.client) throw new Error("Supabase가 설정되지 않았습니다.");
    const { error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw new Error(this.msg(error));
  },
  /* 로그인 시도 후 계정이 없으면 자동으로 가입 */
  async signInOrUp(email, password){
    if(!this.client) throw new Error("Supabase가 설정되지 않았습니다.");
    const { error } = await this.client.auth.signInWithPassword({ email, password });
    if (!error) return { created:false, needConfirm:false };
    const t = (error.message||"").toLowerCase();
    if (t.includes("invalid login credentials")) {
      const res = await this.signUp(email, password);
      return { created:true, needConfirm:res.needConfirm };
    }
    throw new Error(this.msg(error));
  },
  async resetPassword(email){
    if(!this.client) throw new Error("Supabase가 설정되지 않았습니다.");
    const { error } = await this.client.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.href.split("#")[0]
    });
    if (error) throw new Error(this.msg(error));
  },
  async signOut(){ if(this.client) await this.client.auth.signOut(); },

  msg(e) {
    const t = (e?.message || "").toLowerCase();
    if (t.includes("invalid login credentials"))
      return "이메일 또는 비밀번호가 맞지 않습니다.";
    if (t.includes("user already registered") || t.includes("already been registered"))
      return "이미 가입된 이메일입니다. 비밀번호를 확인해 주세요.";
    if (t.includes("password") && (t.includes("least") || t.includes("short") || t.includes("6")))
      return "비밀번호는 6자 이상이어야 합니다.";
    if (t.includes("email") && t.includes("not confirmed"))
      return "이메일 인증이 완료되지 않았습니다. 메일함의 확인 링크를 눌러주세요.";
    if (t.includes("rate limit") || t.includes("too many"))
      return "요청이 너무 잦습니다. 잠시 후 다시 시도해 주세요.";
    if (t.includes("invalid") && t.includes("email"))
      return "이메일 주소 형식을 확인해 주세요.";
    if (t.includes("redirect"))
      return "리디렉션 주소가 허용 목록에 없습니다. Supabase > Authentication > URL Configuration 에 이 사이트 주소를 추가하세요.";
    return e?.message || "알 수 없는 오류가 발생했습니다.";
  },

  /* ---------- 레코드 변환 ---------- */
  toRow(p, uid) {
    return { user_id: uid, name_ko: p.nameKo, name_hj: p.nameHj || null,
      birth_year: p.y, birth_month: p.m, birth_day: p.d,
      birth_hour: p.h, birth_minute: p.mi,
      gender: p.gender, true_solar: !!p.trueSolar, jaja_mode: p.jajaMode || "ya" };
  },
  fromRow(r) {
    return { id: r.id, nameKo: r.name_ko, nameHj: r.name_hj || "",
      y: r.birth_year, m: r.birth_month, d: r.birth_day,
      h: r.birth_hour, mi: r.birth_minute,
      gender: r.gender, trueSolar: r.true_solar, jajaMode: r.jaja_mode };
  },

  /* ---------- CRUD ---------- */
  async list() {
    if (this.mode === "cloud") {
      const { data, error } = await this.client.from("people")
        .select("*").order("created_at", { ascending: false });
      if (error) throw new Error(this.dbMsg(error));
      return data.map(this.fromRow);
    }
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); }
    catch { return []; }
  },

  async add(p) {
    if (this.mode === "cloud") {
      const { data, error } = await this.client.from("people")
        .insert(this.toRow(p, this.user.id)).select().single();
      if (error) throw new Error(this.dbMsg(error));
      return this.fromRow(data);
    }
    const all = await this.list();
    const rec = { ...p, id: "local-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7) };
    all.unshift(rec);
    localStorage.setItem(LS_KEY, JSON.stringify(all));
    return rec;
  },

  async remove(id) {
    if (this.mode === "cloud" && !String(id).startsWith("local-")) {
      const { error } = await this.client.from("people").delete().eq("id", id);
      if (error) throw new Error(this.dbMsg(error));
      return;
    }
    const all = (await this.localList()).filter(x => x.id !== id);
    localStorage.setItem(LS_KEY, JSON.stringify(all));
  },

  async localList() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
  },

  /* 브라우저에 쌓인 데이터를 로그인 계정으로 옮기기 */
  async migrateLocal() {
    if (this.mode !== "cloud") throw new Error("먼저 로그인해 주세요.");
    const local = await this.localList();
    if (!local.length) return 0;
    const rows = local.map(p => this.toRow(p, this.user.id));
    const { error } = await this.client.from("people")
      .upsert(rows, { onConflict: "user_id,name_ko,birth_year,birth_month,birth_day,birth_hour,birth_minute",
                      ignoreDuplicates: true });
    if (error) throw new Error(this.dbMsg(error));
    localStorage.removeItem(LS_KEY);
    return local.length;
  },

  dbMsg(e) {
    const t = (e?.message || "") + " " + (e?.hint || "");
    if (/row-level security|permission denied/i.test(t))
      return "권한이 없습니다. supabase/schema.sql 을 실행해 RLS 정책이 만들어졌는지 확인하세요.";
    if (/duplicate key/i.test(t))
      return "같은 이름과 생년월일시가 이미 저장되어 있습니다.";
    if (/relation .* does not exist/i.test(t))
      return "people 테이블이 없습니다. supabase/schema.sql 을 SQL Editor에서 실행하세요.";
    return e?.message || "저장소 오류가 발생했습니다.";
  }
};

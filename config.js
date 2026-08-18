/* ============================================================
   Supabase 설정
   ------------------------------------------------------------
   Supabase 대시보드 > Project Settings > API 에서 복사하세요.

     SUPABASE_URL  : Project URL          (예: https://abcdefgh.supabase.co)
     SUPABASE_ANON : anon / public key    ("publishable" 로 표기되기도 함)

   ★ anon 키는 브라우저에 공개되는 것이 정상입니다.
     대신 반드시 Row Level Security(RLS)를 켜야 합니다.
     supabase/schema.sql 을 그대로 실행하면 RLS가 함께 설정됩니다.

   ★ service_role(secret) 키는 절대 여기에 넣지 마세요.
     그 키는 RLS를 무시하므로 공개되면 전체 데이터가 노출됩니다.

   두 값을 비워두면 앱은 '브라우저 저장 모드'로 동작합니다.
   (이 브라우저에만 저장되고 다른 기기와 공유되지 않습니다)
   ============================================================ */

window.SAJU_CONFIG = {
  SUPABASE_URL:  "",
  SUPABASE_ANON: "",

};

/* 로그인 방식: 이메일 + 비밀번호
   처음 보는 이메일이면 자동으로 계정을 만들고 바로 로그인합니다.

   ★ Supabase 대시보드 > Authentication > Sign In / Providers > Email 에서
     "Confirm email" 을 꺼두면 가입 즉시 사용할 수 있습니다.
     켜두면 메일의 확인 링크를 누른 뒤에야 로그인됩니다.
     (Supabase 기본 메일은 발송 한도가 낮으니 개인용이라면 끄는 편이 편합니다) */

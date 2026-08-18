-- ============================================================
-- 사주 만세력 - Supabase 스키마
-- 실행 방법: Supabase 대시보드 > SQL Editor > 새 쿼리에 붙여넣고 Run
-- 여러 번 실행해도 안전하도록 작성했습니다.
-- ============================================================

-- 1. 테이블 -----------------------------------------------------
create table if not exists public.people (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,

  name_ko       text not null check (char_length(name_ko) between 1 and 40),
  name_hj       text check (char_length(name_hj) <= 40),

  birth_year    smallint not null check (birth_year  between 1900 and 2050),
  birth_month   smallint not null check (birth_month between 1 and 12),
  birth_day     smallint not null check (birth_day   between 1 and 31),
  birth_hour    smallint not null check (birth_hour  between 0 and 23),
  birth_minute  smallint not null check (birth_minute between 0 and 59),

  gender        text not null check (gender in ('남','여')),
  true_solar    boolean not null default true,
  jaja_mode     text not null default 'ya' check (jaja_mode in ('ya','jeong')),
  memo          text check (char_length(memo) <= 1000),

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table  public.people          is '사주 분석 대상 인물';
comment on column public.people.true_solar is '진태양시 보정 사용 여부';
comment on column public.people.jaja_mode  is 'ya=야자시설, jeong=정자시설';

-- 같은 사용자가 동일 인물을 중복 저장하지 않도록
create unique index if not exists people_uniq
  on public.people (user_id, name_ko, birth_year, birth_month, birth_day, birth_hour, birth_minute);

create index if not exists people_user_created
  on public.people (user_id, created_at desc);

-- 2. updated_at 자동 갱신 ---------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists people_touch on public.people;
create trigger people_touch
  before update on public.people
  for each row execute function public.touch_updated_at();

-- 3. Row Level Security -----------------------------------------
-- 이 설정이 없으면 anon 키를 가진 누구나 전체 데이터를 읽을 수 있습니다.
-- 반드시 켜진 상태를 유지하세요.
alter table public.people enable row level security;
alter table public.people force row level security;

drop policy if exists people_select_own on public.people;
create policy people_select_own on public.people
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists people_insert_own on public.people;
create policy people_insert_own on public.people
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists people_update_own on public.people;
create policy people_update_own on public.people
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists people_delete_own on public.people;
create policy people_delete_own on public.people
  for delete to authenticated
  using (auth.uid() = user_id);

-- 4. 설정 확인 ---------------------------------------------------
-- 아래 쿼리를 실행해 rowsecurity 가 true 이고 정책이 4개인지 확인하세요.
--
--   select relname, relrowsecurity, relforcerowsecurity
--   from pg_class where relname = 'people';
--
--   select policyname, cmd from pg_policies
--   where schemaname = 'public' and tablename = 'people';

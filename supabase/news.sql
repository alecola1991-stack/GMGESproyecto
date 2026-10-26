create table public.gm_ges_news (
 id uuid primary key default gen_random_uuid(),
 author_id uuid not null default auth.uid() references auth.users(id),
 title text not null check(char_length(btrim(title)) between 1 and 160),
 body text not null check(char_length(btrim(body)) between 1 and 6000),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.gm_ges_news enable row level security;
revoke all on public.gm_ges_news from anon, authenticated;
grant select on public.gm_ges_news to authenticated;
grant insert(title,body) on public.gm_ges_news to authenticated;
grant update(title,body,updated_at) on public.gm_ges_news to authenticated;
grant delete on public.gm_ges_news to authenticated;
create policy news_read on public.gm_ges_news for select to authenticated using ((select auth.uid()) is not null);
create policy news_publish on public.gm_ges_news for insert to authenticated with check ((select auth.uid())='44dc6ef8-9f7c-4c40-a38a-95e66886414b'::uuid and author_id=(select auth.uid()));
create policy news_edit on public.gm_ges_news for update to authenticated using ((select auth.uid())='44dc6ef8-9f7c-4c40-a38a-95e66886414b'::uuid and author_id=(select auth.uid())) with check ((select auth.uid())='44dc6ef8-9f7c-4c40-a38a-95e66886414b'::uuid and author_id=(select auth.uid()));
create policy news_delete on public.gm_ges_news for delete to authenticated using ((select auth.uid())='44dc6ef8-9f7c-4c40-a38a-95e66886414b'::uuid and author_id=(select auth.uid()));
create index gm_ges_news_created_idx on public.gm_ges_news(created_at desc);
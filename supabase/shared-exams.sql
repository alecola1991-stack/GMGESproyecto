-- Shared exams: authenticated read-only access to the designated publisher's exams.
-- Personal account data and existing RLS policies remain private.
create schema if not exists gm_ges_internal;
revoke all on schema gm_ges_internal from public, anon;
grant usage on schema gm_ges_internal to authenticated;
create or replace function gm_ges_internal.read_shared_exams() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare exams jsonb;
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 select d.data #> '{state,exams}' into exams from public.gm_ges_user_data d where d.user_id='44dc6ef8-9f7c-4c40-a38a-95e66886414b'::uuid;
 if jsonb_typeof(exams) is distinct from 'array' then exams:='[]'::jsonb; end if;
 return jsonb_build_object('publisher_id','44dc6ef8-9f7c-4c40-a38a-95e66886414b','exams',coalesce((select jsonb_agg(jsonb_build_object('id',e->>'id','date',e->>'date','subject',e->>'subject','title',e->>'title','notes',e->>'notes')) from jsonb_array_elements(exams) e where jsonb_typeof(e)='object'),'[]'::jsonb));
end $$;
revoke all on function gm_ges_internal.read_shared_exams() from public, anon;
grant execute on function gm_ges_internal.read_shared_exams() to authenticated;
create or replace function public.get_gm_ges_shared_exams() returns jsonb
language sql stable security invoker set search_path='' as $$ select gm_ges_internal.read_shared_exams(); $$;
revoke all on function public.get_gm_ges_shared_exams() from public,anon;
grant execute on function public.get_gm_ges_shared_exams() to authenticated;
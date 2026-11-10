-- 002: turn the to-do list into a kanban board.
--   * status   replaces the old done flag: 'todo' | 'doing' | 'done'
--   * assignee optional: 'gerardo' | 'genesis'
-- Idempotent: safe to run any number of times.

alter table public.todos add column if not exists status   text not null default 'todo';
alter table public.todos add column if not exists assignee text;

-- Carry over finished tasks, then retire the old column (only on the first run).
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'todos' and column_name = 'done'
  ) then
    update public.todos set status = 'done' where done;
    alter table public.todos drop column done;
  end if;
end $$;

alter table public.todos
  drop constraint if exists todos_status_check,
  add  constraint todos_status_check   check (status in ('todo', 'doing', 'done')),
  drop constraint if exists todos_assignee_check,
  add  constraint todos_assignee_check check (assignee in ('gerardo', 'genesis'));

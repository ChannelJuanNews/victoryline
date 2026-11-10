import type { GetServerSideProps } from "next";
import AdminLayout from "@/components/AdminLayout";
import KanbanBoard from "@/components/KanbanBoard";
import { getSessionUser } from "@/lib/auth";
import type { Todo } from "@/lib/kanban";
import { listTodos } from "@/lib/todos";
import type { Username } from "@/lib/users";
import s from "@/styles/admin.module.css";

type Props = { user: Username; todos: Todo[] | null };

export const getServerSideProps: GetServerSideProps<Props> = async ({ req }) => {
  const user = getSessionUser(req);
  if (!user) return { redirect: { destination: "/login", permanent: false } };

  try {
    return { props: { user, todos: await listTodos() } };
  } catch (err) {
    console.error("[admin] couldn't load todos", err);
    return { props: { user, todos: null } };
  }
};

export default function Admin({ user, todos }: Props) {
  return (
    <AdminLayout user={user} title="To-do">
      {todos ? (
        <KanbanBoard initial={todos} user={user} />
      ) : (
        <p className={s.empty}>Couldn&rsquo;t load the board. Refresh to try again.</p>
      )}
    </AdminLayout>
  );
}

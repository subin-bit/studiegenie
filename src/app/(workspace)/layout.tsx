import { requireUser } from "@/lib/auth";
import { getWorkspaceShellData } from "@/lib/data";
import { WorkspaceShell } from "@/components/workspace-shell";

export default async function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { supabase, user } = await requireUser();
  const { chats, documents } = await getWorkspaceShellData(supabase, user.id);

  return (
    <WorkspaceShell chats={chats} documents={documents} user={user}>
      {children}
    </WorkspaceShell>
  );
}

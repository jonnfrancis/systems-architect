import { EditorShell } from "@/components/editor/editor-shell";
import { getCurrentUserProjectLists } from "@/lib/projects";

export default async function EditorPage() {
  const projectLists = await getCurrentUserProjectLists();

  return <EditorShell {...projectLists} />;
}

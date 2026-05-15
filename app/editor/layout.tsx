import type { ReactNode } from "react";

import "@xyflow/react/dist/style.css";
import "@liveblocks/react-flow/styles.css";

export default function EditorLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}

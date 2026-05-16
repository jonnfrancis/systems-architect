"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Bot, Download, FileText, Send, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const STARTER_PROMPTS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
];

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: number;
  role: "assistant" | "user";
  text: string;
}

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const nextMessageIdRef = useRef(1);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "72px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [draft]);

  function addPromptMessage(text: string) {
    const trimmedText = text.trim();

    if (!trimmedText) {
      return;
    }

    const userMessageId = nextMessageIdRef.current;
    const assistantMessageId = userMessageId + 1;

    nextMessageIdRef.current += 2;
    setMessages((current) => [
      ...current,
      {
        id: userMessageId,
        role: "user",
        text: trimmedText,
      },
      {
        id: assistantMessageId,
        role: "assistant",
        text: "I can help shape this into nodes, services, data stores, and the main request flows once generation is connected.",
      },
    ]);
    setDraft("");
  }

  function handleSubmit() {
    addPromptMessage(draft);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    handleSubmit();
  }

  return (
    <aside
      className={cn(
        "fixed right-4 top-18 z-30 hidden h-[calc(100vh-5rem)] w-80 flex-col rounded-2xl border border-surface-border bg-base/95 shadow-2xl shadow-background/40 backdrop-blur transition-transform duration-200 ease-out lg:flex",
        isOpen
          ? "translate-x-0"
          : "pointer-events-none translate-x-[calc(100%+2rem)]",
      )}
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-surface-border px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-ai-text">
            <Bot className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold text-copy-primary">
              AI Workspace
            </h2>
            <p className="truncate text-xs text-copy-muted">
              Collaborate with Ghost AI
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close AI sidebar"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </header>

        <Tabs
          defaultValue="architect"
          className="flex min-h-0 flex-1 flex-col gap-0"
        >
          <div className="border-b border-surface-border px-4 py-3">
            <TabsList className="grid h-10 w-full grid-cols-2 bg-subtle">
              <TabsTrigger
                value="architect"
                className="text-copy-muted data-[state=active]:bg-accent data-[state=active]:text-ai-text"
              >
                AI Architect
              </TabsTrigger>
              <TabsTrigger
                value="specs"
                className="text-copy-muted data-[state=active]:bg-accent data-[state=active]:text-ai-text"
              >
                Specs
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="architect"
            className="m-0 flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-ai-text">
                    <Bot className="h-6 w-6" />
                  </div>
                  <p className="max-w-56 text-sm leading-6 text-copy-muted">
                    Ask Ghost AI to draft, extend, or refine the system design
                    on your canvas.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {STARTER_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        className="rounded-full bg-subtle px-3 py-1.5 text-xs font-medium text-ai-text transition-colors hover:bg-accent"
                        onClick={() => addPromptMessage(prompt)}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-6",
                        message.role === "user"
                          ? "ml-auto border-2 border-brand/50 bg-accent-dim text-copy-primary"
                          : "mr-auto border border-surface-border bg-elevated text-ai-text",
                      )}
                    >
                      {message.text}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-surface-border p-4">
              <div className="flex items-end gap-2">
                <Textarea
                  ref={textareaRef}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Ghost AI..."
                  rows={3}
                  className="max-h-40 min-h-18 resize-none bg-surface text-sm text-copy-primary placeholder:text-copy-faint"
                />
                <Button
                  type="button"
                  size="icon"
                  aria-label="Send message"
                  className="h-10 w-10 bg-accent text-white hover:bg-accent/80"
                  disabled={draft.trim().length === 0}
                  onClick={handleSubmit}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="specs" className="m-0 min-h-0 flex-1 px-4 py-4">
            <div className="flex h-full flex-col gap-4">
              <Button
                type="button"
                className="w-full bg-accent text-white hover:bg-accent/80"
              >
                Generate Spec
              </Button>

              <article className="rounded-2xl border border-surface-border bg-elevated p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-ai-text">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-copy-primary">
                      Architecture Spec Draft
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-copy-muted">
                      High-level components, data flow, scaling notes, and
                      operational concerns generated from the canvas.
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-4 w-full justify-center text-copy-faint"
                  disabled
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </article>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </aside>
  );
}

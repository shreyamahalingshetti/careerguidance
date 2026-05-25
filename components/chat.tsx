"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Minus, Square } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // scroll to bottom when messages change
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error("API error");

      // expect { reply: string } or similar — adapt if your API differs
      const data = await res.json();
      const replyText = data?.reply ?? "Sorry, something went wrong.";

      const botMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: replyText };
      setMessages((s) => [...s, botMsg]);
    } catch (err) {
      const errMsg: Message = { id: (Date.now() + 2).toString(), role: "assistant", content: "Error: could not get response." };
      setMessages((s) => [...s, errMsg]);
    } finally {
      setIsLoading(false);
    }
  }

  if (isMinimized) {
    return (
      <Card className="fixed right-4 bottom-4 z-[100] w-[320px] max-w-[calc(100vw-2rem)] rounded-[2rem] overflow-hidden border border-outline-variant/30 shadow-2xl bg-surface-container-lowest">
        <CardHeader className="px-6 py-4 flex flex-row items-center justify-between space-y-0 bg-gradient-to-r from-primary/10 to-transparent">
          <div>
             <div className="text-lg font-bold text-on-surface font-headline">AI Career Chat</div>
             <div className="text-xs text-on-surface-variant font-medium">Minimized</div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Maximize chat"
            onClick={() => setIsMinimized(false)}
            className="hover:bg-primary/20 text-primary rounded-full"
          >
            <Square className="h-4 w-4" />
          </Button>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="fixed right-4 bottom-4 z-[100] flex flex-col w-[360px] max-w-[calc(100vw-2rem)] h-[70vh] rounded-[2rem] overflow-hidden border border-outline-variant/30 shadow-[0_20px_60px_-15px_rgba(55,50,34,0.3)] bg-surface-container-lowest">
      <CardHeader className="px-6 py-5 border-b border-outline-variant/20 flex flex-row items-start justify-between space-y-0 bg-gradient-to-b from-primary/10 to-transparent relative">
        <div className="absolute top-[-30px] right-[-30px] w-24 h-24 bg-primary/20 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="text-xl font-extrabold text-on-surface font-headline">AI Career Chat</div>
          <div className="text-sm text-on-surface-variant font-medium mt-1 pr-4">Ask about streams, careers, exams, courses.</div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Minimize chat"
          onClick={() => setIsMinimized(true)}
          className="hover:bg-primary/20 text-primary rounded-full relative z-10"
        >
          <Minus className="h-5 w-5" />
        </Button>
      </CardHeader>

      {/* Chat messages */}
      <CardContent ref={listRef} className="flex-1 overflow-y-auto overflow-x-hidden space-y-4 p-6 bg-surface-container-low/30">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "p-4 rounded-2xl max-w-[85%] whitespace-pre-wrap break-words text-sm shadow-sm",
              msg.role === "user"
                ? "bg-primary text-white ml-auto rounded-br-sm"
                : "bg-surface-container-highest text-on-surface border border-outline-variant/10 rounded-bl-sm"
            )}
          >
            {msg.content}
          </div>
        ))}

        {isLoading && <div className="text-sm text-primary font-medium italic animate-pulse flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            AI is typing...
          </div>}
      </CardContent>

      {/* Input box */}
      <form onSubmit={handleSubmit} className="flex gap-3 p-4 border-t border-outline-variant/20 bg-surface-container-lowest">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about careers, skills..."
          className="flex-1 rounded-full bg-surface-container-highest border-none focus-visible:ring-2 focus-visible:ring-primary/40 px-4"
        />
        <Button 
          type="submit" 
          disabled={isLoading}
          className="rounded-full bg-primary hover:bg-primary-dim shadow-md"
        >
          Send
        </Button>
      </form>
    </Card>
  );
}

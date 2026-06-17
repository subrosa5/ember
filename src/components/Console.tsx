"use client";

import { useEffect, useState } from "react";
import { ConsoleInner } from "./ConsoleInner";

const STORAGE_KEY = "ember-session-id";

export function Console() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, id);
    }
    // Reading localStorage only works on the client, so the first (server)
    // render intentionally shows the boot screen below and this effect
    // synchronizes it with the persisted session id right after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSessionId(id);
  }, []);

  if (!sessionId) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-[var(--color-gold)] pulse-gold text-sm">
          booting sandbox<span className="cursor-blink">_</span>
        </p>
      </div>
    );
  }

  return <ConsoleInner sessionId={sessionId} />;
}

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TiptapEditor } from "@/components/admin/editor";
import { saveNow } from "@/app/admin/now/actions";

export function NowEditor({ initial }: { initial: { body: unknown } }) {
  const [body, setBody] = useState<unknown>(initial.body);
  const [pending, setPending] = useState(false);

  async function save() {
    setPending(true);
    try {
      const res = await saveNow({ body });
      if (!res.ok) toast.error(res.error ?? "Save failed");
      else toast.success("Saved");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <TiptapEditor
        value={body}
        onChange={setBody}
        placeholder="What are you focused on right now?"
      />
      <div className="flex justify-end">
        <Button onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

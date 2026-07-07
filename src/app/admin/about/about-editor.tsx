"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TiptapEditor } from "@/components/admin/editor";
import { saveAbout } from "@/app/admin/about/actions";

type Form = {
  heroHeadline: string;
  heroSubheadline: string;
  aboutBody: unknown;
};

export function AboutEditor({ initial }: { initial: Form }) {
  const [state, setState] = useState<Form>(initial);
  const [pending, setPending] = useState(false);

  async function save() {
    setPending(true);
    try {
      const res = await saveAbout({
        heroHeadline: state.heroHeadline,
        heroSubheadline: state.heroSubheadline,
        aboutBody: state.aboutBody ? JSON.stringify(state.aboutBody) : "",
      });
      if (!res.ok) toast.error(res.error ?? "Save failed");
      else toast.success("Saved");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="heroHeadline">Hero headline</Label>
        <Input
          id="heroHeadline"
          value={state.heroHeadline}
          onChange={(e) => setState({ ...state, heroHeadline: e.target.value })}
          placeholder="Analytics engineer."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="heroSubheadline">Hero subheadline</Label>
        <Textarea
          id="heroSubheadline"
          rows={3}
          value={state.heroSubheadline}
          onChange={(e) => setState({ ...state, heroSubheadline: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>About body</Label>
        <TiptapEditor
          value={state.aboutBody}
          onChange={(json) => setState({ ...state, aboutBody: json })}
          placeholder="Long-form about text shown on /about..."
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

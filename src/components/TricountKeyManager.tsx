import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Trash } from "lucide-react";
import { Loader2 } from "lucide-react"; // shadcn loading spinner
import GitHubButton from 'react-github-btn'

export default function TricountKeyManager() {
  const [keys, setKeys] = useState<{ key: string; title: string; emoji: string }[]>([]);
  const [newKey, setNewKey] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/keyHandler")
      .then(res => res.json())
      .then(data => setKeys(data))
      .finally(() => setLoading(false));
  }, []);

  function addKey() {
    setLoading(true);
    fetch("/api/keyHandler", {
      method: "POST",
      body: JSON.stringify({ key: newKey }),
      headers: { "Content-Type": "application/json" },
    })
      .then(res => res.json())
      .then(data => setKeys(data))
      .finally(() => setLoading(false));
    setNewKey("");
    setDialogOpen(false);
  }

  function deleteKey(key: string) {
    setLoading(true);
    fetch("/api/keyHandler", {
      method: "DELETE",
      body: JSON.stringify({ key }),
      headers: { "Content-Type": "application/json" },
    })
      .then(res => res.json())
      .then(data => setKeys(data))
      .finally(() => setLoading(false));
  }

  function openDashboard(key: string) {
    window.location.href = `/detail?tricountKey=${key}`;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-8 text-center">Tricount Webstats</h1>
      <Card className="mb-4 w-full max-w-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <span className="text-xl font-semibold">Deine Tricounts</span>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary">Tricount hinzufügen</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Neuen Tricount-Key anlegen</DialogTitle>
                </DialogHeader>
                <Input
                  placeholder="TricountKey eingeben"
                  value={newKey}
                  onChange={e => setNewKey(e.target.value)}
                  className="mb-2"
                />
                <DialogFooter>
                  <Button onClick={addKey}>Speichern</Button>
                  <DialogClose asChild>
                    <Button variant="outline">Abbrechen</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center my-6">
              <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
            </div>
          ) : (
            <>
              {keys.length === 0 ? (
                <div className="text-gray-400">Keine gespeicherten Tricounts.</div>
              ) : (
                <ul>
                  {keys.map(({ key, emoji, title }) => (
                    <li key={key} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <Button variant="ghost" className="mr-2 flex items-center space-x-2" onClick={() => openDashboard(key)}>
                        <span className="text-2xl">{emoji}</span>
                        <span className="font-semibold">{title}</span>
                        <span className="text-xs text-gray-400 ml-2">{key}</span>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteKey(key)}>
                        <Trash className="w-4 h-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </CardContent>
      </Card>
      {/* Vertically aligning text and github button */}
      <div className="flex flex-col items-center text-center text-gray-500 text-sm mt-4">
        <p className="mb-4">Like what you're seeing? Star this project on GitHub (it's free!)</p>
        <GitHubButton href="https://github.com/fj-solutions/tricount-webstats" data-color-scheme="no-preference: light; light: light; dark: light;" data-icon="octicon-star" data-size="large" aria-label="Star fj-solutions/tricount-webstats on GitHub">Star</GitHubButton>
      </div>
    </div>
  );
}

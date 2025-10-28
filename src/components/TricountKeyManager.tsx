import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Trash } from "lucide-react";

export default function TricountKeyManager() {
  const [keys, setKeys] = useState<string[]>([]);
  const [newKey, setNewKey] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetch("/api/keyHandler")
      .then(res => res.json())
      .then(setKeys);
  }, []);

  function addKey() {
    fetch("/api/keyHandler", {
      method: "POST",
      body: JSON.stringify({ key: newKey }),
      headers: { "Content-Type": "application/json" }
    })
      .then(res => res.json())
      .then(setKeys);
    setNewKey("");
    setDialogOpen(false);
  }

  function deleteKey(key: string) {
    fetch("/api/keyHandler", {
      method: "DELETE",
      body: JSON.stringify({ key }),
      headers: { "Content-Type": "application/json" }
    })
      .then(res => res.json())
      .then(setKeys);
  }

  function openDashboard(key: string) {
    window.location.href = `/detail?tricountKey=${key}`;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
        <div style={{ minWidth: "50%" }} className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-2xl">
            <h1 className="text-3xl font-bold mb-8 text-center">Tricount Webstats</h1>
            <Card className="mb-4">
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
                {keys.length === 0 ? (
                    <div className="text-gray-400">Keine gespeicherten Tricounts.</div>
                ) : (
                    <ul>
                    {keys.map(key => (
                        <li key={key} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <Button variant="link" className="mr-2" onClick={() => openDashboard(key)}>
                            {key}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteKey(key)}>
                            <Trash className="w-4 h-4" />
                        </Button>
                        </li>
                    ))}
                    </ul>
                )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

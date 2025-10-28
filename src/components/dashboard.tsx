import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface TricountMember {
  name: string;
  uuid: string;
  status: string;
}
interface TricountAllocation {
  name: string;
  uuid: string;
  value: string;
  currency: string;
  type: string;
  share_ratio: number;
}
interface TricountTransaction {
  id: number;
  created: string;
  updated: string;
  uuid: string;
  amount: string;
  currency: string;
  description: string;
  date: string;
  category: string;
  category_custom: string;
  type: string;
  type_transaction: string;
  whoPaid: string;
  allocations: TricountAllocation[];
  attachment: any[];
}
interface TricountData {
  title: string;
  emoji: string;
  currency: string;
  description: string;
  category: string;
  total: string;
  num_transactions: number;
  per_person: Record<string, number>;
  memberships: TricountMember[];
  transactions: TricountTransaction[];
}

const pastelColors = [
  "bg-pink-200 text-pink-800",
  "bg-yellow-200 text-yellow-800",
  "bg-green-200 text-green-800",
  "bg-blue-200 text-blue-800",
  "bg-purple-200 text-purple-800",
  "bg-orange-200 text-orange-800",
  "bg-teal-200 text-teal-800",
];


export default function Dashboard() {
  const [tricountKey, setTricountKey] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

    useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get("tricountKey");
    setTricountKey(key);
    }, []);

    useEffect(() => {
    if (!tricountKey) return; // Erst holen, wenn Key gültig!
    fetchData();
    }, [tricountKey]);

    console.log("Tricount Key:", tricountKey);

  async function fetchData() {
    if (!tricountKey) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/update?tricountKey=${tricountKey}`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="text-center py-10">⏳ Lade Daten...</div>;
  if (error) return <div className="text-center py-10 text-red-600">{error}</div>;
  if (!data) return null;

    const memberColorMap: Record<string, string> = {};
    if (data && data.memberships) {
        data.memberships.forEach((m, idx) => {
            getMemberColor(m.uuid, idx, memberColorMap);
        });
    }


  return (
    <div className="mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2 text-2xl font-semibold">
            <Button variant="ghost" onClick={() => window.history.back()}>←</Button>
            {data.emoji}
            {data.title}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-1">Beschreibung: {data.description}</div>
          <div className="mb-1">Währung: {data.currency}</div>
          <div className="flex items-center gap-4 mb-2 mt-2">
            <span>Gesamt: <strong>{data.total}</strong> €</span>
            <Button variant="secondary" onClick={fetchData}>↻ Aktualisieren</Button>
          </div>
        </CardContent>
      </Card>
      <Card className="mb-6">
        <CardHeader>Mitglieder</CardHeader>
        <CardContent className="flex gap-2 flex-wrap">
            {data.memberships.map((m, idx) => (
                <Badge
                    key={m.uuid}
                    className={memberColorMap[m.uuid] + " mr-1"}
                >
                    {m.name}
                </Badge>
            ))}
        </CardContent>
      </Card>
      <Card className="mb-6">
        <CardHeader>Transaktionen</CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Datum</TableCell>
                <TableCell>Kategorie</TableCell>
                <TableCell>Beschreibung</TableCell>
                <TableCell>Betrag</TableCell>
                <TableCell>Zahler</TableCell>
                <TableCell>Verteilung</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.transactions.map((t) => (
                <TableRow key={t.uuid}>
                  <TableCell>{formatGermanDate(t.date)}</TableCell>
                  <TableCell>{handleCategory(t.category, t.category_custom)}</TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>{t.description}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <span>Kategorie: {t.category}</span>
                          <div>Typ: {t.type}</div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>{t.amount} {t.currency}</TableCell>
                  <TableCell>{t.whoPaid}</TableCell>
                  <TableCell>
                    {t.allocations.map((a) => (
                        <Badge
                            key={a.uuid}
                            className={memberColorMap[a.uuid] + " mr-1"}
                        >
                            {a.name}: {a.value} {a.currency}
                        </Badge>
                    ))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-2 text-muted-foreground">
            Anzahl Transaktionen: {data.num_transactions}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>Verteilung</CardHeader>
        <CardContent>
          <ul>
            {data.per_person && Object.entries(data.per_person).map(([name, amount]) => (
              <li key={name}>
                <Badge variant="default">{name}: {Number(amount).toFixed(2)} €</Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );

    function formatGermanDate(dateStr: string): string {
        const [dt, tm] = dateStr.split(" ");
        const [year, month, day] = dt.split("-");
        const [hour, minute] = tm.split(":");
        return `${day}.${month}.${year} ${hour}:${minute} Uhr`;
    }

    function handleCategory(category: string, category_custom: string): string {
        return category === "OTHER" ? category_custom : category;
    }

    function getMemberColor(uuid: string | number, idx: number, colorMap: Record<string, string>) {
        if (!colorMap[uuid]) {
            colorMap[uuid] = pastelColors[idx % pastelColors.length];
        }
        return colorMap[uuid];
    }
}

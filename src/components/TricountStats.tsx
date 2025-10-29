import React, { useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
} from "recharts";

export interface TricountAllocation {
  name: string;
  value: number;
  currency?: string;
}

export interface TricountTransaction {
  id: string | number;
  date: string;
  description?: string;
  amount: number;
  currency?: string;
  category?: string;
  category_custom?: string;
  whoPaid?: string;
  allocations?: TricountAllocation[];
}

interface Props {
  transactions: TricountTransaction[];
  members?: { name: string; uuid?: string }[];
}

const colorPalette = [
  "#3b82f6",
  "#10b981",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#a855f7",
  "#22c55e",
];

function translateCategory(category: string): string {
  const map: Record<string, string> = {
    FOOD_AND_DRINK: "Essen & Trinken",
    TRANSPORT: "Transport",
    GROCERIES: "Lebensmittel",
    TRAVEL: "Reise & Unterkunft",
    SHOPPING: "Shopping",
    UNCATEGORIZED: "Unkategorisiert",
    OTHER: "Sonstiges",
  };
  return map[category] || category;
}

export default function TricountStats({
  transactions = [],
  members = [],
}: Props) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [memberFilter, setMemberFilter] = useState("");

  // Filter nach Zeitraum + Mitglied
  const filteredData = useMemo(() => {
    return transactions.filter((t) => {
      const date = new Date(t.date);
      const afterStart = startDate ? date >= new Date(startDate) : true;
      const beforeEnd = endDate
        ? date <= new Date(endDate + "T23:59:59")
        : true;

      let memberMatch = true;
      if (memberFilter && t.allocations?.length) {
        memberMatch = t.allocations.some((a) => a.name === memberFilter);
      }

      return afterStart && beforeEnd && memberMatch;
    });
  }, [transactions, startDate, endDate, memberFilter]);

  // Summen je Kategorie basierend auf Allocations (wer was zu bezahlen hat)
  const chartData = useMemo(() => {
    const sums: Record<string, number> = {};

    filteredData.forEach((t) => {
      const cat =
        t.category === "OTHER"
          ? t.category_custom || "Sonstiges"
          : translateCategory(t.category || "Unkategorisiert");

      if (t.allocations?.length) {
        t.allocations.forEach((a) => {
          if (!memberFilter || a.name === memberFilter) {
            sums[cat] = (sums[cat] || 0) + Math.abs(a.value || 0);
          }
        });
      } else {
        // Falls keine allocations existieren, auf Gesamtbetrag zurückgreifen
        sums[cat] = (sums[cat] || 0) + Math.abs(t.amount || 0);
      }
    });

    return Object.entries(sums)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredData, memberFilter]);

  // Summen je Mitglied (basierend auf Allocations)
  const memberTotals = useMemo(() => {
    const totals: Record<string, number> = {};

    filteredData.forEach((t) => {
      if (t.allocations?.length) {
        t.allocations.forEach((a) => {
          totals[a.name] = (totals[a.name] || 0) + Math.abs(a.value || 0);
        });
      }
    });

    return Object.entries(totals)
      .map(([member, total]) => ({ member, total }))
      .sort((a, b) => b.total - a.total);
  }, [filteredData]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Statistik-Übersicht</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filter */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Von:</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Bis:</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Mitglied:</label>
            <select
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="">Alle</option>
              {members.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setStartDate("");
              setEndDate("");
              setMemberFilter("");
            }}
          >
            Filter zurücksetzen
          </Button>
        </div>

        {/* Diagramm + Tabelle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pie Chart */}
          <div className="w-full h-80">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={entry.category}
                      fill={colorPalette[index % colorPalette.length]}
                    />
                  ))}
                  <LabelList
                    dataKey="amount"
                    position="outside"
                    formatter={(label: any) => {
                      const parsed = parseFloat(String(label));
                      const num = !isNaN(parsed) ? parsed : 0;
                      return `${num.toFixed(2)} €`;
                    }}
                  />
                </Pie>
                <Tooltip
                  formatter={(value: any) => {
                    const parsed = parseFloat(String(value));
                    const num = !isNaN(parsed) ? parsed : 0;
                    return `${num.toFixed(2)} €`;
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Tabelle: Summen pro Kategorie */}
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Kategorie</TableCell>
                  <TableCell className="text-right">Betrag (€)</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chartData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center text-gray-400 py-4"
                    >
                      Keine Daten im gewählten Zeitraum
                    </TableCell>
                  </TableRow>
                ) : (
                  chartData.map((item) => (
                    <TableRow key={item.category}>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className="text-right">
                        {item.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Gesamtsummen pro Mitglied */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">
            Gesamtausgaben (nach Anteil)
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Mitglied</TableCell>
                <TableCell className="text-right">Gesamt (€)</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberTotals.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center text-gray-400 py-4"
                  >
                    Keine Daten
                  </TableCell>
                </TableRow>
              ) : (
                memberTotals.map((m) => (
                  <TableRow key={m.member}>
                    <TableCell>{m.member}</TableCell>
                    <TableCell className="text-right">
                      {m.total.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

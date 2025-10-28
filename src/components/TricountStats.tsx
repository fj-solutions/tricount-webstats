import React, { useMemo, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectItem, SelectContent } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

// --- Shadcn Calendar/Popover Setup ---
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { addDays, format } from "date-fns";

const COLORS = [
  "#F472B6", "#FDE68A", "#6EE7B7", "#93C5FD", "#C4B5FD", "#FECACA", "#A7F3D0", "#FBCFE8"
];

// --- Date Range Picker (shadcn-style) ---
function DateRangeFilter({ value, onChange }) {
  const display =
    value?.from && value?.to
      ? `${format(value.from, "dd.MM.yyyy")} – ${format(value.to, "dd.MM.yyyy")}`
      : value?.from
        ? format(value.from, "dd.MM.yyyy")
        : "Zeitraum wählen";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[220px] justify-start text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {display}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="range"
          selected={value}
          onSelect={onChange}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}

// --- Die eigentliche Statistik-Komponente ---
export default function TricountStats({ transactions, members }) {
  const [dateRange, setDateRange] = useState<{ from?: Date, to?: Date }>({});
  const [memberFilter, setMemberFilter] = useState("");

  // Kategorienliste
  const categories = useMemo(() => {
    const cats = new Set();
    transactions.forEach(t => {
      const base = t.category === "OTHER" && t.category_custom ? t.category_custom : t.category;
      if (base) cats.add(base);
    });
    return Array.from(cats);
  }, [transactions]);

  const memberList = useMemo(() => members.map(m => m.name), [members]);

    const filteredTx = useMemo(() => {
    return transactions.filter(t => {
        let ok = true;
        if (dateRange.from) ok = ok && new Date(t.date) >= dateRange.from;
        if (dateRange.to)   ok = ok && new Date(t.date) <= addDays(dateRange.to, 1);
        // "all" bedeutet: kein Filter aktiv!
        if (memberFilter !== "all") {
        ok = ok && (
            t.whoPaid === memberFilter ||
            (t.allocations || []).some(a => a.name === memberFilter)
        );
        }
        return ok;
    });
    }, [transactions, dateRange, memberFilter]);



  // Kategorie-Gruppierung
  const statsByCategory = useMemo(() => {
    const sums: Record<string, number> = {};
    filteredTx.forEach(t => {
      const cat = t.category === "OTHER" && t.category_custom ? t.category_custom : t.category || "Sonstiges";
      if (!cat) return;
      sums[cat] = (sums[cat] || 0) + Math.abs(Number(t.amount));
    });
    return Object.entries(sums)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  }, [filteredTx]);

  const pieData = statsByCategory.map(row => ({
    name: row.category,
    value: row.total,
  }));

  return (
    <Card className="mt-10">
      <CardHeader>
        <span className="text-lg font-bold">Kategorie-Statistiken</span>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 items-end mb-6">
          {/* Zeitraum Picker */}
          <div>
            <span className="block text-xs mb-1">Zeitraum</span>
            <DateRangeFilter value={dateRange} onChange={setDateRange} />
            {dateRange.from && (
              <span className="block text-xs mt-1 text-muted-foreground">
                {format(dateRange.from, "dd.MM.yyyy")}
                {dateRange.to && <> – {format(dateRange.to, "dd.MM.yyyy")}</>}
              </span>
            )}
          </div>
          {/* Mitgliedsauswahl */}
          <div>
            <span className="block text-xs mb-1">Mitglied</span>
            <Select value={memberFilter} onValueChange={setMemberFilter} className="min-w-[120px]">
                <SelectContent>
                <SelectItem value="all">Alle Mitglieder</SelectItem>
                {memberList.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
                </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            className="mt-2"
            size="sm"
            onClick={() => { setDateRange({}); setMemberFilter(""); }}
          >
            Filter zurücksetzen
          </Button>
        </div>
        <div className="flex gap-10 flex-wrap">
          {/* PIE CHART */}
            <div className="w-[320px] min-w-[160px] min-h-[220px] h-[220px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%" cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Tabelle */}
          <div className="flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell as="th">Kategorie</TableCell>
                  <TableCell as="th" align="right">Gesamt</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statsByCategory.length > 0 ? statsByCategory.map(({ category, total }) => (
                  <TableRow key={category}>
                    <TableCell>{category}</TableCell>
                    <TableCell align="right">{Number(total).toFixed(2)} €</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-gray-500">Keine Daten</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

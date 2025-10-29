import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

/** Farbcodierung für Mitglieder (z. B. Zahlende oder Beteiligte) */
const memberColors = [
  "bg-blue-100 text-blue-800",
  "bg-green-100 text-green-800",
  "bg-purple-100 text-purple-800",
  "bg-amber-100 text-amber-800",
  "bg-rose-100 text-rose-800",
  "bg-cyan-100 text-cyan-800",
];

function getMemberColor(name: string, members: { name: string }[] = []): string {
  const index = members.findIndex((m) => m.name === name);
  return memberColors[index % memberColors.length] || "bg-gray-100 text-gray-800";
}

function translateCategory(category: string): string {
    const categoryMap: Record<string, string> = {
        "FOOD_AND_DRINK": "Food & Drink",
        "TRANSPORT": "Transport",
        "GROCERIES": "Groceries",
        "TRAVEL": "Accommodation",
        "SHOPPING": "Shopping",
        "UNCATEGORIZED": "Uncategorized",
        "OTHER": "OTHER",

    };
    return categoryMap[category] || category;
}


export default function TricountTransactionTable({ transactions = [], members = [] }: Props) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Einzigartige Kategorien extrahieren
  const categories = useMemo(() => {
    const cats = new Set<string>();
    transactions.forEach((t) => {
      if (t.category === "OTHER" && t.category_custom) cats.add(t.category_custom);
      else if (t.category) cats.add(translateCategory(t.category));
    });
    return Array.from(cats);
  }, [transactions]);

  // Globale Filterung
  const filteredData = useMemo(() => {
    let data = transactions;
    if (globalFilter.trim()) {
      const f = globalFilter.toLowerCase();
      data = data.filter(
        (t) =>
          t.description?.toLowerCase().includes(f) ||
          t.category?.toLowerCase().includes(f) ||
          t.whoPaid?.toLowerCase().includes(f)
      );
    }
    if (categoryFilter) {
      data = data.filter((t) => {
        if (!t.category) return false;
        const cat = t.category === "OTHER" ? t.category_custom : translateCategory(t.category);
        return cat === categoryFilter;
      });
    }
    return data;
  }, [transactions, globalFilter, categoryFilter]);

  /** Spaltendefinitionen **/
  const columns = useMemo<ColumnDef<TricountTransaction>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        enableSorting: true,
        cell: ({ getValue }) => {
          const d = new Date(String(getValue()));
          return <span>{d.toLocaleDateString("de-DE")}</span>;
        },
      },
      {
        accessorKey: "category",
        header: "Category",
        enableSorting: false,
        cell: ({ row }) => {
          const { category, category_custom } = row.original;
          if (!category) return <span className="text-gray-400">—</span>;
          const label = category === "OTHER" ? category_custom || "Other" : translateCategory(category);
          return <Badge>{label}</Badge>;
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        enableSorting: false,
        cell: ({ getValue }) => <span>{String(getValue() || "")}</span>,
      },
      {
        accessorKey: "amount",
        header: "Amount",
        enableSorting: true,
        cell: ({ row }) => {
            const amt = Number(row.original.amount);
            const cur = row.original.currency || "€";
            return (
            <>
                {isNaN(amt) ? row.original.amount : amt.toFixed(2)} {cur}
            </>
            );
        },
      },
      {
        accessorKey: "whoPaid",
        header: "Who paid?",
        enableSorting: true,
        cell: ({ row }) => {
          const name = row.original.whoPaid || "—";
          const color = getMemberColor(name, members);
          return <Badge className={color}>{name}</Badge>;
        },
      },
      {
        accessorKey: "allocations",
        header: "Distribution",
        enableSorting: false,
        cell: ({ row }) => {
          const allocs = row.original.allocations || [];
          if (!allocs.length) return <span className="text-gray-400">—</span>;
          return (
            <div className="flex flex-wrap gap-1">
              {allocs.map((a, idx) => (
                <Badge key={idx} className={getMemberColor(a.name, members)}>
                  {a.name}: {a.value} {a.currency || ""}
                </Badge>
              ))}
            </div>
          );
        },
      },
    ],
    [members]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const pageIndex = table.getState().pagination.pageIndex ?? 0;
  const pageSize = table.getState().pagination.pageSize ?? 10;

  return (
    <div className="w-full">
      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Input
          placeholder="Suche..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-64"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="">Alle Kategorien</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setGlobalFilter("");
            setCategoryFilter("");
          }}
        >
          Reset filters
        </Button>
      </div>

      {/* Tabelle */}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableCell
                  key={header.id}
                  className="cursor-pointer select-none"
                  onClick={
                    header.column.getCanSort()
                      ? header.column.getToggleSortingHandler()
                      : undefined
                  }
                >
                  <div className="flex items-center gap-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === "asc" && <span>↑</span>}
                    {header.column.getIsSorted() === "desc" && <span>↓</span>}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center text-gray-400 py-6">
                No data
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            ← Back
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next →
          </Button>
        </div>
        <div className="text-sm text-gray-600">
          Page {pageIndex + 1} of {table.getPageCount()}
        </div>
        <div>
          <select
            value={pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          >
            {[5, 10, 20, 50].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

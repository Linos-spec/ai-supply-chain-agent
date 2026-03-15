"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, Loader2, Eye, ArrowLeft, ArrowRight } from "lucide-react";

type EntityType = "materials" | "inventory" | "demand" | "supply" | "suppliers";

const ENTITY_TYPES: { value: EntityType; label: string; description: string; expectedColumns: string[] }[] = [
  { value: "materials", label: "Materials", description: "Material master data (materialId, description, productFamily)", expectedColumns: ["materialId", "description", "productFamily"] },
  { value: "inventory", label: "Inventory", description: "Stock levels (materialId, locationId, onHandQty, availableQty)", expectedColumns: ["materialId", "locationId", "onHandQty", "availableQty"] },
  { value: "demand", label: "Demand", description: "Demand forecasts (materialId, locationId, demandQty, demandDate)", expectedColumns: ["materialId", "locationId", "demandQty", "demandDate"] },
  { value: "supply", label: "Supply / POs", description: "Purchase orders (supplyId, materialId, supplierId, supplyQty, deliveryDate)", expectedColumns: ["supplyId", "materialId", "supplierId", "supplyQty", "deliveryDate"] },
  { value: "suppliers", label: "Suppliers", description: "Supplier data (supplierId, name, country, reliabilityScore)", expectedColumns: ["supplierId", "name", "country", "reliabilityScore"] },
];

interface ImportResult { success: boolean; message: string; count?: number; errors?: string[] }
interface PreviewData { headers: string[]; rows: Record<string, unknown>[]; totalRows: number; warnings: string[] }

export default function DataImportPage() {
  const [selectedType, setSelectedType] = useState<EntityType>("materials");
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [step, setStep] = useState<"select" | "preview" | "result">("select");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f); setResult(null); setPreview(null); setStep("select");
    try {
      const text = await f.text();
      let records: Record<string, unknown>[] = [];
      if (f.name.endsWith(".json")) {
        records = JSON.parse(text);
      } else if (f.name.endsWith(".csv")) {
        const lines = text.split("\n").filter(Boolean);
        if (lines.length > 0) {
          const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
          records = lines.slice(1).map((line) => {
            const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
            const obj: Record<string, unknown> = {};
            headers.forEach((h, i) => { obj[h] = values[i] || ""; });
            return obj;
          });
        }
      }
      const headers = records.length > 0 ? Object.keys(records[0]) : [];
      const entity = ENTITY_TYPES.find((t) => t.value === selectedType);
      const warnings: string[] = [];
      if (entity) {
        const missing = entity.expectedColumns.filter((col) => !headers.some((h) => h.toLowerCase().replace(/_/g, "") === col.toLowerCase().replace(/_/g, "")));
        if (missing.length > 0) warnings.push(`Missing expected column${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}`);
      }
      records.slice(0, 10).forEach((row, idx) => {
        const emptyFields = Object.entries(row).filter(([, v]) => v === "" || v === null || v === undefined);
        if (emptyFields.length > 0) warnings.push(`Row ${idx + 1}: empty value${emptyFields.length > 1 ? "s" : ""} in ${emptyFields.map(([k]) => k).join(", ")}`);
      });
      setPreview({ headers, rows: records.slice(0, 5), totalRows: records.length, warnings: warnings.slice(0, 8) });
    } catch { setPreview(null); }
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true); setResult(null);
    const formData = new FormData();
    formData.append("file", file); formData.append("type", selectedType);
    try {
      const res = await fetch("/api/ingest", { method: "POST", body: formData });
      const data = await res.json();
      setResult(data); setStep("result");
    } catch { setResult({ success: false, message: "Import failed." }); setStep("result"); }
    setImporting(false);
  };

  return (
    <div>
      <Header title="Data Import" />
      <div className="space-y-6 p-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">Import supply chain data from CSV, Excel, or JSON files.</p>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{step === "select" ? "Upload Data File" : step === "preview" ? "Preview & Validate" : "Import Results"}</CardTitle>
                    <CardDescription>{step === "select" ? "Select the data type and upload a file." : step === "preview" ? `Reviewing ${preview?.totalRows || 0} rows.` : "Import completed."}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {["select", "preview", "result"].map((s, i) => (
                      <div key={s} className="flex items-center gap-1">
                        <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${step === s ? "bg-blue-600 text-white" : i < ["select", "preview", "result"].indexOf(step) ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>{i + 1}</div>
                        {i < 2 && <div className="h-0.5 w-4 bg-gray-200" />}
                      </div>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {step === "select" && (
                  <>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Data Type</label>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                        {ENTITY_TYPES.map((type) => (
                          <button key={type.value} onClick={() => setSelectedType(type.value)} className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${selectedType === type.value ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"}`}>{type.label}</button>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-gray-400">{ENTITY_TYPES.find((t) => t.value === selectedType)?.description}</p>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">File</label>
                      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-6 py-8 text-center hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 w-full">
                        <input type="file" accept=".csv,.xlsx,.xls,.json" onChange={handleFileChange} className="hidden" />
                        <div className="flex flex-col items-center gap-2 w-full">
                          <FileSpreadsheet className="h-8 w-8 text-gray-400" />
                          {file ? <span className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</span> : <span className="text-sm text-gray-500">Click to select CSV, XLSX, or JSON file</span>}
                        </div>
                      </label>
                    </div>
                    {preview && (
                      <Button onClick={() => setStep("preview")} className="w-full" variant="outline">
                        <Eye className="mr-2 h-4 w-4" /> Preview Data ({preview.totalRows} rows)
                      </Button>
                    )}
                    <Button onClick={handleImport} disabled={!file || importing} className="w-full">
                      {importing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing...</> : <><Upload className="mr-2 h-4 w-4" /> Import Directly</>}
                    </Button>
                  </>
                )}

                {step === "preview" && preview && (
                  <>
                    {preview.warnings.length > 0 && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800/50 dark:bg-amber-950/30">
                        <div className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-300"><AlertTriangle className="h-4 w-4" /> Validation Warnings ({preview.warnings.length})</div>
                        <ul className="mt-2 space-y-0.5 text-xs text-amber-700 dark:text-amber-400">{preview.warnings.map((w, i) => <li key={i}>• {w}</li>)}</ul>
                      </div>
                    )}
                    <div>
                      <p className="mb-2 text-xs font-medium text-gray-500">Detected columns ({preview.headers.length}):</p>
                      <div className="flex flex-wrap gap-1.5">
                        {preview.headers.map((h) => {
                          const entity = ENTITY_TYPES.find((t) => t.value === selectedType);
                          const isExpected = entity?.expectedColumns.some((c) => c.toLowerCase().replace(/_/g, "") === h.toLowerCase().replace(/_/g, ""));
                          return <span key={h} className={`rounded-md px-2 py-0.5 text-xs font-medium ${isExpected ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>{h} {isExpected && "✓"}</span>;
                        })}
                      </div>
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                      <table className="w-full text-xs">
                        <thead><tr className="bg-gray-50 dark:bg-gray-900/50"><th className="px-3 py-2 text-left font-medium text-gray-400">#</th>{preview.headers.map((h) => <th key={h} className="px-3 py-2 text-left font-medium text-gray-500">{h}</th>)}</tr></thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {preview.rows.map((row, i) => <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30"><td className="px-3 py-1.5 text-gray-400">{i + 1}</td>{preview.headers.map((h) => <td key={h} className="max-w-[150px] truncate px-3 py-1.5 text-gray-700 dark:text-gray-300">{String(row[h] ?? "")}</td>)}</tr>)}
                        </tbody>
                      </table>
                      {preview.totalRows > 5 && <div className="border-t border-gray-100 bg-gray-50/50 px-3 py-1.5 text-center text-xs text-gray-400 dark:border-gray-800 dark:bg-gray-900/30">...and {preview.totalRows - 5} more rows</div>}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setStep("select")} className="flex-1"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                      <Button onClick={handleImport} disabled={importing} className="flex-1">{importing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing...</> : <><Upload className="mr-2 h-4 w-4" /> Confirm Import ({preview.totalRows} rows)</>}</Button>
                    </div>
                  </>
                )}

                {step === "result" && result && (
                  <>
                    <div className={`flex items-start gap-3 rounded-lg p-4 ${result.success ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950"}`}>
                      {result.success ? <CheckCircle className="h-5 w-5 text-green-600" /> : <AlertTriangle className="h-5 w-5 text-red-600" />}
                      <div>
                        <p className={`text-sm font-medium ${result.success ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"}`}>{result.message}</p>
                        {result.count !== undefined && <p className="text-xs text-green-600 dark:text-green-400">{result.count} records imported</p>}
                        {result.errors && result.errors.length > 0 && <ul className="mt-2 space-y-1 text-xs text-red-600 dark:text-red-400">{result.errors.slice(0, 10).map((err, i) => <li key={i}>• {err}</li>)}{result.errors.length > 10 && <li>...and {result.errors.length - 10} more</li>}</ul>}
                      </div>
                    </div>
                    <Button onClick={() => { setFile(null); setResult(null); setPreview(null); setStep("select"); }} variant="outline" className="w-full"><ArrowRight className="mr-2 h-4 w-4" /> Import Another File</Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader><CardTitle className="text-base">Supported Formats</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div><p className="font-medium text-gray-900 dark:text-white">CSV (.csv)</p><p>Comma-separated values with header row</p></div>
                <div><p className="font-medium text-gray-900 dark:text-white">Excel (.xlsx)</p><p>First sheet used, header row required</p></div>
                <div><p className="font-medium text-gray-900 dark:text-white">JSON (.json)</p><p>Array of objects with matching field names</p></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

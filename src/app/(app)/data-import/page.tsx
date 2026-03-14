"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

type EntityType = "materials" | "inventory" | "demand" | "supply" | "suppliers";

const ENTITY_TYPES: { value: EntityType; label: string; description: string }[] = [
  { value: "materials", label: "Materials", description: "Material master data (materialId, description, productFamily)" },
  { value: "inventory", label: "Inventory", description: "Stock levels (materialId, locationId, onHandQty, availableQty)" },
  { value: "demand", label: "Demand", description: "Demand forecasts (materialId, locationId, demandQty, demandDate)" },
  { value: "supply", label: "Supply / POs", description: "Purchase orders (supplyId, materialId, supplierId, supplyQty, deliveryDate)" },
  { value: "suppliers", label: "Suppliers", description: "Supplier data (supplierId, name, country, reliabilityScore)" },
];

interface ImportResult {
  success: boolean;
  message: string;
  count?: number;
  errors?: string[];
}

export default function DataImportPage() {
  const [selectedType, setSelectedType] = useState<EntityType>("materials");
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", selectedType);

    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ success: false, message: "Import failed. Please try again." });
    }
    setImporting(false);
  };

  return (
    <div>
      <Header title="Data Import" />
      <div className="space-y-6 p-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Import supply chain data from CSV, Excel, or JSON files. Data is mapped to the canonical supply chain model.
        </p>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Upload Data File</CardTitle>
                <CardDescription>Select the data type and upload a CSV, XLSX, or JSON file.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Data Type
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                    {ENTITY_TYPES.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setSelectedType(type.value)}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                          selectedType === type.value
                            ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    {ENTITY_TYPES.find((t) => t.value === selectedType)?.description}
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    File
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-6 py-8 text-center hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 w-full">
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls,.json"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center gap-2">
                        <FileSpreadsheet className="h-8 w-8 text-gray-400" />
                        {file ? (
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</span>
                        ) : (
                          <span className="text-sm text-gray-500">Click to select CSV, XLSX, or JSON file</span>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                <Button onClick={handleImport} disabled={!file || importing} className="w-full">
                  {importing ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing...</>
                  ) : (
                    <><Upload className="mr-2 h-4 w-4" /> Import Data</>
                  )}
                </Button>

                {result && (
                  <div className={`flex items-start gap-3 rounded-lg p-4 ${result.success ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950"}`}>
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <p className={`text-sm font-medium ${result.success ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"}`}>
                        {result.message}
                      </p>
                      {result.count !== undefined && (
                        <p className="text-xs text-green-600 dark:text-green-400">{result.count} records imported</p>
                      )}
                      {result.errors && result.errors.length > 0 && (
                        <ul className="mt-2 space-y-1 text-xs text-red-600 dark:text-red-400">
                          {result.errors.slice(0, 5).map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Supported Formats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">CSV (.csv)</p>
                  <p>Comma-separated values with header row</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Excel (.xlsx)</p>
                  <p>First sheet used, header row required</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">JSON (.json)</p>
                  <p>Array of objects with matching field names</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Calendar,
  TrendingUp,
  BarChart3,
  Scale,
  Tag,
  Loader2,
  FileText,
  AlertCircle
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { DailyCollection, WasteCategory, useGreenCityStore } from "@/store/greenCityStore";
import { collectionService } from "@/services/collection.service";
import { ReportExport } from "@/components/ui/ReportExport";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, Column, TableFilter } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

interface CollectionFormData {
  date: string;
  category: string;
  weightKg: string;
  remarks: string;
}

export default function CollectionsPage() {
  const store = useGreenCityStore();
  const [categories, setCategories] = useState<WasteCategory[]>([]);
  const [dailyCollections, setDailyCollections] = useState<DailyCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedRecord, setSelectedRecord] = useState<DailyCollection | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CollectionFormData>({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      category: "Food Waste",
      weightKg: "",
      remarks: "",
    },
  });

  const loadCategories = async () => {
    try {
      const cData = await collectionService.getCategories();
      setCategories(cData);
    } catch {
      toast.error("Failed to load categories.");
    }
  };

  const loadCollections = async () => {
    try {
      const data = await collectionService.getDailyCollections();
      setDailyCollections(data);
    } catch {
      toast.error("Failed to load daily collections.");
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadCategories();
      await loadCollections();
      setIsLoading(false);
    };
    init();
  }, [store.categories]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const formatTime = (isoStr: string) => {
    if (!isoStr) return "-";
    const d = new Date(isoStr);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const currentMonthNum = new Date().getMonth();
    const currentYearNum = new Date().getFullYear();

    let todayTotal = 0;
    let thisMonthTotal = 0;
    const catTotals: Record<string, number> = {};
    const uniqueDays = new Set<string>();
    let totalWeightAllTime = 0;

    dailyCollections.forEach((c) => {
      const cWeight = c.weightKg;
      totalWeightAllTime += cWeight;
      uniqueDays.add(c.date);

      if (c.date === todayStr) {
        todayTotal += cWeight;
      }

      const cDateObj = new Date(c.date);
      if (cDateObj.getMonth() === currentMonthNum && cDateObj.getFullYear() === currentYearNum) {
        thisMonthTotal += cWeight;
      }

      catTotals[c.category] = (catTotals[c.category] || 0) + cWeight;
    });

    let mostCollected = "None";
    let maxWeight = 0;
    Object.entries(catTotals).forEach(([cat, weight]) => {
      if (weight > maxWeight) {
        maxWeight = weight;
        mostCollected = cat;
      }
    });

    const avgDaily = uniqueDays.size > 0 ? totalWeightAllTime / uniqueDays.size : 0;

    return {
      todayTotal: todayTotal.toLocaleString(),
      thisMonthTotal: thisMonthTotal.toLocaleString(),
      mostCollected,
      avgDaily: Math.round(avgDaily).toLocaleString(),
    };
  }, [dailyCollections]);

  const handleAddCollection = async (data: CollectionFormData) => {
    const qty = parseFloat(data.weightKg);
    if (isNaN(qty) || qty < 0) {
      toast.error("Collected quantity cannot be negative.");
      return;
    }

    try {
      const now = new Date().toISOString();
      await collectionService.createDailyCollection({
        date: data.date,
        category: data.category,
        weightKg: qty,
        remarks: data.remarks || undefined,
        recordedBy: "Council Admin",
        createdAt: now,
        updatedAt: now,
      });

      toast.success("Daily collection record created successfully.");
      setIsAddOpen(false);
      reset({
        date: new Date().toISOString().split("T")[0],
        category: "Food Waste",
        weightKg: "",
        remarks: "",
      });
    } catch {
      toast.error("Failed to add collection record.");
    }
  };

  const openEditModal = (record: DailyCollection) => {
    setSelectedRecord(record);
    setValue("date", record.date);
    setValue("category", record.category);
    setValue("weightKg", String(record.weightKg));
    setValue("remarks", record.remarks || "");
    setIsEditOpen(true);
  };

  const handleEditCollection = async (data: CollectionFormData) => {
    if (!selectedRecord) return;

    const qty = parseFloat(data.weightKg);
    if (isNaN(qty) || qty < 0) {
      toast.error("Collected quantity cannot be negative.");
      return;
    }

    try {
      await collectionService.updateDailyCollection(selectedRecord.id, {
        date: data.date,
        category: data.category,
        weightKg: qty,
        remarks: data.remarks || undefined,
      });

      toast.success("Collection record updated successfully.");
      setIsEditOpen(false);
      setSelectedRecord(null);
    } catch {
      toast.error("Failed to update collection record.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRecord) return;
    try {
      await collectionService.deleteDailyCollection(selectedRecord.id);
      toast.success("Collection record deleted successfully.");
      setIsDeleteOpen(false);
      setSelectedRecord(null);
    } catch {
      toast.error("Failed to delete record.");
    }
  };

  const handleAddCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      toast.error("Please enter a category name.");
      return;
    }
    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Category already exists.");
      return;
    }

    try {
      await collectionService.createCategory(trimmed);
      toast.success(`Category "${trimmed}" added.`);
      setNewCategoryName("");
      loadCategories();
    } catch {
      toast.error("Failed to add category.");
    }
  };

  const handleStartRename = (cat: WasteCategory) => {
    if (["Food Waste", "Plastic", "Polythene", "Paper", "Glass"].includes(cat.name)) {
      toast.error("Default categories cannot be renamed.");
      return;
    }
    setEditingCatId(cat.id);
    setEditingCatName(cat.name);
  };

  const handleSaveRename = async (id: string) => {
    const trimmed = editingCatName.trim();
    if (!trimmed) {
      toast.error("Category name cannot be empty.");
      return;
    }

    try {
      await collectionService.renameCategory(id, trimmed);
      toast.success("Category renamed successfully.");
      setEditingCatId(null);
      loadCategories();
    } catch {
      toast.error("Failed to rename category.");
    }
  };

  const handleDeleteCategory = async (cat: WasteCategory) => {
    if (["Food Waste", "Plastic", "Polythene", "Paper", "Glass"].includes(cat.name)) {
      toast.error("Default categories cannot be deleted.");
      return;
    }

    const isUsed = dailyCollections.some(
      (col) => col.category.toLowerCase() === cat.name.toLowerCase()
    );
    if (isUsed) {
      toast.error(`"${cat.name}" is currently used in collection records and cannot be deleted.`);
      return;
    }

    try {
      await collectionService.deleteCategory(cat.id);
      toast.success("Category deleted.");
      loadCategories();
    } catch {
      toast.error("Failed to delete category.");
    }
  };

  const tableData = useMemo(() => {
    return dailyCollections.map((c) => {
      const dObj = new Date(c.date);
      const mVal = String(dObj.getMonth() + 1);
      const yVal = String(dObj.getFullYear());
      return {
        ...c,
        month: mVal,
        year: yVal,
      };
    });
  }, [dailyCollections]);

  const monthFilterOptions = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const yearFilterOptions = useMemo(() => {
    const years = new Set<string>();
    dailyCollections.forEach((c) => {
      years.add(c.date.split("-")[0]);
    });
    years.add(String(new Date().getFullYear()));
    return Array.from(years)
      .sort((a, b) => b.localeCompare(a))
      .map((y) => ({ value: y, label: y }));
  }, [dailyCollections]);

  const categoryFilterOptions = useMemo(() => {
    return categories.map((c) => ({ value: c.name, label: c.name }));
  }, [categories]);

  const tableFilters: TableFilter[] = [
    { key: "category", label: "Category", options: categoryFilterOptions },
    { key: "month", label: "Month", options: monthFilterOptions },
    { key: "year", label: "Year", options: yearFilterOptions },
  ];

  const reportHeaders = [
    "Collection Date",
    "Waste Category",
    "Quantity (Kg)",
    "Recorded By",
    "Remarks",
    "Created Time",
    "Last Updated"
  ];

  const reportRows = useMemo(() => {
    const rows = tableData.map((c) => [
      formatDate(c.date),
      c.category,
      `${c.weightKg} Kg`,
      c.recordedBy,
      c.remarks || "-",
      formatTime(c.createdAt),
      formatTime(c.updatedAt)
    ]);

    if (tableData.length === 0) return rows;

    const grandTotalKg = tableData.reduce((sum, c) => sum + c.weightKg, 0);

    const monthlySummary: Record<string, number> = {};
    tableData.forEach((c) => {
      const monthYearStr = new Date(c.date).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
      });
      monthlySummary[monthYearStr] = (monthlySummary[monthYearStr] || 0) + c.weightKg;
    });

    rows.push(["", "", "", "", "", "", ""]);
    rows.push(["GRAND TOTAL", "", `${grandTotalKg.toLocaleString()} Kg`, "", "", "", ""]);
    rows.push(["", "", "", "", "", "", ""]);
    rows.push(["MONTHLY SUMMARY", "Total Weight (Kg)", "", "", "", "", ""]);
    Object.entries(monthlySummary).forEach(([my, kgSum]) => {
      rows.push([my, `${kgSum.toLocaleString()} Kg`, "", "", "", "", ""]);
    });

    return rows;
  }, [tableData]);

  const columns: Column<any>[] = [
    {
      key: "date",
      header: "Collection Date",
      sortable: true,
      render: (item) => <span className="font-bold">{formatDate(item.date)}</span>,
    },
    {
      key: "category",
      header: "Waste Category",
      sortable: true,
      render: (item) => {
        const cat = item.category;
        const variant =
          cat === "Food Waste"
            ? "success"
            : cat === "Plastic"
              ? "info"
              : cat === "Polythene"
                ? "default"
                : cat === "Paper"
                  ? "warning"
                  : "error";
        return <Badge variant={variant}>{cat}</Badge>;
      },
    },
    {
      key: "weightKg",
      header: "Collected Quantity (Kg)",
      sortable: true,
      render: (item) => (
        <span className="font-black text-primary-green">{item.weightKg.toLocaleString()} Kg</span>
      ),
    },
    {
      key: "recordedBy",
      header: "Recorded By",
      sortable: true,
      render: (item) => <span className="text-muted-text font-semibold">{item.recordedBy}</span>,
    },
    {
      key: "createdAt",
      header: "Created Time",
      sortable: true,
      render: (item) => <span className="text-muted-text">{formatTime(item.createdAt)}</span>,
    },
    {
      key: "updatedAt",
      header: "Last Updated",
      sortable: true,
      render: (item) => <span className="text-muted-text font-semibold">{formatTime(item.updatedAt)}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (item) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditModal(item)}
            className="p-1.5 h-8 w-8 rounded-full border-card-border hover:border-primary-green hover:text-primary-green cursor-pointer"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedRecord(item);
              setIsDeleteOpen(true);
            }}
            className="p-1.5 h-8 w-8 rounded-full text-red-500 hover:bg-red-500/5 hover:text-red-600 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Daily Waste Collection Register</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ReportExport
            title="Municipality Daily Waste Collection Report"
            headers={reportHeaders}
            rows={reportRows}
            filename="Municipal_Daily_Waste_Collections"
          />
          <Button
            onClick={() => {
              reset({
                date: new Date().toISOString().split("T")[0],
                category: "Food Waste",
                weightKg: "",
                remarks: "",
              });
              setIsAddOpen(true);
            }}
            variant="primary"
            size="sm"
            className="text-xs shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Daily Collection
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider block">Today's Total</span>
              <span className="text-xl font-black text-foreground mt-1 block">{stats.todayTotal} Kg</span>
            </div>
            <div className="p-3 rounded-2xl bg-primary-green/5 border border-primary-green/10 text-primary-green">
              <Calendar className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider block">This Month</span>
              <span className="text-xl font-black text-foreground mt-1 block">{stats.thisMonthTotal} Kg</span>
            </div>
            <div className="p-3 rounded-2xl bg-blue-500/5 border border-blue-500/10 text-blue-500">
              <BarChart3 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider block">Top Category</span>
              <span className="text-xl font-black text-foreground mt-1 block truncate max-w-[140px]" title={stats.mostCollected}>
                {stats.mostCollected}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-amber-500">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider block">Average Daily</span>
              <span className="text-xl font-black text-foreground mt-1 block">{stats.avgDaily} Kg</span>
            </div>
            <div className="p-3 rounded-2xl bg-purple-500/5 border border-blue-500/10 text-purple-500">
              <Scale className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card-bg border border-card-border rounded-3xl p-5 shadow-sm">
        {isLoading ? (
          <div className="py-20 flex justify-center items-center gap-2 text-xs font-bold text-muted-text">
            <Loader2 className="h-5 w-5 animate-spin text-primary-green" />
            Loading daily records...
          </div>
        ) : (
          <Table
            columns={columns}
            data={tableData}
            searchKeys={["date", "category"]}
            searchPlaceholder="Search by date or category..."
            filters={tableFilters}
            emptyTitle="No collection logs found"
            emptyDescription="Record daily waste collection data or check search queries and active filters."
            itemsPerPage={8}
            renderMobileCard={(item) => (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center pb-2 border-b border-card-border/50">
                  <span className="text-[12px] uppercase font-bold text-muted-text">Date</span>
                  <span className="font-bold text-[14.5px]">{formatDate(item.date)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-card-border/50">
                  <span className="text-[12px] uppercase font-bold text-muted-text">Category</span>
                  <Badge variant={item.category === "Food Waste" ? "success" : "info"}>{item.category}</Badge>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-card-border/50">
                  <span className="text-[12px] uppercase font-bold text-muted-text">Quantity</span>
                  <span className="font-black text-primary-green text-[14.5px]">{item.weightKg.toLocaleString()} Kg</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-card-border/50">
                  <span className="text-[12px] uppercase font-bold text-muted-text">Created / Updated</span>
                  <span className="text-muted-text text-xs">{formatTime(item.createdAt)} / {formatTime(item.updatedAt)}</span>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => openEditModal(item)} className="py-1 px-2.5 h-8 text-[11px] cursor-pointer">
                    <Edit2 className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedRecord(item);
                      setIsDeleteOpen(true);
                    }}
                    className="py-1 px-2.5 h-8 text-[11px] text-red-500 hover:bg-red-500/5 cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            )}
          />
        )}
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-card-border/60">
          <CardTitle className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
            <Tag className="h-4.5 w-4.5 text-primary-green" />
            Waste Category Manager
          </CardTitle>
          
        </CardHeader>
        <CardContent className="pt-6 space-y-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="E-Waste, Yard Waste, Hazardous..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>

            <Button
              onClick={handleAddCategory}
              variant="primary"
              size="sm"
              className="sm:w-40 h-[42px] cursor-pointer whitespace-nowrap"
            >
              <Plus className="h-4 w-4 mr-1.5 shrink-0" />
              Add Category
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((c) => {
              const isDefault = ["Food Waste", "Plastic", "Polythene", "Paper", "Glass"].includes(c.name);
              const isEditing = editingCatId === c.id;

              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-2xl border border-card-border bg-card-bg/30 px-4 py-3 shadow-sm hover:border-card-border/80 transition-all"
                >
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 w-full">
                      <input
                        type="text"
                        value={editingCatName}
                        onChange={(e) => setEditingCatName(e.target.value)}
                        className="flex-1 bg-muted-bg/50 border border-card-border rounded-xl px-2 py-1 text-xs font-bold text-foreground focus:border-primary-green outline-none"
                      />
                      <button
                        onClick={() => handleSaveRename(c.id)}
                        className="p-1 rounded bg-primary-green/10 text-primary-green hover:bg-primary-green/20"
                      >
                        <Save className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingCatId(null)}
                        className="p-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-xs font-bold text-foreground truncate max-w-[120px]">{c.name}</span>
                      <div className="flex items-center gap-1.5">
                        {isDefault ? (
                          <Badge variant="success">Protected</Badge>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStartRename(c)}
                              className="p-1 text-muted-text hover:text-primary-green transition-all"
                              title="Rename Category"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(c)}
                              className="p-1 text-muted-text hover:text-red-500 transition-all"
                              title="Delete Category"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Daily Waste Collection" className="max-w-md">
        <form onSubmit={handleSubmit(handleAddCollection)} className="space-y-4">
          <Input
            label="Collection Date *"
            type="date"
            error={errors.date?.message}
            {...register("date", { required: "Collection date is required." })}
          />
          <Select
            label="Waste Category *"
            options={categories.map((c) => ({ value: c.name, label: c.name }))}
            {...register("category", { required: "Waste category is required." })}
          />
          <Input
            label="Collected Quantity (Kg) *"
            type="number"
            placeholder="e.g. 1280"
            error={errors.weightKg?.message}
            {...register("weightKg", {
              required: "Quantity in Kg is required.",
              validate: (val) => parseFloat(val) >= 0 || "Quantity cannot be negative."
            })}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-bold uppercase tracking-wider text-muted-text px-1">
              Remarks (Optional)
            </label>
            <textarea
              placeholder="Enter special remarks or notes..."
              className="w-full px-4 py-2.5 rounded-2xl border border-card-border bg-card-bg/40 text-foreground text-[14.5px] outline-none transition-all duration-300 focus:border-primary-green min-h-[80px]"
              {...register("remarks")}
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-card-border">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Log Collection
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Waste Collection Record" className="max-w-md">
        <form onSubmit={handleSubmit(handleEditCollection)} className="space-y-4">
          <Input
            label="Collection Date *"
            type="date"
            error={errors.date?.message}
            {...register("date", { required: "Collection date is required." })}
          />
          <Select
            label="Waste Category *"
            options={categories.map((c) => ({ value: c.name, label: c.name }))}
            {...register("category", { required: "Waste category is required." })}
          />
          <Input
            label="Collected Quantity (Kg) *"
            type="number"
            error={errors.weightKg?.message}
            {...register("weightKg", {
              required: "Quantity in Kg is required.",
              validate: (val) => parseFloat(val) >= 0 || "Quantity cannot be negative."
            })}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-bold uppercase tracking-wider text-muted-text px-1">
              Remarks (Optional)
            </label>
            <textarea
              className="w-full px-4 py-2.5 rounded-2xl border border-card-border bg-card-bg/40 text-foreground text-[14.5px] outline-none transition-all duration-300 focus:border-primary-green min-h-[80px]"
              {...register("remarks")}
            />
          </div>
          <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start gap-2.5 text-xs text-amber-600 font-medium">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Confirming these modifications will recalculate municipal totals and analytics reports instantly.</span>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-card-border">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Modifications
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Collection Record"
        description="Are you sure you want to permanently delete this daily waste collection log?"
        confirmText="Confirm Delete"
      />
    </div>
  );
}

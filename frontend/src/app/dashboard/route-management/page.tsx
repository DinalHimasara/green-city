"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Plus, Edit3, Trash2, Navigation, Loader2 } from "lucide-react";
import { useForm, FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import { RouteAssignment, Driver, WasteCategory } from "@/store/greenCityStore";
import { routeService } from "@/services/route.service";
import { driverService } from "@/services/driver.service";
import { collectionService } from "@/services/collection.service";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, Column } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface RouteFormData {
  driverId: string;
  routeName: string;
  date: string;
  category: string;
  estimatedDistanceKm: string;
}

function today() {
  return new Date().toLocaleDateString("en-CA");
}

export default function RouteManagementPage() {
  const [routes, setRoutes] = useState<RouteAssignment[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [categories, setCategories] = useState<WasteCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [editingRoute, setEditingRoute] = useState<RouteAssignment | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<RouteAssignment | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RouteFormData>({
    defaultValues: {
      driverId: "",
      routeName: "",
      date: today(),
      category: "Food Waste",
      estimatedDistanceKm: "12.5",
    },
  });

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [rData, dData, cData] = await Promise.all([
        routeService.getAll(),
        driverService.getAll(),
        collectionService.getCategories(),
      ]);
      setRoutes(rData);
      setDrivers(dData);
      setCategories(cData);
    } catch {
      toast.error("Failed to load route assignments database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const driverOptions = useMemo(() => {
    return drivers
      .filter((d) => d.vehicleNo && d.vehicleNo !== "-")
      .map((d) => ({
        value: d.id,
        label: `${d.name} (${d.vehicleNo})`,
      }));
  }, [drivers]);

  const handleOpenAdd = () => {
    setEditingRoute(null);
    reset({
      driverId: driverOptions[0]?.value || "",
      routeName: "",
      date: today(),
      category: categories[0]?.name || "Food Waste",
      estimatedDistanceKm: "12.5",
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (route: RouteAssignment) => {
    setEditingRoute(route);
    reset({
      driverId: route.driverId,
      routeName: route.routeName || "",
      date: route.date,
      category: route.category,
      estimatedDistanceKm: String(route.estimatedDistanceKm),
    });
    setIsOpen(true);
  };

  const onSubmit = async (data: RouteFormData) => {
    const distance = parseFloat(data.estimatedDistanceKm) || 10;
    setIsSaving(true);
    try {
      if (editingRoute) {
        await routeService.update(editingRoute.id, {
          driverId: data.driverId,
          routeName: data.routeName,
          date: data.date,
          category: data.category,
          estimatedDistanceKm: distance,
        });
        toast.success("Route assignment details modified.");
      } else {
        await routeService.create({
          driverId: data.driverId,
          routeName: data.routeName,
          date: data.date,
          category: data.category,
          estimatedDistanceKm: distance,
          status: "Pending",
        });
        toast.success("New route successfully scheduled.");
      }
      setIsOpen(false);
      loadAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to update route assignments.");
    } finally {
      setIsSaving(false);
    }
  };

  const onInvalid = (formErrors: FieldErrors<RouteFormData>) => {
    const first = Object.values(formErrors)[0] as { message?: string } | undefined;
    toast.error((first && first.message) || "Please check the form fields.");
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRoute) return;
    try {
      await routeService.delete(selectedRoute.id);
      toast.success("Route assignment deleted.");
      loadAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete route.");
    } finally {
      setIsDeleteOpen(false);
      setSelectedRoute(null);
    }
  };

  const upcomingDistance = useMemo(() => {
    const t = today();
    return routes
      .filter((r) => r.date >= t)
      .reduce((sum, r) => sum + r.estimatedDistanceKm, 0)
      .toFixed(1);
  }, [routes]);

  const columns: Column<RouteAssignment>[] = [
    {
      key: "driverId",
      header: "Driver & Truck",
      sortable: true,
      render: (item) => {
        const driver = drivers.find((d) => d.id === item.driverId);
        return (
          <div className="flex flex-col">
            <span className="font-bold text-foreground">{driver ? driver.name : "Deleted Driver"}</span>
            <span className="text-[9px] text-muted-text uppercase font-semibold">{driver?.vehicleNo || "N/A"}</span>
          </div>
        );
      },
    },
    {
      key: "routeName",
      header: "Route",
      sortable: true,
      render: (item) => <span className="font-semibold">{item.routeName || "-"}</span>,
    },
    {
      key: "date",
      header: "Collection Date",
      sortable: true,
    },
    {
      key: "category",
      header: "Waste Class",
      sortable: true,
      render: (item) => <Badge variant="default">{item.category}</Badge>,
    },
    {
      key: "estimatedDistanceKm",
      header: "Distance (Km)",
      sortable: true,
      render: (item) => <span>{item.estimatedDistanceKm} Km</span>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (item) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEdit(item)}
            className="p-1 h-7 w-7 rounded-full text-primary-green hover:bg-primary-green/5"
            title="Edit Route"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedRoute(item);
              setIsDeleteOpen(true);
            }}
            className="p-1 h-7 w-7 rounded-full text-red-500 hover:bg-red-500/5 hover:text-red-600"
            title="Delete Assignment"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Route Management</h2>
          <p className="text-xs text-muted-text mt-0.5">
            Assign trucks to routes. Drivers see the pending resident requests of the route&apos;s waste category in the mobile app.
          </p>
        </div>
        <Button onClick={handleOpenAdd} variant="primary" size="sm" className="text-xs shrink-0 cursor-pointer">
          <Plus className="h-4 w-4 mr-1.5" />
          Assign Route
        </Button>
      </div>

      <div className="p-4 bg-primary-green/5 border border-primary-green/10 rounded-2xl flex items-center gap-3">
        <div className="p-3 bg-primary-green/10 text-primary-green rounded-xl">
          <Navigation className="h-5 w-5 animate-pulse" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider block">Total upcoming route distance</span>
          <span className="text-lg font-black text-foreground mt-0.5 block">{upcomingDistance} Km</span>
        </div>
      </div>

      <div className="bg-card-bg border border-card-border rounded-3xl p-5 shadow-sm">
        {isLoading ? (
          <div className="py-20 flex justify-center items-center gap-2 text-xs font-bold text-muted-text">
            <Loader2 className="h-5 w-5 animate-spin text-primary-green" />
            Loading Routes...
          </div>
        ) : (
          <Table
            columns={columns}
            data={routes}
            searchKeys={["category", "driverId", "routeName"]}
            searchPlaceholder="Search by route or waste class..."
            emptyTitle="No routes scheduled"
            emptyDescription="Click Assign Route to schedule a truck collection."
            itemsPerPage={6}
          />
        )}
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editingRoute ? "Edit Route Details" : "Assign Collection Route"}
        className="max-w-md"
      >
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4">
          <Select
            label="Select Driver (with assigned truck) *"
            options={driverOptions}
            error={errors.driverId?.message}
            {...register("driverId", { required: "Driver selection is required." })}
          />
          <Input
            label="Route Name *"
            placeholder="Sirimalgoda Road"
            error={errors.routeName?.message}
            {...register("routeName", { required: "Route name is required." })}
          />
          <Input
            type="date"
            label="Assignment Date *"
            error={errors.date?.message}
            {...register("date", { required: "Assignment date is required." })}
          />
          <Select
            label="Waste Category *"
            options={categories.map((c) => ({ value: c.name, label: c.name }))}
            {...register("category")}
          />
          <Input
            label="Estimated Distance (Km) *"
            placeholder="12.5"
            error={errors.estimatedDistanceKm?.message}
            {...register("estimatedDistanceKm", { required: "Estimated distance is required." })}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-card-border">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : editingRoute ? "Save Changes" : "Assign Route"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Route Assignment"
        description="Are you sure you want to permanently delete this route assignment? This action cannot be undone."
        confirmText="Permanently Delete"
      />
    </div>
  );
}
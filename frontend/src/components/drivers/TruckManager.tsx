"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { vehicleService, Truck } from "@/services/vehicle.service";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, Column } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface TruckFormData {
  vechicleNumber: string;
  vechicleType: "Truck" | "Mini Truck";
  capacity: string;
  status: "Available" | "Collecting" | "Maintenance";
}

export default function TruckManager({ onChange, refreshKey }: { onChange?: () => void; refreshKey?: number }) {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null);
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TruckFormData>({
    defaultValues: { vechicleNumber: "", vechicleType: "Truck", capacity: "", status: "Available" },
  });

  const loadTrucks = async () => {
    try {
      setTrucks(await vehicleService.getAll());
    } catch (err: any) {
      toast.error(err.message || "Failed to load trucks.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrucks();
  }, [refreshKey]);

  const handleOpenAdd = () => {
    setEditingTruck(null);
    reset({ vechicleNumber: "", vechicleType: "Truck", capacity: "", status: "Available" });
    setIsOpen(true);
  };

  const handleOpenEdit = (truck: Truck) => {
    setEditingTruck(truck);
    setValue("vechicleNumber", truck.vechicleNumber);
    setValue("vechicleType", truck.vechicleType);
    setValue("capacity", String(truck.capacity));
    setValue("status", truck.status);
    setIsOpen(true);
  };

  const onSubmit = async (data: TruckFormData) => {
    const payload = {
      vechicleNumber: data.vechicleNumber.trim(),
      vechicleType: data.vechicleType,
      capacity: Number(data.capacity),
      status: data.status,
    };
    try {
      if (editingTruck) {
        await vehicleService.update(editingTruck.vechicleNumber, payload);
        toast.success("Truck updated successfully.");
      } else {
        await vehicleService.create(payload);
        toast.success("Truck added successfully.");
      }
      setIsOpen(false);
      loadTrucks();
      if (onChange) onChange();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTruck) return;
    try {
      await vehicleService.delete(selectedTruck.vechicleNumber);
      toast.success("Truck deleted successfully.");
      loadTrucks();
      if (onChange) onChange();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsDeleteOpen(false);
      setSelectedTruck(null);
    }
  };

  const columns: Column<Truck>[] = [
    {
      key: "vechicleNumber",
      header: "Truck Number",
      sortable: true,
      render: (item) => <span className="font-bold">{item.vechicleNumber}</span>,
    },
    {
      key: "vechicleType",
      header: "Type",
      sortable: true,
    },
    {
      key: "capacity",
      header: "Capacity (Kg)",
      sortable: true,
      render: (item) => <span>{item.capacity.toLocaleString()}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (item) => {
        const variant =
          item.status === "Available" ? "success" : item.status === "Collecting" ? "info" : "warning";
        return <Badge variant={variant}>{item.status}</Badge>;
      },
    },
    {
      key: "driverName",
      header: "Assigned Driver",
      render: (item) =>
        item.driverName ? (
          <span className="font-semibold">{item.driverName}</span>
        ) : (
          <span className="text-muted-text">Not assigned</span>
        ),
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
          >
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedTruck(item);
              setIsDeleteOpen(true);
            }}
            className="p-1 h-7 w-7 rounded-full text-red-500 hover:bg-red-500/5"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Truck Management</h2>
        </div>
        <Button onClick={handleOpenAdd} variant="primary" size="sm" className="text-xs shrink-0 cursor-pointer">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Truck
        </Button>
      </div>

      <div className="bg-card-bg border border-card-border rounded-3xl p-5 shadow-sm">
        {isLoading ? (
          <div className="py-16 flex justify-center items-center gap-2 text-xs font-bold text-muted-text">
            <Loader2 className="h-5 w-5 animate-spin text-primary-green" />
            Loading trucks...
          </div>
        ) : (
          <Table
            columns={columns}
            data={trucks}
            searchKeys={["vechicleNumber", "vechicleType", "driverName"]}
            searchPlaceholder="Search by truck number or driver..."
            emptyTitle="No trucks registered"
            emptyDescription="Click Add Truck to register the first truck."
            itemsPerPage={5}
          />
        )}
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editingTruck ? "Edit Truck" : "Add Truck"}
        className="max-w-md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Truck Number *"
            placeholder="WB-5670"
            error={errors.vechicleNumber?.message}
            {...register("vechicleNumber", { required: "Truck number is required." })}
          />
          <Select
            label="Truck Type *"
            options={[
              { value: "Truck", label: "Truck" },
              { value: "Mini Truck", label: "Mini Truck" },
            ]}
            {...register("vechicleType")}
          />
          <Input
            label="Capacity (Kg) *"
            type="number"
            placeholder="5000"
            error={errors.capacity?.message}
            {...register("capacity", {
              required: "Capacity is required.",
              validate: (val) => Number(val) >= 1 || "Capacity must be at least 1.",
            })}
          />
          <Select
            label="Status *"
            options={[
              { value: "Available", label: "Available" },
              { value: "Collecting", label: "Collecting" },
              { value: "Maintenance", label: "Maintenance" },
            ]}
            {...register("status")}
          />
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-card-border">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingTruck ? "Save Changes" : "Add Truck"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Truck"
        description="Are you sure you want to delete this truck?"
        confirmText="Delete Truck"
      />
    </div>
  );
}
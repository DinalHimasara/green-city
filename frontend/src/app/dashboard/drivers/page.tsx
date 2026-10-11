"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Plus, Edit3, Trash2, Download, Loader2 } from "lucide-react";
import { useForm, FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import { Driver } from "@/store/greenCityStore";
import { driverService } from "@/services/driver.service";
import { vehicleService, Truck } from "@/services/vehicle.service";
import { reportService } from "@/services/report.service";
import TruckManager from "@/components/drivers/TruckManager";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, Column } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface DriverFormData {
  name: string;
  nic: string;
  phone: string;
  email: string;
  password: string;
  vehicleNo: string;
  currentWard: string;
  status: "Online" | "Offline";
}

const ONLINE_WITHIN_SECONDS = 60;
const PRESENCE_REFRESH_MS = 10000;

const emptyForm: DriverFormData = {
  name: "",
  nic: "",
  phone: "",
  email: "",
  password: "",
  vehicleNo: "",
  currentWard: "Badulla Ward 03",
  status: "Online",
};

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [onlineIds, setOnlineIds] = useState<string[]>([]);
  const [availableTrucks, setAvailableTrucks] = useState<Truck[]>([]);
  const [truckRefresh, setTruckRefresh] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DriverFormData>({ defaultValues: emptyForm });

  const loadTrucks = async (currentTruck?: string) => {
    try {
      const trucks = await vehicleService.getAvailable(currentTruck);
      setAvailableTrucks(trucks);
      return trucks;
    } catch {
      setAvailableTrucks([]);
      return [];
    }
  };

  const loadDrivers = async () => {
    setIsLoading(true);
    try {
      setDrivers(await driverService.getAll());
      setTruckRefresh((n) => n + 1);
    } catch {
      toast.error("Failed to load drivers database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
    loadTrucks();
  }, []);

  useEffect(() => {
    const refreshPresence = async () => {
      if (document.hidden) return;
      try {
        const locations = await driverService.getLocations();
        const ids = locations
          .filter((l) => {
            const t = new Date(l.updatedAt).getTime();
            return Number.isFinite(t) && Date.now() - t < ONLINE_WITHIN_SECONDS * 1000;
          })
          .map((l) => l.id)
          .sort();
        setOnlineIds((prev) => (prev.join(",") === ids.join(",") ? prev : ids));
      } catch {}
    };

    refreshPresence();
    const timer = setInterval(refreshPresence, PRESENCE_REFRESH_MS);
    return () => clearInterval(timer);
  }, []);

  const tableData = useMemo<Driver[]>(() => {
    return drivers.map((d) => ({
      ...d,
      status: onlineIds.includes(d.id) ? "Online" : "Offline",
    }));
  }, [drivers, onlineIds]);

  const handleOpenAdd = () => {
    setEditingDriver(null);
    reset(emptyForm);
    setIsOpen(true);
    loadTrucks();
  };

  const handleOpenEdit = async (driver: Driver) => {
    setEditingDriver(driver);
    await loadTrucks(driver.vehicleNo);
    reset({
      ...emptyForm,
      name: driver.name,
      nic: driver.nic || "",
      phone: driver.phone,
      vehicleNo: driver.vehicleNo === "-" ? "" : driver.vehicleNo,
      currentWard: driver.currentWard,
    });
    setIsOpen(true);
  };

  const onSubmit = async (data: DriverFormData) => {
    setIsSaving(true);
    try {
      if (editingDriver) {
        await driverService.update(editingDriver.id, {
          name: data.name.trim(),
          nic: data.nic.trim(),
          phone: data.phone.trim(),
          vehicleNo:
            data.vehicleNo && data.vehicleNo !== editingDriver.vehicleNo ? data.vehicleNo : undefined,
        });
        toast.success("Driver details updated successfully.");
      } else {
        await driverService.create({
          ...data,
          name: data.name.trim(),
          nic: data.nic.trim(),
          phone: data.phone.trim(),
          email: data.email.trim(),
        });
        toast.success("New driver registered successfully.");
      }
      setIsOpen(false);
      loadDrivers();
      loadTrucks();
    } catch (err: any) {
      toast.error(err.message || "Error processing driver details.");
    } finally {
      setIsSaving(false);
    }
  };

  const onInvalid = (formErrors: FieldErrors<DriverFormData>) => {
    const first = Object.values(formErrors)[0] as { message?: string } | undefined;
    toast.error((first && first.message) || "Please check the form fields.");
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDriver) return;
    try {
      await driverService.delete(selectedDriver.id);
      toast.success("Driver profile deleted.");
      loadDrivers();
      loadTrucks();
    } catch (err: any) {
      toast.error(err.message || "Error removing driver profile.");
    } finally {
      setIsDeleteOpen(false);
      setSelectedDriver(null);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Driver Name", "Truck Number", "NIC", "Phone Number", "Duty Status"];
    const rows = tableData.map((d) => [d.name, d.vehicleNo, d.nic, d.phone, d.status]);
    reportService.exportToCSV(headers, rows, "GreenCity_Drivers_Report");
  };

  const columns: Column<Driver>[] = [
    {
      key: "name",
      header: "Driver Name",
      sortable: true,
    },
    {
      key: "vehicleNo",
      header: "Truck Number",
      sortable: true,
    },
    {
      key: "nic",
      header: "NIC",
      sortable: true,
      render: (item) => <span>{item.nic || "N/A"}</span>,
    },
    {
      key: "phone",
      header: "Phone Number",
      sortable: true,
    },
    {
      key: "status",
      header: "Duty Status",
      sortable: true,
      render: (item) => (
        <Badge variant={item.status === "Online" ? "success" : "default"}>{item.status}</Badge>
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
            title="Edit Details"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedDriver(item);
              setIsDeleteOpen(true);
            }}
            className="p-1 h-7 w-7 rounded-full text-red-500 hover:bg-red-500/5 hover:text-red-600"
            title="Delete Profile"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full pb-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Driver Management</h2>
          <p className="text-xs text-muted-text mt-0.5">
            Register drivers and assign trucks. Duty status is shown live from the driver&apos;s mobile app.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleExportCSV} variant="outline" size="sm" className="text-xs shrink-0 cursor-pointer">
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>
          <Button onClick={handleOpenAdd} variant="primary" size="sm" className="text-xs shrink-0 cursor-pointer">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Driver
          </Button>
        </div>
      </div>

      <div className="bg-card-bg border border-card-border rounded-3xl p-5 shadow-sm">
        {isLoading ? (
          <div className="py-20 flex justify-center items-center gap-2 text-xs font-bold text-muted-text">
            <Loader2 className="h-5 w-5 animate-spin text-primary-green" />
            Loading Driver Fleet...
          </div>
        ) : (
          <Table
            columns={columns}
            data={tableData}
            searchKeys={["name", "vehicleNo", "nic"]}
            searchPlaceholder="Search by name, truck or NIC..."
            emptyTitle="No drivers found"
            emptyDescription="Click Add Driver to register a crew member."
            itemsPerPage={6}
          />
        )}
      </div>

      <TruckManager onChange={() => loadTrucks()} refreshKey={truckRefresh} />

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editingDriver ? "Edit Driver Details" : "Register New Driver"}
        className="max-w-md"
      >
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4">
          <Input
            label="Driver Name *"
            placeholder="Kasun Perera"
            error={errors.name?.message}
            {...register("name", { required: "Driver name is required." })}
          />
          <Input
            label="NIC Number *"
            placeholder="921389429V"
            error={errors.nic?.message}
            {...register("nic", { required: "NIC number is required." })}
          />
          <Input
            label="Mobile Number *"
            placeholder="077-123-4567"
            error={errors.phone?.message}
            {...register("phone", { required: "Phone number is required." })}
          />

          {!editingDriver && (
            <>
              <Input
                label="Email Address (app login) *"
                type="email"
                placeholder="driver@greencity.com"
                error={errors.email?.message}
                {...register("email", { required: "Email is required." })}
              />
              <Input
                label="Password (app login) *"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password", {
                  required: "Password is required.",
                  minLength: { value: 8, message: "Password must be at least 8 characters." },
                })}
              />
            </>
          )}

          <Select
            label={editingDriver ? "Truck Number" : "Truck Number *"}
            options={[
              {
                value: "",
                label:
                  availableTrucks.length === 0
                    ? "No available trucks"
                    : editingDriver
                    ? "Keep current truck"
                    : "Select an available truck",
              },
              ...availableTrucks.map((t) => ({
                value: t.vechicleNumber,
                label: t.vechicleNumber + " (" + t.vechicleType + ")",
              })),
            ]}
            error={errors.vehicleNo?.message}
            {...register("vehicleNo", {
              required: editingDriver ? false : "Please select a truck.",
            })}
          />
          <Select
            label="Designated Ward Limit *"
            options={[
              { value: "Badulla Ward 01", label: "Badulla Ward 01 (Central)" },
              { value: "Badulla Ward 02", label: "Badulla Ward 02 (Eastern)" },
              { value: "Badulla Ward 03", label: "Badulla Ward 03 (Southern)" },
              { value: "Badulla Ward 04", label: "Badulla Ward 04 (Northern)" },
            ]}
            {...register("currentWard")}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-card-border">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : editingDriver ? "Save Changes" : "Register Driver"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Driver Profile"
        description={`Are you sure you want to permanently delete the profile of "${selectedDriver?.name}"? A driver who is assigned to a route cannot be deleted. The driver's truck will become available again.`}
        confirmText="Permanently Delete"
      />
    </div>
  );
}
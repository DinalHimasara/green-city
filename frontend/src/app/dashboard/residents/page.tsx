"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Plus, Trash2, MapPin, History, Download, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ResidentUser } from "@/store/greenCityStore";
import { residentService } from "@/services/resident.service";
import { requestService, WasteRequest } from "@/services/request.service";
import { reportService } from "@/services/report.service";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, Column } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";

const ResidentLocationMap = dynamic(
  () => import("@/components/dashboard/ResidentLocationMap"),
  {
  ssr: false,
  loading: () => (
    <div className="w-full h-[250px] rounded-2xl border border-card-border flex items-center justify-center text-xs font-bold text-muted-text">
      Loading map...
    </div>
  ),
});

interface ResidentFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  latitude: string;
  longitude: string;
}

const emptyForm: ResidentFormData = {
  name: "",
  email: "",
  phone: "",
  address: "",
  latitude: "",
  longitude: "",
};

function errorText(err: any, fallback: string) {
  return err?.response?.data?.message || err?.response?.data?.error || err?.message || fallback;
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function hasLocation(r: ResidentUser) {
  return Number.isFinite(r.latitude) && Number.isFinite(r.longitude) && (r.latitude !== 0 || r.longitude !== 0);
}

function logVariant(status: WasteRequest["status"]) {
  if (status === "Collected") return "success";
  if (status === "Assigned") return "info";
  if (status === "Pending") return "warning";
  return "default";
}

function logLabel(log: WasteRequest) {
  if (log.status === "Collected") return "Completed";
  if (log.status === "Other") return log.rawStatus || "Unknown";
  return log.status;
}

export default function ResidentsPage() {
  const [residents, setResidents] = useState<ResidentUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [selectedResident, setSelectedResident] = useState<ResidentUser | null>(null);

  const [logs, setLogs] = useState<WasteRequest[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResidentFormData>({ defaultValues: emptyForm });

  const loadResidents = async () => {
    setIsLoading(true);
    try {
      setResidents(await residentService.getAll());
    } catch {
      toast.error("Failed to load residents.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResidents();
  }, []);

  const handleOpenAdd = () => {
    reset(emptyForm);
    setIsFormOpen(true);
  };

  const onSubmit = async (data: ResidentFormData) => {
    const hasCoords = data.latitude.trim() !== "" && data.longitude.trim() !== "";
    const latitude = hasCoords ? Number(data.latitude) : 0;
    const longitude = hasCoords ? Number(data.longitude) : 0;

    if (hasCoords && (Number.isNaN(latitude) || Number.isNaN(longitude))) {
      toast.error("Latitude and longitude must be numbers.");
      return;
    }

    try {
      await residentService.create({
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        address: data.address.trim(),
        ward: "-",
        status: "Active",
        latitude,
        longitude,
      });
      toast.success("Resident registered successfully.");
      setIsFormOpen(false);
      loadResidents();
    } catch (err: any) {
      toast.error(errorText(err, "Error registering resident."));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedResident) return;
    try {
      await residentService.delete(selectedResident.id);
      toast.success("Resident profile deleted.");
      loadResidents();
    } catch (err: any) {
      toast.error(errorText(err, "Error removing resident profile."));
    } finally {
      setIsDeleteOpen(false);
      setSelectedResident(null);
    }
  };

  const openMap = (resident: ResidentUser) => {
    setSelectedResident(resident);
    setIsMapOpen(true);
  };

  const openHistory = async (resident: ResidentUser) => {
    setSelectedResident(resident);
    setLogs([]);
    setLogsError("");
    setIsHistoryOpen(true);

    if (!resident.firebaseUid) return;

    setLogsLoading(true);
    try {
      setLogs(await requestService.getByResident(resident.firebaseUid));
    } catch {
      setLogsError("Failed to load collection logs.");
    } finally {
      setLogsLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Citizen Name", "Email", "Phone", "Address", "Registered"];
    const rows = residents.map((r) => [r.name, r.email, r.phone, r.address, formatDate(r.createdAt)]);
    reportService.exportToCSV(headers, rows, "GreenCity_Residents_Report");
  };

  const columns: Column<ResidentUser>[] = [
    {
      key: "name",
      header: "Citizen Name",
      sortable: true,
    },
    {
      key: "email",
      header: "Email Address",
      sortable: true,
    },
    {
      key: "phone",
      header: "Phone Number",
      sortable: true,
    },
    {
      key: "actions",
      header: "Actions",
      render: (item) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openMap(item)}
            className="p-1 h-7 w-7 rounded-full text-blue-500 hover:bg-blue-500/5"
            title="View Location"
          >
            <MapPin className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => openHistory(item)}
            className="p-1 h-7 w-7 rounded-full text-blue-500 hover:bg-blue-500/5"
            title="Collection History"
          >
            <History className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedResident(item);
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

  const pendingCount = logs.filter((l) => l.status === "Pending").length;
  const completedCount = logs.filter((l) => l.status === "Collected").length;

  return (
    <div className="flex flex-col gap-6 w-full pb-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Resident Management</h2>
          <p className="text-xs text-muted-text mt-0.5">
            View citizen profiles, their locations and their waste collection history.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleExportCSV} variant="outline" size="sm" className="text-xs shrink-0 cursor-pointer">
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>
          <Button onClick={handleOpenAdd} variant="primary" size="sm" className="text-xs shrink-0 cursor-pointer">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Resident
          </Button>
        </div>
      </div>

      <div className="bg-card-bg border border-card-border rounded-3xl p-5 shadow-sm">
        {isLoading ? (
          <div className="py-20 flex justify-center items-center gap-2 text-xs font-bold text-muted-text">
            <Loader2 className="h-5 w-5 animate-spin text-primary-green" />
            Loading Residents...
          </div>
        ) : (
          <Table
            columns={columns}
            data={residents}
            searchKeys={["name", "email", "phone", "address"]}
            searchPlaceholder="Search by name, email, phone, or address..."
            emptyTitle="No residents found"
            emptyDescription="Residents registered in the mobile app appear here automatically."
            itemsPerPage={6}
          />
        )}
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Register New Resident"
        className="max-w-md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Citizen Name *"
            placeholder="Amara Perera"
            error={errors.name?.message}
            {...register("name", { required: "Name is required." })}
          />
          <Input
            label="Email Address *"
            type="email"
            placeholder="amara@example.com"
            error={errors.email?.message}
            {...register("email", { required: "Email is required." })}
          />
          <Input
            label="Phone Number *"
            placeholder="077-123-4567"
            error={errors.phone?.message}
            {...register("phone", { required: "Phone number is required." })}
          />
          <Input label="Address" placeholder="12 Library Road, Badulla" {...register("address")} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Latitude" placeholder="6.9934" {...register("latitude")} />
            <Input label="Longitude" placeholder="81.0550" {...register("longitude")} />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-card-border">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Register Resident
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        title={(selectedResident ? selectedResident.name : "") + "'s Location"}
        className="max-w-lg"
      >
        {selectedResident && hasLocation(selectedResident) ? (
          <ResidentLocationMap
            latitude={selectedResident.latitude}
            longitude={selectedResident.longitude}
            name={selectedResident.name}
          />
        ) : (
          <div className="py-8 text-center text-xs font-bold text-muted-text border border-dashed border-card-border rounded-2xl">
            No coordinates are registered for this resident.
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title={(selectedResident ? selectedResident.name : "") + "'s Collection Log History"}
        className="max-w-lg"
      >
        <div className="space-y-4">
          <p className="text-xs text-muted-text">
            Below is the full history of garbage dispatch requests reported by this citizen.
          </p>

          {logsLoading ? (
            <div className="py-10 flex justify-center items-center gap-2 text-xs font-bold text-muted-text">
              <Loader2 className="h-5 w-5 animate-spin text-primary-green" />
              Loading collection logs...
            </div>
          ) : logsError ? (
            <div className="py-8 text-center text-xs font-bold text-red-500">{logsError}</div>
          ) : logs.length === 0 ? (
            <div className="py-8 text-center text-xs font-bold text-muted-text border border-dashed border-card-border rounded-2xl">
              {selectedResident && !selectedResident.firebaseUid
                ? "This resident was added from the web panel and has no mobile app requests."
                : "No collection logs found for this resident."}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4 text-[11px] font-bold text-muted-text uppercase tracking-wider">
                <span>Total: {logs.length}</span>
                <span className="text-amber-500">Pending: {pendingCount}</span>
                <span className="text-green-500">Completed: {completedCount}</span>
              </div>
              <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl border border-card-border bg-card-bg/30 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground">{log.wasteType}</span>
                      <Badge variant={logVariant(log.status)}>{logLabel(log)}</Badge>
                    </div>
                    <span className="text-xs text-muted-text">{log.address || "No address"}</span>
                    <div className="flex items-center justify-between text-[11px] text-muted-text font-semibold">
                      <span>
                        Requested: {formatDate(log.createdAt)} {formatTime(log.createdAt)}
                      </span>
                      <span>{log.completedAt ? "Completed: " + formatDate(log.completedAt) : ""}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="flex justify-end pt-3 border-t border-card-border">
            <Button variant="ghost" size="sm" onClick={() => setIsHistoryOpen(false)} className="cursor-pointer">
              Close History
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Resident Profile"
        description={`Are you sure you want to permanently delete the profile of "${selectedResident?.name}"? Residents registered in the mobile app will also lose their login account.`}
        confirmText="Permanently Delete"
      />
    </div>
  );
}
"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { Plus, Edit3, Trash2, ShieldAlert, ShieldCheck, MapPin, History, Download, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ResidentUser, BinLocation } from "@/store/greenCityStore";
import { residentService } from "@/services/resident.service";
import { collectionService } from "@/services/collection.service";
import { reportService } from "@/services/report.service";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, Column } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";


const ResidentLocationMap = dynamic(
  () => import("@/components/dashboard/ResidentLocationMap"),
  {
    ssr: false,
    loading: () => <Skeleton className="w-full h-[250px] rounded-2xl" />,
  }
);

interface ResidentFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  ward: string;
  latitude: string;
  longitude: string;
  status: "Active" | "Suspended";
}

export default function ResidentsPage() {
  const [residents, setResidents] = useState<ResidentUser[]>([]);
  const [bins, setBins] = useState<BinLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [editingResident, setEditingResident] = useState<ResidentUser | null>(null);
  const [selectedResident, setSelectedResident] = useState<ResidentUser | null>(null);

  const [wardFilter, setWardFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ResidentFormData>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      ward: "Badulla Ward 03",
      latitude: "6.9934",
      longitude: "81.0550",
      status: "Active",
    },
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const resData = await residentService.getAll();
      const binData = await collectionService.getAllBins();
      setResidents(resData);
      setBins(binData);
    } catch {
      toast.error("Failed to load resident records.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingResident(null);
    reset({
      name: "",
      email: "",
      phone: "",
      address: "",
      ward: "Badulla Ward 03",
      latitude: "6.9934",
      longitude: "81.0550",
      status: "Active",
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (resident: ResidentUser) => {
    setEditingResident(resident);
    setValue("name", resident.name);
    setValue("email", resident.email);
    setValue("phone", resident.phone);
    setValue("address", resident.address);
    setValue("ward", resident.ward);
    setValue("latitude", String(resident.latitude || 6.9934));
    setValue("longitude", String(resident.longitude || 81.0550));
    setValue("status", resident.status);
    setIsOpen(true);
  };

  const onSubmit = async (data: ResidentFormData) => {
    try {
      const payload = {
        ...data,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
      };
      if (editingResident) {
        await residentService.update(editingResident.id, payload);
        toast.success("Resident details updated successfully.");
      } else {
        await residentService.create(payload);
        toast.success("New resident registered successfully.");
      }
      setIsOpen(false);
      reset();
      loadData();
    } catch {
      toast.error("Error saving resident profile.");
    }
  };

  const handleToggleStatus = async (resident: ResidentUser) => {
    try {
      const nextStatus = resident.status === "Active" ? "Suspended" as const : "Active" as const;
      await residentService.update(resident.id, { status: nextStatus });
      toast.success(`Resident account status changed to ${nextStatus}`);
      loadData();
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedResident) return;
    try {
      await residentService.delete(selectedResident.id);
      toast.success("Resident account deleted.");
      setIsDeleteOpen(false);
      setSelectedResident(null);
      loadData();
    } catch {
      toast.error("Failed to delete resident.");
    }
  };

  const handleExportCSV = () => {
    const headers = ["Full Name", "Email Address", "Phone Number", "Home Address", "Status", "Coordinates"];
    const rows = residents.map((r) => [
      r.name,
      r.email,
      r.phone,
      r.address,
      r.ward,
      r.status,
      `${r.latitude},${r.longitude}`,
    ]);
    reportService.exportToCSV(headers, rows, "GreenCity_Residents_Report");
  };

  const filteredResidents = useMemo(() => {
    return residents.filter((r) => {
      const wardMatch = wardFilter === "All" || r.ward === wardFilter;
      const statusMatch = statusFilter === "All" || r.status === statusFilter;
      return wardMatch && statusMatch;
    });
  }, [residents, wardFilter, statusFilter]);

  const residentHistory = useMemo(() => {
    if (!selectedResident) return [];
    return bins.filter((b) => b.reporterName.toLowerCase() === selectedResident.name.toLowerCase());
  }, [selectedResident, bins]);

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
      key: "status",
      header: "Status",
      sortable: true,
      render: (item) => {
        return <Badge variant={item.status === "Active" ? "success" : "error"}>{item.status}</Badge>;
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (item) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedResident(item);
              setIsLocationOpen(true);
            }}
            className="p-1 h-7 w-7 rounded-full text-blue-500 hover:bg-blue-500/5"
            title="View Location Coordinates"
          >
            <MapPin className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedResident(item);
              setIsHistoryOpen(true);
            }}
            className="p-1 h-7 w-7 rounded-full text-indigo-500 hover:bg-indigo-500/5"
            title="View Collection Logs"
          >
            <History className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleStatus(item)}
            className={`p-1 h-7 w-7 rounded-full transition-colors ${
              item.status === "Active" ? "text-amber-500 hover:bg-amber-500/5" : "text-green-500 hover:bg-green-500/5"
            }`}
            title={item.status === "Active" ? "Block Resident" : "Activate Resident"}
          >
            {item.status === "Active" ? (
              <ShieldAlert className="h-3.5 w-3.5" />
            ) : (
              <ShieldCheck className="h-3.5 w-3.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEdit(item)}
            className="p-1 h-7 w-7 rounded-full text-primary-green hover:bg-primary-green/5"
            title="Edit Profile"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedResident(item);
              setIsDeleteOpen(true);
            }}
            className="p-1 h-7 w-7 rounded-full text-red-500 hover:bg-red-500/5 hover:text-red-600"
            title="Delete Resident"
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
          <h2 className="text-xl font-extrabold text-foreground">Resident Directory</h2>
          <p className="text-xs text-muted-text mt-0.5">
            Audit registered municipal app users, update house locations, or lock suspended profiles.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleExportCSV} variant="outline" size="sm" className="text-xs shrink-0 cursor-pointer">
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>
          
        </div>
      </div>

      

      <div className="bg-card-bg border border-card-border rounded-3xl p-5 shadow-sm">
        {isLoading ? (
          <div className="py-20 flex justify-center items-center gap-2 text-xs font-bold text-muted-text">
            <Loader2 className="h-5 w-5 animate-spin text-primary-green" />
            Loading Residents Database...
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredResidents}
            searchKeys={["name", "email", "phone", "ward"]}
            searchPlaceholder="Search by name, email, phone, or ward..."
            emptyTitle="No citizens found"
            emptyDescription="Click Add Resident to register a new user profile."
            itemsPerPage={6}
          />
        )}
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editingResident ? "Edit Citizen Profile" : "Register New Resident"}
        className="max-w-md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name *"
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
            label="Mobile Number *"
            placeholder="077-123-4567"
            error={errors.phone?.message}
            {...register("phone", { required: "Phone number is required." })}
          />
          <Input
            label="Home Address *"
            placeholder="12 Library Road, Badulla"
            error={errors.address?.message}
            {...register("address", { required: "Address is required." })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Latitude *"
              placeholder="6.9934"
              error={errors.latitude?.message}
              {...register("latitude", { required: "Latitude required" })}
            />
            <Input
              label="Longitude *"
              placeholder="81.0550"
              error={errors.longitude?.message}
              {...register("longitude", { required: "Longitude required" })}
            />
          </div>
          <Select
            label="Municipal Ward Limit *"
            options={[
              { value: "Badulla Ward 01", label: "Badulla Ward 01 (Central)" },
              { value: "Badulla Ward 02", label: "Badulla Ward 02 (Eastern)" },
              { value: "Badulla Ward 03", label: "Badulla Ward 03 (Southern)" },
              { value: "Badulla Ward 04", label: "Badulla Ward 04 (Northern)" },
            ]}
            {...register("ward")}
          />
          <Select
            label="Account Status *"
            options={[
              { value: "Active", label: "Active Access" },
              { value: "Suspended", label: "Suspended / Blocked" },
            ]}
            {...register("status")}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-card-border">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingResident ? "Save Changes" : "Create Citizen"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isLocationOpen}
        onClose={() => {
          setIsLocationOpen(false);
          setSelectedResident(null);
        }}
        title={`${selectedResident?.name}'s Location Coordinates`}
        className="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-[11px] text-muted-text">
            Home location tags are captured automatically when residents report bin overflow points.
          </p>
          {selectedResident && (
            <ResidentLocationMap
              latitude={selectedResident.latitude || 6.9934}
              longitude={selectedResident.longitude || 81.0550}
              name={selectedResident.name}
            />
          )}
          <div className="flex justify-end pt-3 border-t border-card-border">
            <Button variant="ghost" size="sm" onClick={() => {
              setIsLocationOpen(false);
              setSelectedResident(null);
            }}>
              Dismiss Map
            </Button>
          </div>
        </div>
      </Modal>

      

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Resident Profile"
        description={`Are you sure you want to permanently delete the profile of "${selectedResident?.name}"?`}
        confirmText="Permanently Delete"
      />
    </div>
  );
}

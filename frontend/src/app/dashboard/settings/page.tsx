"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { Settings, User, Users, Plus, Trash2, Save, Loader2, Camera, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { SystemSettings } from "@/store/greenCityStore";
import { settingsService } from "@/services/settings.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { cn } from "@/utils/cn";
import { useAuthStore } from "@/store/authStore";

interface ProfileFormData {
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  profilePic?: string;
}

interface AdminFormData {
  name: string;
  email: string;
  role: string;
  password?: string;
  confirmPassword?: string;
}

function SettingsContent() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [admins, setAdmins] = useState<{ id: string; name: string; email: string; role: string; password?: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [highlightProfile, setHighlightProfile] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const currentUser = useAuthStore((state) => state.user);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();

  const profileForm = useForm<ProfileFormData>({
    mode: "onChange"
  });
  const adminForm = useForm<AdminFormData>({
    defaultValues: {
      name: "",
      email: "",
      role: "Administrator",
      password: "",
      confirmPassword: ""
    }
  });
  const systemForm = useForm<SystemSettings>();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const sData = await settingsService.getSettings();
      const aData = await settingsService.getAdmins();
      setSettings(sData);
      setAdmins(aData);
      
      systemForm.reset(sData);

      if (typeof window !== "undefined") {
        const userStr = localStorage.getItem("user_profile");
        if (userStr) {
          const user = JSON.parse(userStr);
          profileForm.reset({
            name: user.name || "Council Admin",
            email: user.email || "admin@greencity.lk",
            profilePic: user.profilePic || "https://images..com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80",
            password: "",
            confirmPassword: ""
          });
        }
      }
    } catch {
      toast.error("Failed to load settings.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchParams && searchParams.get("focus") === "profile") {
      const element = document.getElementById("profile-settings");
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          setHighlightProfile(true);
          setTimeout(() => setHighlightProfile(false), 3000);
        }, 400);
      }
    }
  }, [searchParams]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast.error("Profile picture size must be less than 1MB.");
      return;
    }

    const allowedFormats = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedFormats.includes(file.type)) {
      toast.error("Format not supported. Use PNG, JPG, JPEG or WEBP.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      profileForm.setValue("profilePic", base64String, { shouldDirty: true });
      toast.success("Profile photo uploaded and previewed.");
    };
    reader.readAsDataURL(file);
  };

  const onUpdateProfile = async (data: ProfileFormData) => {
    try {
      const { confirmPassword, ...profileData } = data;
      await settingsService.updateProfile(profileData);
      toast.success("Profile credentials updated successfully.");
      loadData();
    } catch {
      toast.error("Failed to update profile.");
    }
  };

  const onUpdateSystem = async (data: SystemSettings) => {
    try {
      await settingsService.updateSettings(data);
      toast.success("System configurations updated successfully.");
      loadData();
    } catch {
      toast.error("Failed to save system settings.");
    }
  };

  const onAddAdmin = async (data: AdminFormData) => {
    try {
      const { confirmPassword, ...adminData } = data;
      await settingsService.addAdmin(adminData);
      toast.success(`Admin "${data.name}" successfully registered.`);
      adminForm.reset({
        name: "",
        email: "",
        role: "Administrator",
        password: "",
        confirmPassword: ""
      });
      setShowPassword(false);
      setShowConfirmPassword(false);
      loadData();
    } catch {
      toast.error("Failed to create admin profile.");
    }
  };

  const onDeleteAdmin = (admin: { id: string; name: string; email: string; role: string }) => {
    setSelectedAdmin(admin);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAdmin) return;
    try {
      await settingsService.removeAdmin(selectedAdmin.id);
      toast.success("Admin access suspended.");
      setIsDeleteOpen(false);
      setSelectedAdmin(null);
      loadData();
    } catch {
      toast.error("Failed to suspend admin profile.");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading || !settings) {
    return (
      <div className="py-40 flex justify-center items-center gap-2 text-xs font-bold text-muted-text">
        <Loader2 className="h-5 w-5 animate-spin text-primary-green" />
        <span>Loading Settings Workspace...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full pb-8">
      
      <div className="lg:col-span-12">
        <h2 className="text-2xl font-extrabold text-foreground">Settings Panel</h2>
      </div>

      <Card
        id="profile-settings"
        className={cn(
  "lg:col-span-12 h-fit transition-all duration-500 border border-card-border",
  highlightProfile && "ring-4 ring-primary-green/30 border-primary-green/50 shadow-lg shadow-primary-green/10 scale-[1.01]"
)}
      >
        <CardHeader>
          <CardTitle className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
            <User className="h-4.5 w-4.5 text-primary-green" />
            Admin Profile Settings
          </CardTitle>
          
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-6">
            
            <div className="flex flex-col items-center gap-3 mb-6">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative h-34 w-34 rounded-full group cursor-pointer border-2 border-primary-green/20 hover:border-primary-green overflow-hidden transition-all duration-300 shadow-inner bg-muted-bg"
              >
                <img
                  src={profileForm.watch("profilePic") || "https://res.cloudinary.com/dfgkfyldd/image/upload/v1784293764/ChatGPT_Image_Jun_21_2026_12_32_07_AM_o0o1d3.png"}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt="Profile Avatar"
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Camera className="h-5 w-5 text-white" />
                  <span className="text-[9px] text-white font-bold uppercase mt-1">Upload</span>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".png,.jpg,.jpeg,.webp"
                className="hidden"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer"
                >
                  Change Photo
                </Button>
              </div>
              <span className="text-[10px] font-bold text-muted-text uppercase">PNG, JPG, JPEG, WEBP (Max 1MB)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Full Name *"
                placeholder="Jagath Silva"
                error={profileForm.formState.errors.name?.message}
                {...profileForm.register("name", { required: "Name is required" })}
              />
              <Input
                label="Email Address *"
                type="email"
                placeholder="admin@greencity.lk"
                error={profileForm.formState.errors.email?.message}
                {...profileForm.register("email", { required: "Email is required" })}
              />
              <Input
                label="Change Password"
                type="password"
                placeholder="••••••••"
                error={profileForm.formState.errors.password?.message}
                {...profileForm.register("password")}
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                error={profileForm.formState.errors.confirmPassword?.message}
                {...profileForm.register("confirmPassword", {
                  validate: (val) => {
                    if (profileForm.watch("password") && val !== profileForm.watch("password")) {
                      return "Passwords do not match";
                    }
                    return true;
                  }
                })}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" size="sm" type="submit" className="cursor-pointer">
                <Save className="h-4 w-4 mr-1.5" />
                Save Profile Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      

      <Card className="lg:col-span-12 border border-card-border">
        <CardHeader>
          <CardTitle className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
            <Users className="h-4.5 w-4.5 text-amber-500" />
            Administrators Database
          </CardTitle>
          
        </CardHeader>
        <CardContent className="space-y-8">
          
          <div className="border-b border-card-border pb-6">
            <h4 className="text-[13px] font-bold uppercase tracking-wider text-muted-text mb-4">Add New Administrator</h4>
            <form onSubmit={adminForm.handleSubmit(onAddAdmin)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
              <Input
                label="Full Name *"
                placeholder="Name (e.g. Amila Perera)"
                error={adminForm.formState.errors.name?.message}
                {...adminForm.register("name", { required: "Full name is required." })}
              />
              <Input
                label="Email Address *"
                placeholder="Email address"
                type="email"
                error={adminForm.formState.errors.email?.message}
                {...adminForm.register("email", {
                  required: "Email address is required.",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address."
                  }
                })}
              />
              <Select
                label="Security Role *"
                options={[
                  { value: "Administrator", label: "Administrator" },
                  { value: "Editor", label: "Editor" },
                  { value: "Viewer", label: "Viewer" },
                ]}
                {...adminForm.register("role", { required: "Security role is required." })}
              />

              <div className="relative flex flex-col gap-1.5 w-full">
                <Input
                  label="Password *"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  error={adminForm.formState.errors.password?.message}
                  {...adminForm.register("password", {
                    required: "Password is required.",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters."
                    },
                    validate: {
                      hasUppercase: (val) => /[A-Z]/.test(val || "") || "Must contain at least one uppercase letter.",
                      hasLowercase: (val) => /[a-z]/.test(val || "") || "Must contain at least one lowercase letter.",
                      hasNumber: (val) => /[0-9]/.test(val || "") || "Must contain at least one number."
                    }
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[38px] text-muted-text hover:text-foreground cursor-pointer focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <span className="text-[10px] font-bold text-muted-text mt-0.5 px-2 leading-tight">
                  Password must contain at least 8 characters including uppercase, lowercase and a number.
                </span>
              </div>

              <div className="relative flex flex-col gap-1.5 w-full">
                <Input
                  label="Confirm Password *"
                  placeholder="••••••••"
                  type={showConfirmPassword ? "text" : "password"}
                  error={adminForm.formState.errors.confirmPassword?.message}
                  {...adminForm.register("confirmPassword", {
                    required: "Confirm your password.",
                    validate: (val) => val === adminForm.watch("password") || "Passwords do not match."
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-[38px] text-muted-text hover:text-foreground cursor-pointer focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-end pt-2">
                <Button variant="primary" size="md" type="submit" className="w-full sm:w-auto h-[46px] cursor-pointer">
                  <Plus className="h-4.5 w-4.5 mr-1.5" />
                  Add Administrator
                </Button>
              </div>
            </form>
          </div>

          <div>
            <h4 className="text-[13px] font-bold uppercase tracking-wider text-muted-text mb-4">Registered Administrators</h4>
            <div className="overflow-x-auto rounded-2xl border border-card-border bg-card-bg/25 backdrop-blur-md">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-card-border bg-muted-bg/30 text-muted-text text-[13px] font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Avatar</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border">
                  {admins.map((adm) => (
                    <tr key={adm.id} className="hover:bg-muted-bg/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="h-9 w-9 rounded-full bg-primary-green/10 text-primary-green flex items-center justify-center font-bold text-xs shrink-0 border border-primary-green/20">
                          {getInitials(adm.name)}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-foreground">{adm.name}</td>
                      <td className="px-6 py-4 font-medium text-muted-text">{adm.email}</td>
                      <td className="px-6 py-4">
                        <Badge variant={adm.role === "Super Admin" || adm.role === "Administrator" ? "success" : "info"}>
                          {adm.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {adm.email !== currentUser?.email ? (
                          <button
                            type="button"
                            onClick={() => onDeleteAdmin(adm)}
                            className="text-red-500 hover:text-red-600 p-2 hover:bg-red-500/5 rounded-full transition cursor-pointer inline-flex items-center justify-center"
                            title="Suspend Access"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        ) : (
                          <span className="text-[11px] font-extrabold text-muted-text uppercase tracking-wider bg-muted-bg px-2.5 py-1 rounded-full border border-card-border">
                            You
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedAdmin(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Suspend Administrator Access"
        description={`Are you sure you want to suspend access for "${selectedAdmin?.name}"? They will no longer be able to log in to the system.`}
        confirmText="Suspend Access"
      />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="py-40 flex justify-center items-center gap-2 text-xs font-bold text-muted-text">
        <Loader2 className="h-5 w-5 animate-spin text-primary-green" />
        <span>Loading Settings Workspace...</span>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}

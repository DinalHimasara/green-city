"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { ArrowLeft, Leaf, Lock, Mail, Info } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const loginStore = useAuthStore();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      await loginStore.login(data.email, data.password);
      toast.success("Login successful!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    } catch (err: any) {
      toast.error(err.message || "Failed to log in. Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-500/10 via-background to-background overflow-hidden">

      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-green/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent-green/5 rounded-full blur-3xl pointer-events-none" />



      <div className="w-full max-w-md z-10">

        <div className="flex flex-col items-center mb-8 text-center gap-2">
          <div className="p-1 bg-primary-green rounded-full shadow-lg flex items-center justify-center">
            <img
              src="/logo_new.png"
              alt="Green City Logo"
              className="h-18 w-18 object-contain"
            />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground uppercase mt-2">
            Green <span className="text-primary-green">City</span>
          </h1>
          <p className="text-xs text-muted-text font-medium uppercase tracking-wider">
            Municipal Administrator Panel
          </p>
        </div>

        <Card className="border border-card-border bg-card-bg/40 backdrop-blur-md">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4.5">

              <div className="relative">
                <Input
                  label="Administrator Email *"
                  type="email"
                  placeholder="admin@greencity.lk"
                  error={errors.email?.message}
                  {...register("email", {
                    required: "Email address is required.",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Please enter a valid email address.",
                    },
                  })}
                />
              </div>

              <div className="relative">
                <Input
                  label="Password *"
                  type="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register("password", {
                    required: "Password is required.",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters.",
                    },
                  })}
                />
              </div>



              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-3"
                  isLoading={loading}
                >
                  <Lock className="h-4 w-4" />
                  Authenticate Administrator
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

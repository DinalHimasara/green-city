"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      toast.success("Feedback sent! Thank you for helping keep Badulla clean.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    }, 1500);
  };

  return (
    <section id="contact" className="py-24 bg-gradient-to-b from-[#FFFFFF] to-[#F6FBF7] relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col gap-3">
          <span className="mx-auto inline-block text-xs font-bold uppercase tracking-wider text-primary-green bg-primary-green/5 border border-primary-green/10 px-4.5 py-1.5 rounded-full">
            Get In Touch
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
            Contact Municipal <span className="text-[#2E8B57]">Support</span>
          </h2>
          <p className="text-sm text-muted-text font-medium leading-relaxed mt-2">
            Have questions about your ward schedules, route concerns, or app issues? Send us a message directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 xl:gap-28 items-start">
          <div className="lg:col-span-5 flex flex-col gap-6 justify-between text-foreground">
            <div className="flex flex-col gap-6">
              <h3 className="text-xl font-extrabold text-foreground">
                Municipal Headquarters
              </h3>
              <p className="text-xs sm:text-sm text-muted-text leading-relaxed font-semibold">
                Our Environment and Waste Management Division handles ward-wise driver routing. Visit or call us during working hours.
              </p>
            </div>

            <div className="space-y-4 my-6">
              <div className="flex gap-4 items-start p-4 bg-white/60 border border-card-border/60 rounded-2xl shadow-sm backdrop-blur-sm">
                <div className="p-2.5 bg-primary-green/5 border border-primary-green/10 rounded-xl text-primary-green">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wider">Office Address</h4>
                  <p className="text-xs text-muted-text mt-1 leading-relaxed font-semibold">
                    Badulla Municipal Council, Library Road, Badulla, Sri Lanka
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 bg-white/60 border border-card-border/60 rounded-2xl shadow-sm backdrop-blur-sm">
                <div className="p-2.5 bg-primary-green/5 border border-primary-green/10 rounded-xl text-primary-green">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wider">Help Desk</h4>
                  <p className="text-xs text-muted-text mt-1 leading-relaxed font-semibold">
                    +94 55 222 2224 / +94 55 222 2225
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 bg-white/60 border border-card-border/60 rounded-2xl shadow-sm backdrop-blur-sm">
                <div className="p-2.5 bg-primary-green/5 border border-primary-green/10 rounded-xl text-primary-green">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wider">Email Support</h4>
                  <p className="text-xs text-muted-text mt-1 leading-relaxed font-semibold">
                    support@greencity.badulla.mc.lk
                  </p>
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-text font-semibold">
              * Support hours: Monday to Friday, 8:30 AM to 4:15 PM.
            </div>
          </div>

          <div className="lg:col-span-7">
            <Card className="border border-white/20 bg-white/90 backdrop-blur-md h-full shadow-xl">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Your Name *"
                      placeholder="Amara Perera"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <Input
                      label="Email Address *"
                      type="email"
                      placeholder="amara@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <Input
                    label="Subject"
                    placeholder="Inquiry about Ward 03 schedule"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />

                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-text px-1">
                      Message Content *
                    </label>
                    <textarea
                      placeholder="Write your feedback or query details..."
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-2xl border border-card-border bg-card-bg/40 text-xs text-foreground backdrop-blur-sm outline-none transition-all duration-300 focus:border-primary-green placeholder:text-muted-text/40 resize-none"
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full sm:w-auto text-xs py-3"
                      isLoading={isLoading}
                    >
                      <Send className="h-4 w-4" />
                      Send Message
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </section>
  );
}

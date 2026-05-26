"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import AnimateOnScroll from "@/components/AnimateOnScroll";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    toast.success("Message sent! We'll get back to you soon.");
  };

  return (
    <div className="max-w-[1260px] mx-auto px-4 py-16">
      <AnimateOnScroll type="fadeIn" duration={800}>
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#333] mb-3">Contact Us</h1>
          <p className="text-[#999] max-w-xl mx-auto">
            Have a question or feedback? We&apos;d love to hear from you.
          </p>
        </div>
      </AnimateOnScroll>

      <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
        <AnimateOnScroll type="slideLeft" duration={700}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#333] mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-[#ebebeb] rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#c96] transition-all duration-200 focus:shadow-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[#333] mb-1">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-[#ebebeb] rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#c96] transition-all duration-200 focus:shadow-md"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-[#333] mb-1">Subject *</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full border border-[#ebebeb] rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#c96] transition-all duration-200 focus:shadow-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-[#333] mb-1">Message *</label>
              <textarea
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full border border-[#ebebeb] rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#c96] transition-all duration-200 focus:shadow-md resize-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={sent}
              className="bg-[#c96] text-white px-8 py-2.5 rounded-sm text-sm font-medium hover:bg-[#c96]/90 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              {sent ? "Message Sent!" : "Send Message"}
            </button>
          </form>
        </AnimateOnScroll>

        <AnimateOnScroll type="slideRight" duration={700}>
          <div className="space-y-6 text-sm px-4 md:px-0">
            {[
              { title: "Address", lines: ["123 ShopWave Street, Suite 100", "San Francisco, CA 94102"] },
              { title: "Phone", lines: ["+1 (555) 123-4567"] },
              { title: "Email", lines: ["support@shopwave.com"] },
              { title: "Hours", lines: ["Mon - Fri: 9:00 AM - 6:00 PM", "Saturday: 10:00 AM - 4:00 PM", "Sunday: Closed"] },
            ].map((section) => (
              <div key={section.title} className="transition-all duration-300 hover:translate-x-1">
                <h3 className="font-bold text-[#333] mb-1">{section.title}</h3>
                {section.lines.map((line, i) => (
                  <p key={i} className="text-[#666]">{line}</p>
                ))}
              </div>
            ))}
          </div>
        </AnimateOnScroll>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle2, Send, MessageSquare, Mail, AlertCircle } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60, 'Name cannot exceed 60 characters'),
  email: z.string().email('Please enter a valid email address'),
  topic: z.string().min(1, 'Please select an inquiry topic'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message cannot exceed 1000 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactPage() {
  const [submittedData, setSubmittedData] = useState<ContactFormData | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      topic: 'Product Feedback',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    // Simulate brief client-side processing
    await new Promise((resolve) => setTimeout(resolve, 400));
    setSubmittedData(data);
    reset();
  };

  return (
    <div className="py-12 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <Badge variant="success">Support & Feedback</Badge>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Get in Touch with the Team
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Have questions about the EXPENZO architecture, design system, or feature roadmap? Submit your thoughts below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Contact Info (4 cols) */}
        <div className="md:col-span-5 space-y-4">
          <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Communication Protocol
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              As an offline demonstration environment, this form validates inputs locally using React Hook Form and Zod.
            </p>

            <div className="pt-2 space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-2.5">
                <MessageSquare className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong>Product Discussions:</strong>
                  <p className="text-slate-500 text-[11px]">Architectural inquiries and feature suggestions.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong>Client-Side Verification:</strong>
                  <p className="text-slate-500 text-[11px]">Zero remote network requests or data capture.</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0E1726] border border-slate-200 dark:border-slate-800 flex items-center gap-2.5 text-xs text-slate-500">
            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
            <span>Demonstration mode: No network emails are dispatched.</span>
          </div>
        </div>

        {/* Contact Form (7 cols) */}
        <Card className="md:col-span-7 p-6 sm:p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] shadow-xl space-y-6">
          {submittedData ? (
            <div className="py-8 text-center space-y-3 animate-in fade-in-50">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Input Successfully Validated!
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                Thank you, <strong>{submittedData.name}</strong>. Your feedback for <em>{submittedData.topic}</em> passed all client-side validation rules.
              </p>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-500">
                Notice: In accordance with our demo contract, no remote email was sent.
              </div>
              <Button size="sm" variant="outline" onClick={() => setSubmittedData(null)}>
                Send Another Note
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="e.g. Aryan Sharma"
                error={errors.name?.message}
                {...register('name')}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="aryan.sharma@example.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Topic of Inquiry
                </label>
                <select
                  className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  {...register('topic')}
                >
                  <option value="Product Feedback">Product Architecture & Feedback</option>
                  <option value="Feature Inquiry">Feature Roadmap Inquiry</option>
                  <option value="Security Question">Security & Privacy Inquiries</option>
                  <option value="General Support">General Platform Question</option>
                </select>
                {errors.topic && <p className="text-xs text-red-500">{errors.topic.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Your Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Share your thoughts, suggestions, or architecture feedback..."
                  className="flex w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] p-3.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  {...register('message')}
                />
                {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
              </div>

              <Button type="submit" className="w-full" isLoading={isSubmitting}>
                <Send className="h-4 w-4 mr-1.5" />
                Submit Verification Note
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}


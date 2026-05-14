import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { signUpWithEmailPassword } from "@/lib/authFlows";
import { HeroBackground } from "@/components/shared/PremiumBackground";
import {
  PremiumButton,
  PremiumInput,
  FloatingBadge,
  GlowingSeparator,
} from "@/components/shared/PremiumComponents";
import { MOTION, TRANSITIONS, STAGGER } from "@/lib/premium-motion";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AlertCircle, ArrowRight, CheckCircle2, Lock, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z
  .object({
    email: z.string().email({
      message: "Please enter a valid email address",
    }),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const RegisterPage = ({
  variant = "page",
}: {
  variant?: "page" | "embedded";
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Register the user with Supabase Auth
      const { data, error: signUpError } = await signUpWithEmailPassword(
        values.email,
        values.password,
      );

      if (signUpError) throw signUpError;

      // Create a profile record in the profiles table
      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert(
            {
              id: data.user.id,
              role: "student",
            },
            {
              onConflict: "id",
            },
          );


        if (profileError) throw profileError;
      }

      setSuccess(
        "Registration successful! Please check your email to verify your account.",
      );

      // Redirect to login after a delay
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error: any) {
      setError(error.message || "Failed to register");
    } finally {
      setIsLoading(false);
    }
  };

  const ambientOrbs = useMemo(
    () => [
      "top-[6%] left-[8%] h-72 w-72 bg-cyan-500/12",
      "top-[14%] right-[8%] h-[24rem] w-[24rem] bg-indigo-500/12",
      "bottom-[10%] left-[14%] h-[26rem] w-[26rem] bg-violet-500/10",
      "bottom-[8%] right-[10%] h-[28rem] w-[28rem] bg-blue-500/10",
    ],
    [],
  );

  const content = (
    <div className="relative z-20 w-full max-w-[34rem]">
      <motion.div
        initial={{ opacity: 0, y: 18, filter: "blur(14px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={TRANSITIONS.slowest}
        whileHover={{ y: -1 }}
        className="relative rounded-[2rem] border border-white/10 bg-slate-950/66 p-[7px] shadow-[0_34px_120px_rgba(2,6,23,0.72)] backdrop-blur-2xl"
      >
        <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(120%_70%_at_10%_0%,rgba(99,102,241,0.16),transparent_58%),radial-gradient(120%_80%_at_100%_0%,rgba(56,189,248,0.1),transparent_55%)]" />
        <div className="absolute inset-0 rounded-[2rem] border border-indigo-200/10" />
        <motion.div
          animate={{ opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -inset-px rounded-[2rem] bg-gradient-to-r from-cyan-300/14 via-indigo-300/12 to-purple-300/14 blur-lg"
        />

        <div className="relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-slate-950/82 px-6 py-7 sm:px-8 sm:py-9">
          <motion.div
            aria-hidden
            animate={{ x: ["-25%", "30%", "-25%"] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute inset-y-0 -left-20 w-44 rotate-6 bg-gradient-to-r from-transparent via-white/[0.045] to-transparent blur-2xl"
          />
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...TRANSITIONS.slower, delay: 0.08 }}
            className="mb-7 space-y-5"
          >
            <FloatingBadge className="border-cyan-300/45 bg-cyan-400/10 text-cyan-200">
              <Sparkles className="mr-2 h-3 w-3" />
              Student Access Provisioning
            </FloatingBadge>
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100/75">
                Create your HMS profile
              </p>
              <h1 className="text-3xl font-semibold leading-[1.12] sm:text-4xl">
                <span className="bg-gradient-to-r from-cyan-100 via-indigo-100 to-purple-100 bg-clip-text text-transparent">
                  Join the Intelligent
                </span>
                <br />
                <span className="text-slate-100/95">Hostel Ecosystem</span>
              </h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300/78 sm:text-[15px]">
                Register to access secure payments, notices, maintenance
                requests, and your real-time student dashboard.
              </p>
            </div>
          </motion.div>

          <GlowingSeparator className="mb-7" />

          <motion.div initial="hidden" animate="show" variants={MOTION.container} custom={STAGGER.small}>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={TRANSITIONS.snappy} className="mb-6">
                <Alert className="border-red-500/45 bg-red-500/10 backdrop-blur-xl">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-200">{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            {success && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={TRANSITIONS.snappy} className="mb-6">
                <Alert className="border-emerald-500/45 bg-emerald-500/10 backdrop-blur-xl">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  <AlertDescription className="text-emerald-100">{success}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-[1.125rem]">
                <motion.div variants={MOTION.slideInUp}>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <div className="group/input relative">
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 opacity-0 blur-sm transition-opacity duration-300 group-focus-within/input:opacity-100" />
                            <PremiumInput
                              placeholder="name@mitwpu.edu.in"
                              type="email"
                              {...field}
                              disabled={isLoading}
                              className="relative h-12 rounded-xl border-slate-600/70 bg-slate-900/65 text-base placeholder:text-slate-500 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/30"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div variants={MOTION.slideInUp}>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="group/input relative">
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/18 to-purple-500/20 opacity-0 blur-sm transition-opacity duration-300 group-focus-within/input:opacity-100" />
                            <PremiumInput
                              placeholder="••••••••"
                              type="password"
                              {...field}
                              disabled={isLoading}
                              className="relative h-12 rounded-xl border-slate-600/70 bg-slate-900/65 text-base placeholder:text-slate-500 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-400/30"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div variants={MOTION.slideInUp}>
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                          Confirm Password
                        </FormLabel>
                        <FormControl>
                          <div className="group/input relative">
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/18 to-blue-500/20 opacity-0 blur-sm transition-opacity duration-300 group-focus-within/input:opacity-100" />
                            <PremiumInput
                              placeholder="••••••••"
                              type="password"
                              {...field}
                              disabled={isLoading}
                              className="relative h-12 rounded-xl border-slate-600/70 bg-slate-900/65 text-base placeholder:text-slate-500 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/30"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div variants={MOTION.slideInUp} className="pt-2">
                  <PremiumButton
                    type="submit"
                    disabled={isLoading}
                    className="group relative h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 text-sm font-semibold uppercase tracking-[0.12em] shadow-[0_10px_24px_rgba(59,130,246,0.3)] transition-all duration-300 hover:translate-y-[-1px] hover:shadow-[0_14px_30px_rgba(99,102,241,0.42)]"
                  >
                    <motion.span
                      aria-hidden
                      animate={{ x: ["-120%", "140%"] }}
                      transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 2.2, ease: "easeInOut" }}
                      className="pointer-events-none absolute inset-y-0 w-20 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                    />
                    {isLoading ? "Creating account..." : (
                      <>
                        Create Account
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </>
                    )}
                  </PremiumButton>
                </motion.div>
              </form>
            </Form>

            <motion.div variants={MOTION.slideInUp} className="mt-6 space-y-4">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-300">
                <span className="inline-flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-cyan-300" />
                  Secure account provisioning
                </span>
                <span className="rounded-md border border-cyan-400/25 bg-cyan-400/10 px-2 py-1 text-[10px] uppercase tracking-[0.15em] text-cyan-200">
                  Protected
                </span>
              </div>
              <div className="text-center text-sm text-slate-400">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-cyan-300 transition-colors hover:text-cyan-200">
                  Sign in
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );

  if (variant === "embedded") return content;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] px-4 py-6 sm:px-6 sm:py-8 lg:px-12">
      <HeroBackground />
      <motion.div
        aria-hidden
        animate={{ opacity: [0.84, 1, 0.84] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(56,189,248,0.14),transparent_36%),radial-gradient(circle_at_82%_14%,rgba(129,140,248,0.14),transparent_42%),radial-gradient(circle_at_74%_78%,rgba(147,51,234,0.12),transparent_44%)]"
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent,rgba(2,6,23,0.86)_74%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(2,6,23,0.1),rgba(2,6,23,0.55),rgba(2,6,23,0.2))]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(148,163,184,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.16)_1px,transparent_1px)] [background-size:56px_56px]" />
      <div className="pointer-events-none absolute inset-y-0 left-[44%] hidden w-px bg-gradient-to-b from-transparent via-cyan-300/22 to-transparent lg:block" />

      {ambientOrbs.map((orb, idx) => (
        <motion.div
          key={idx}
          className={`pointer-events-none absolute rounded-full blur-3xl ${orb}`}
          animate={{
            x: [0, idx % 2 === 0 ? 24 : -22, 0],
            y: [0, idx % 2 === 0 ? -20 : 24, 0],
            scale: [1, 1.06, 1],
          }}
          transition={{
            duration: 18 + idx * 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <div className="relative z-20 mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl items-center">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.06fr_0.94fr] xl:gap-14">
          <motion.div
            initial={{ opacity: 0, x: -24, filter: "blur(16px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ ...TRANSITIONS.slowest, delay: 0.08 }}
            className="relative hidden lg:flex lg:flex-col lg:justify-center"
          >
            <div className="pointer-events-none absolute inset-y-10 left-0 w-[92%] rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.04] via-white/[0.015] to-transparent" />
            <div className="relative max-w-xl space-y-7 rounded-[2rem] p-8">
              <FloatingBadge className="w-fit border-indigo-300/50 bg-indigo-400/10 text-indigo-100">
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                Intelligent Hostel Management
              </FloatingBadge>
              <h2 className="text-5xl font-semibold leading-[1.06] text-slate-100 xl:text-[3.65rem]">
                Cinematic onboarding
                <span className="block bg-gradient-to-r from-cyan-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
                  for premium operations
                </span>
              </h2>
              <p className="max-w-lg text-[15px] leading-relaxed text-slate-300/78 xl:text-[17px]">
                Establish your secure identity and enter a unified platform for
                student lifecycle, communication, and financial workflows.
              </p>
              <div className="grid max-w-md grid-cols-2 gap-3 text-[11px]">
                {["Unified account model", "Enterprise security", "Seamless role routing", "Trusted onboarding UX"].map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-slate-200 transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.05]"
                  >
                    {item}
                  </div>
                ))}
              </div>
              <div className="grid max-w-lg grid-cols-3 gap-3 pt-2">
                {[
                  { label: "Provisioning", value: "Instant" },
                  { label: "Verification", value: "Email" },
                  { label: "Access", value: "24/7" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-white/10 bg-slate-900/45 px-3 py-3 backdrop-blur-md"
                  >
                    <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">{stat.label}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-100">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24, filter: "blur(12px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ ...TRANSITIONS.slowest, delay: 0.14 }}
            className="flex items-center justify-center"
          >
            {content}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

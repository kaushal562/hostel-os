import React, { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { signInWithEmailPassword } from "@/lib/authFlows";
import { isAdminUser } from "@/lib/adminAuth";
import { HeroBackground } from "@/components/shared/PremiumBackground";
import { PremiumButton, PremiumInput, FloatingBadge, GlowingSeparator } from "@/components/shared/PremiumComponents";
import { MOTION, TRANSITIONS, STAGGER } from "@/lib/premium-motion";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AlertCircle, ShieldCheck, ArrowRight, Lock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  username: z.string().min(1, {
    message: "Username is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingExistingSession, setCheckingExistingSession] = useState(true);
  const [existingSessionRole, setExistingSessionRole] = useState<
    "admin" | "non_admin" | "none"
  >("none");

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const { isAdmin, userId } = await isAdminUser();
        if (!cancelled) {
          setExistingSessionRole(
            !userId ? "none" : isAdmin ? "admin" : "non_admin",
          );
        }
      } catch {
        if (!cancelled) setExistingSessionRole("none");
      } finally {
        if (!cancelled) setCheckingExistingSession(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError("");

    try {
      const { error: signInError } = await signInWithEmailPassword(
        values.username,
        values.password,
      );

      if (signInError) {
        setError(signInError.message);
        return;
      }

      const { isAdmin } = await isAdminUser();
      if (!isAdmin) {
        await supabase.auth.signOut();
        setError("Access denied: this account is not an administrator.");
        return;
      }

      navigate("/admin", { replace: true });
    } catch (e: any) {
      setError(e?.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (checkingExistingSession) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 overflow-hidden">
        <HeroBackground />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="relative z-10 h-12 w-12 rounded-full border-2 border-slate-600 border-t-cyan-500 shadow-glow-cyan"
        />
      </div>
    );
  }

  // Redirect if already admin
  if (existingSessionRole === "admin") {
    return <Navigate to="/admin" replace />;
  }

  // Access denied for non-admin
  if (existingSessionRole === "non_admin") {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10 overflow-hidden">
        <HeroBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={TRANSITIONS.slower}
          className="relative z-10 w-full max-w-xl"
        >
          <div className="glass rounded-2xl border border-red-500/50 p-8">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex justify-center mb-4"
            >
              <AlertCircle className="w-12 h-12 text-red-400" />
            </motion.div>
            <h2 className="text-2xl font-bold text-red-300 mb-2 text-center">
              Access Denied
            </h2>
            <p className="text-slate-300 text-center mb-2">
              Your account doesn't have admin permissions.
            </p>
            <p className="text-sm text-slate-400 text-center">
              Redirecting to student portal...
            </p>
            <Navigate
              to="/"
              replace
              state={{ from: location, error: "Access denied: Admins only" }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  // Main login UI
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Background */}
      <HeroBackground />

      {/* Animated background orbs */}
      <motion.div
        className="absolute top-20 right-32 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl"
        animate={{
          x: [0, 80, 0],
          y: [0, -80, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-20 left-32 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl"
        animate={{
          x: [0, -80, 0],
          y: [0, 80, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-5xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Hero content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...TRANSITIONS.slower, delay: 0.2 }}
            className="text-slate-100 hidden lg:block"
          >
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/50">
                <ShieldCheck className="w-6 h-6 text-purple-300" />
              </div>
              <span className="text-lg font-semibold text-transparent bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text">
                Secure Admin Access
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...TRANSITIONS.slower, delay: 0.3 }}
              className="text-5xl font-bold mb-4"
            >
              <span className="text-gradient">Command Center</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...TRANSITIONS.slower, delay: 0.4 }}
              className="text-lg text-slate-400 leading-relaxed mb-8 max-w-lg"
            >
              Administer students, manage complaints, notifications, and room requests with enterprise-grade intelligence and control.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...TRANSITIONS.slower, delay: 0.5 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-1 h-1 rounded-full bg-cyan-500" />
                <span>Real-time system monitoring</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-1 h-1 rounded-full bg-purple-500" />
                <span>Advanced analytics dashboard</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-1 h-1 rounded-full bg-pink-500" />
                <span>Secure encrypted sessions</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ ...TRANSITIONS.slower, delay: 0.6 }}
              className="mt-10 text-sm text-slate-500"
            >
              <a
                href="/"
                className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
              >
                ← Back to Student Portal
              </a>
            </motion.div>
          </motion.div>

          {/* Right side - Login form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...TRANSITIONS.slower, delay: 0.2 }}
            className="w-full max-w-md mx-auto lg:mx-0"
          >
            <div className="relative group">
              {/* Glow background */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Main card */}
              <div className="relative glass rounded-2xl border border-white/20 p-8 backdrop-blur-xl">
                {/* Decorative elements */}
                <motion.div
                  className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-purple-600/20 to-transparent rounded-full blur-2xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...TRANSITIONS.slower, delay: 0.3 }}
                  className="text-center mb-8"
                >
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="flex justify-center mb-4"
                  >
                    <FloatingBadge>
                      <Lock className="w-3 h-3 inline mr-2" />
                      Administrator Console
                    </FloatingBadge>
                  </motion.div>

                  <h2 className="text-3xl font-bold mb-2">
                    <span className="text-gradient">Sign In</span>
                  </h2>
                  <p className="text-slate-400">
                    Use your admin credentials
                  </p>
                </motion.div>

                <GlowingSeparator className="mb-8" />

                {/* Form */}
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={MOTION.container}
                  custom={STAGGER.small}
                >
                  {/* Error Alert */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={TRANSITIONS.snappy}
                      className="mb-6"
                    >
                      <Alert className="glass border-red-500/50 bg-red-500/10">
                        <AlertCircle className="h-4 w-4 text-red-400" />
                        <AlertDescription className="text-red-300">
                          {error}
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}

                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-5"
                    >
                      {/* Email Field */}
                      <motion.div variants={MOTION.slideInUp}>
                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300 font-medium">
                                Admin Email
                              </FormLabel>
                              <FormControl>
                                <div className="relative group/input">
                                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg blur opacity-0 group-hover/input:opacity-100 transition-opacity duration-300" />
                                  <PremiumInput
                                    placeholder="admin@hostel.com"
                                    type="email"
                                    {...field}
                                    disabled={isLoading}
                                    className="relative"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      {/* Password Field */}
                      <motion.div variants={MOTION.slideInUp}>
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300 font-medium">
                                Password
                              </FormLabel>
                              <FormControl>
                                <div className="relative group/input">
                                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur opacity-0 group-hover/input:opacity-100 transition-opacity duration-300" />
                                  <PremiumInput
                                    placeholder="••••••••"
                                    type="password"
                                    {...field}
                                    disabled={isLoading}
                                    className="relative"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      {/* Submit Button */}
                      <motion.div
                        variants={MOTION.slideInUp}
                        className="pt-4"
                      >
                        <PremiumButton
                          type="submit"
                          disabled={isLoading}
                          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600"
                        >
                          {isLoading ? (
                            <>
                              <motion.span
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="inline-block mr-2"
                              >
                                ◌
                              </motion.span>
                              Verifying...
                            </>
                          ) : (
                            <>
                              Access Console
                              <ArrowRight className="ml-2 w-4 h-4" />
                            </>
                          )}
                        </PremiumButton>
                      </motion.div>
                    </form>
                  </Form>

                  {/* Footer */}
                  <motion.div
                    variants={MOTION.slideInUp}
                    className="mt-6 text-center text-xs text-slate-500"
                  >
                    <span className="inline-flex items-center gap-1">
                      🔒 Verified by Supabase RLS
                    </span>
                  </motion.div>
                </motion.div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 opacity-50 rounded-b-2xl" />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;

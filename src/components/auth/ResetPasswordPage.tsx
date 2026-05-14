import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { supabase } from "@/lib/supabase";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, KeyRound } from "lucide-react";

const schema = z
  .object({
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string().min(6, { message: "Confirm password must be at least 6 characters" }),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

interface HashParams {
  access_token?: string;
  refresh_token?: string;
  type?: string;
  expires_in?: string;
  error?: string;
  error_description?: string;
}

/**
 * Parse URL hash fragment to extract Supabase auth parameters.
 * Supabase sends recovery links like: /reset-password#access_token=...&type=recovery&refresh_token=...
 */
function parseHashParams(): HashParams {
  const hash = window.location.hash.slice(1); // Remove leading #
  if (!hash) return {};

  const params = new URLSearchParams(hash);
  return {
    access_token: params.get("access_token") || undefined,
    refresh_token: params.get("refresh_token") || undefined,
    type: params.get("type") || undefined,
    expires_in: params.get("expires_in") || undefined,
    error: params.get("error") || undefined,
    error_description: params.get("error_description") || undefined,
  };
}

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const hashParams = useMemo(() => parseHashParams(), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isValidToken, setIsValidToken] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const validateResetToken = async () => {
      try {
        setLoading(true);
        setError("");

        // Check for hash-based parameters first (standard Supabase recovery flow)
        // Pattern: localhost:5173/reset-password#access_token=...&type=recovery&refresh_token=...
        if (hashParams.access_token && hashParams.refresh_token && hashParams.type === "recovery") {
          // Set the session with the recovery tokens
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: hashParams.access_token,
            refresh_token: hashParams.refresh_token,
          });

          if (sessionError) {
            throw new Error(sessionError.message || "Failed to establish recovery session");
          }

          if (!data?.session) {
            throw new Error("Could not establish recovery session. Token may have expired.");
          }

          setIsValidToken(true);
          setLoading(false);
          return;
        }

        // Fallback: check for query parameters (legacy or alternative flow)
        const type = query.get("type");
        const token = query.get("token");

        if (type === "recovery" && token) {
          // Try to exchange the token for a session
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession({
            type,
            token,
          } as any);

          if (exchangeError) {
            throw new Error(exchangeError.message || "Invalid recovery token");
          }

          if (!data?.session) {
            throw new Error("Could not establish session from recovery token");
          }

          setIsValidToken(true);
          setLoading(false);
          return;
        }

        // Check for hash error parameters
        if (hashParams.error) {
          const errorMsg = hashParams.error_description
            ? `${hashParams.error}: ${hashParams.error_description}`
            : hashParams.error;
          throw new Error(errorMsg);
        }

        // No valid token found
        throw new Error("Invalid or expired reset link. Please request a new password reset.");
      } catch (e: any) {
        setError(e?.message || "Failed to validate reset link. Please try again.");
        setIsValidToken(false);
      } finally {
        setLoading(false);
      }
    };

    validateResetToken();
  }, [hashParams, query]);

  const onSubmit = async (values: FormValues) => {
    setError("");
    setSuccess("");
    setFormError("password", {});

    if (!isValidToken) {
      setError("Recovery session is invalid. Please request a new reset link.");
      return;
    }

    try {
      setLoading(true);

      // At this point, the session has been established via setSession()
      // or exchangeCodeForSession() during the validation phase.
      // Now we can safely update the user's password.

      const { error: updateError } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (updateError) throw updateError;

      setSuccess("Password updated successfully. You can now log in.");

      // Clear the hash after successful password reset
      window.history.replaceState({}, document.title, window.location.pathname);

      // Redirect after short delay
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (e: any) {
      setError(e?.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <Card className="bg-white shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-blue-100 rounded-full">
                <KeyRound className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription>Enter a new password for your account.</CardDescription>
          </CardHeader>

          <CardContent>
            {loading && (
              <div className="py-6 text-center text-sm text-gray-600">
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent mr-2" />
                Validating reset link…
              </div>
            )}

            {!loading && error && (
              <div className="space-y-3">
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => navigate("/forgot-password")}
                >
                  Request new reset link
                </Button>
              </div>
            )}

            {!loading && success && (
              <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {!loading && !error && isValidToken && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...register("password")}
                    disabled={isSubmitting}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                    disabled={isSubmitting}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Updating…" : "Update Password"}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  disabled={isSubmitting}
                  onClick={() => navigate("/forgot-password")}
                >
                  Request new link
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;


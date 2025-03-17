// src/app/(auth)/auth/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/SupabaseProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BRANDING } from "@/lib/constants";
import { useToast } from "@/components/ui/use-toast";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithOAuth } = useAuth();
  
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";

  useEffect(() => {
    const error = searchParams?.get("error");
    if (error) {
      const errorMessages: Record<string, string> = {
        UserCanceled: "Sign-in was canceled.",
        SessionNotEstablished: "Unable to establish session.",
        GoogleAuthError: "Google authentication failed.",
        OAuthAccountNotLinked: "Sign in with the same account used originally.",
        CredentialsSignin: "Invalid email or password.",
        AccessDenied: "Access denied.",
      };
      toast({
        title: "Authentication Notice",
        description: errorMessages[error] || "An error occurred during authentication.",
        variant: "default",
      });
    }
  }, [searchParams, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) {
      toast({ 
        title: "Error", 
        description: "Authentication service is not available", 
        variant: "destructive" 
      });
      return;
    }
    
    setLoading(true);
    try {
      console.log("Attempting sign in with:", email);
      const result = await signIn({ email, password });
      console.log("Sign in result:", result);
      
      if (result.success) {
        console.log("Sign in successful, redirecting to:", callbackUrl);
        // Use a slight delay to allow the session to be properly set
        setTimeout(() => {
          router.push(callbackUrl);
          // Force a refresh of the router
          router.refresh();
        }, 500);
      } else {
        toast({ 
          title: "Login Failed", 
          description: "Invalid email or password", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      toast({ 
        title: "Login Failed", 
        description: error instanceof Error ? error.message : "Authentication failed", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithOAuth('google');
      // The redirect happens automatically, so no need to navigate
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast({ 
        title: "Sign-in Error", 
        description: "Failed to authenticate with Google", 
        variant: "destructive" 
      });
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 flex justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold" style={{ color: BRANDING.colors.primary.main }}>
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <a href="/auth/forgot-password" className="hover:underline" style={{ color: BRANDING.colors.primary.main }}>Forgot your password?</a>
          </div>
          <Button type="submit" className="w-full text-white" disabled={loading} style={{ backgroundColor: BRANDING.colors.primary.main }}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
          <div className="text-center my-4 flex items-center before:flex-1 before:border-t before:border-gray-300 after:flex-1 after:border-t after:border-gray-300">
            <p className="mx-4 font-semibold text-gray-500">OR</p>
          </div>
          <Button type="button" onClick={handleGoogleSignIn} className="w-full bg-white text-gray-700 border border-gray-300" disabled={loading}>
            <svg className="h-5 w-5 mr-2" viewBox="0 0 21 20" fill="none">
              <path d="M20.3081 10.2303C20.3081 9.55056 20.253 8.86711 20.1354 8.19836H10.7031V12.0492H16.1046C15.8804 13.2911 15.1602 14.3898 14.1057 15.0879V17.5866H17.3282C19.2205 15.8449 20.3081 13.2728 20.3081 10.2303Z" fill="#3F83F8"/>
              <path d="M10.7019 20.0006C13.3989 20.0006 15.6734 19.1151 17.3306 17.5865L14.1081 15.0879C13.2115 15.6979 12.0541 16.0433 10.7056 16.0433C8.09669 16.0433 5.88468 14.2832 5.091 11.9169H1.76562V14.4927C3.46322 17.8695 6.92087 20.0006 10.7019 20.0006V20.0006Z" fill="#34A853"/>
              <path d="M5.08857 11.9169C4.66969 10.6749 4.66969 9.33008 5.08857 8.08811V5.51233H1.76688C0.348541 8.33798 0.348541 11.667 1.76688 14.4927L5.08857 11.9169V11.9169Z" fill="#FBBC04"/>
              <path d="M10.7019 3.95805C12.1276 3.936 13.5055 4.47247 14.538 5.45722L17.393 2.60218C15.5852 0.904587 13.1858 -0.0287217 10.7019 0.000673888C6.92087 0.000673888 3.46322 2.13185 1.76562 5.51234L5.08732 8.08813C5.87733 5.71811 8.09302 3.95805 10.7019 3.95805V3.95805Z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </Button>
          <p className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <a href="/auth/register" className="hover:underline" style={{ color: BRANDING.colors.primary.main }}>Sign up</a>
          </p>
        </form>
      </div>
    </div>
  );
}
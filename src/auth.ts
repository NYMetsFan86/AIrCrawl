import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { comparePasswords } from "@/lib/bcrypt";
import { JWT } from "next-auth/jwt";
import type { User as DefaultUser } from "@auth/core/types";

// Define interfaces for better type safety
interface UserWithRemember extends DefaultUser {
  id: string;
  name?: string | null;
  email?: string | null;
  remember?: boolean;
}

interface ExtendedToken extends JWT {
  id?: string;
  email?: string | null;
  name?: string | null;
  remember?: boolean;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        remember: { label: "Remember Me", type: "checkbox" }
      },
      async authorize(credentials: Record<"email" | "password" | "remember", string> | undefined): Promise<UserWithRemember | null> {
        console.log("Auth attempt with credentials:", JSON.stringify({
          email: credentials?.email,
          passwordProvided: !!credentials?.password,
          remember: credentials?.remember
        }));

        if (!credentials?.email || !credentials?.password || typeof credentials.password !== 'string') {
          console.log("Missing or invalid credentials");
          return null;
        }

        try {
          const user = await db.user.findUnique({
            where: { email: credentials.email as string }
          });

          console.log("User found:", !!user);
          
          if (!user || !user.hashedPassword) {
            console.log("User not found or no password hash");
            return null;
          }

          const isValid = await comparePasswords(credentials.password, user.hashedPassword);
          console.log("Password validation result:", isValid);

          if (!isValid) {
            console.log("Invalid password");
            return null;
          }

          return {
            id: String(user.id),
            name: user.name,
            email: user.email,
            remember: credentials.remember === "true" || credentials.remember === "1"
          };
        } catch (error) {
          console.error("Error during authorization:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }: { token: ExtendedToken, user?: UserWithRemember }) => {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.remember = user.remember;
      }
      return token as ExtendedToken;
    },
    session: async ({ session, token }: { session: any, token: ExtendedToken }) => {
      console.log("Setting session from token:", JSON.stringify(token));
      if (token) {
        session.user = {
          id: token.id,
          email: token.email,
          name: token.name,
        };
      }

      // ✅ Fix: Correctly set session expiration
      const maxAge = token?.remember === true ? 
        30 * 24 * 60 * 60 :        24 * 60 * 60;       // 1 day

      const expiryDate = new Date(Date.now() + maxAge * 1000);
      session.expires = expiryDate.toISOString();

      return session;
    }
  },
  pages: {
    signIn: "/auth",
    error: "/auth/error"
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // Default session expiration (overridden in session callback)
  },
  debug: process.env.NODE_ENV === "development"
};

// Use the authOptions defined above, not imported from elsewhere
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

// Supabase authentication methods
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function getSession() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

export async function getUser() {
  const session = await getSession();
  return session?.user || null;
}

export async function requireAuth() {
  const user = await getUser();
  
  if (!user) {
    throw new Error("Authentication required");
  }
  
  return user;
}

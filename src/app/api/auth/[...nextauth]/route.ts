// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { compare } from "bcrypt";
import { OAuth2Client } from "google-auth-library";

// Type augmentations
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: { id: string; name?: string | null; email?: string | null; image?: string | null };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
  }
}

// Validate environment variables
const requiredEnvVars = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GITHUB_ID", "GITHUB_SECRET", "NEXTAUTH_SECRET"];
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) throw new Error(`Environment variable ${varName} is required`);
});

const googleAuthClient = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
});

async function refreshGoogleToken(token: JWT): Promise<JWT> {
  try {
    const response = await googleAuthClient.refreshAccessToken({
      refreshToken: token.refreshToken,
    });
    return {
      ...token,
      accessToken: response.credentials.access_token,
      accessTokenExpires: Date.now() + (response.credentials.expiry_date || 3600 * 1000),
      refreshToken: response.credentials.refresh_token || token.refreshToken,
    };
  } catch (error) {
    console.error("Google token refresh error:", error);
    return { ...token, accessToken: undefined, accessTokenExpires: undefined };
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: { params: { prompt: "consent", access_type: "offline", response_type: "code" } },
    }),
    GitHubProvider({ clientId: process.env.GITHUB_ID!, clientSecret: process.env.GITHUB_SECRET! }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        remember: { label: "Remember Me", type: "checkbox" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) throw new Error("Missing credentials");
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.hashedPassword) throw new Error("No user found or use SSO if registered via Google/GitHub");
        const isValid = await compare(credentials.password, user.hashedPassword);
        if (!isValid) throw new Error("Invalid password");
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at ? account.expires_at * 1000 : Date.now() + 3600 * 1000;
      }
      if (token.accessTokenExpires && Date.now() > token.accessTokenExpires - 300000) {
        if (token.refreshToken && account?.provider === "google") {
          console.log("Refreshing Google token for user:", token.sub);
          return refreshGoogleToken(token);
        }
        console.log("Token expired, no refresh available for provider:", account?.provider);
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub!;
      session.accessToken = token.accessToken;
      return session;
    },
    async redirect({ url, baseUrl }) {
      const parsedUrl = new URL(url, baseUrl);
      const state = parsedUrl.searchParams.get("state");
      const fromRegister = state?.includes("from=register");
      if (parsedUrl.searchParams.has("error")) {
        const error = parsedUrl.searchParams.get("error") || "unknown";
        console.error("Redirect error:", error, "from:", url);
        return `${baseUrl}${fromRegister ? "/register" : "/auth"}?error=${error}`;
      }
      return parsedUrl.origin === baseUrl || url.startsWith("/") ? url : baseUrl;
    },
  },
  pages: { signIn: "/auth", signOut: "/auth/logout", error: "/auth", newUser: "/register" },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET!,
};

export default NextAuth(authOptions);
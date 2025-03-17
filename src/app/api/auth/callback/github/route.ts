// src/app/api/auth/callback/github/route.ts
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../[...nextauth]/route";

export async function GET(request: Request) {
  // Extract URL parameters
  const url = new URL(request.url);
  const error = url.searchParams.get('error');
  const state = url.searchParams.get('state');
  
  // If there's an error or the user cancelled the flow
  if (error || !url.searchParams.has('code')) {
    console.log("GitHub auth error or cancellation:", error);
    
    // Construct the redirect URL based on origin
    const redirectUrl = state?.includes('from=register') 
      ? '/register?error=UserCanceled' 
      : '/auth?error=UserCanceled';
      
    return redirect(redirectUrl);
  }
  
  // Otherwise, let NextAuth handle the successful flow
  return redirect('/api/auth/callback/github');
}
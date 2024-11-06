import NextAuth from "next-auth";
import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectMongoDB } from "@/app/lib/mongodb";
import User from "@/app/models/User";
import bcrypt from "bcrypt";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";

// Extend the built-in types
declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    role: string;
    name: string;
  }

  interface AdapterUser {
    id: string;
    email: string;
    role: string;
    name: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
      name: string;
    }
  }

  interface Profile {
    email_verified?: boolean;
    email?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub: string;
    role: string;
  }
}

export const authOptions: AuthOptions = {
  // secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {},
      async authorize(credentials: any): Promise<any> {
        const { email, password } = credentials;

        try {
          await connectMongoDB();
          const user = await User.findOne({ email });

          if (!user) {
            return null;
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (!passwordsMatch) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            name: user.name,
            provider: 'credentials'
          };
        } catch (error) {
          console.log("Error: ", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider === "google" && profile?.email) {
        try {
          await connectMongoDB();
          
          // Check if user exists
          const existingUser = await User.findOne({ email: profile.email });
          
          if (!existingUser) {
            // Create new user
            const newUser = await User.create({
              name: profile.name,
              email: profile.email,
              role: "student", // or whatever default role you want
            });
          }
          
          return true;
        } catch (error) {
          console.error("Error during Google sign in:", error);
          return false;
        }
      }
      return true;
    },
    
    async jwt({ token, user }: { token: JWT; user: any }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (session?.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
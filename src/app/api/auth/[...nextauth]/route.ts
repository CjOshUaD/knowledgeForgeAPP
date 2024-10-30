import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectMongoDB } from "@/app/lib/mongodb";
import User from "@/app/models/User";
import bcrypt from "bcrypt";;
import { Account, User as AuthUser } from "next-auth";
import GoogleProvider from "next-auth/providers/google";


export const authOptions: any = {
  // Configure one or more authentication providers
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!
      }),

      CredentialsProvider({
          id: "credentials",
          name: "Credentials",
          credentials: {
              email: { label: "Email", type: "text" },
              password: { label: "Password", type: "password" },
          },
          async authorize(credentials) {
 
              await connectMongoDB();
              try {
                  const user = await User.findOne({ email: credentials?.email });
                  if (user) {
                      const isPasswordCorrect = await bcrypt.compare(
                          credentials?.password ?? "",
                          user.password as string
                      );
                      if (isPasswordCorrect) {
                          return user;
                      }
                  }
              } catch (error: any) {
                  throw new Error(error);
              }
          },
      }),
  ],
  debug: true,
  
  callbacks: {

      async signIn({ user, account }: { user: AuthUser; account: Account }) {
          if (account?.provider == "credentials") {
              return true;
          }
        //   if (account.provider === "google"){
        //     return true;
        //   }
          return  true
      },
  },
};

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
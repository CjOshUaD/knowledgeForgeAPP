import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectMongoDB } from "@/app/lib/mongodb";
import User from "@/app/models/User";
import bcrypt from "bcrypt";

async function login (credentials){
  try {
    connectMongoDB();
    const user = await User.findOne({email:credentials.model})
    if (!user) throw new Error("Wrong Credentials");
    const isCorrect = await bcrypt.compare(credentials.password, user.password);
    if (isCorrect) throw new Error("Wrong Credentials");
  } catch (error) { 
    console.log("Error while Logging in. ");
    throw new Error ("Something went wrong.");
  }
}
export const authOptions = {
  pages: {
    signIn: "/",
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {},

      async authorize(credentials) {
        try {
          const user = await login("creadentials");
          console.log("this is the user: ", user);
          return user;
        } catch (error) {
          throw new Error ("Failed to Loggin. ");
      }
    }
    })
  ],
  callbacks:{
    async jwt({token, user}){
      if (user){
        token.name = user.name;
        token.email = user.email;
        token.id = user.id;
      }
      console.log("this the token = ", token );
      return token;
    },
    async session({session, token}){
      if (token){
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.id = token.id;
      }
      console.log("this the session = ", session);
      return session
    }
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
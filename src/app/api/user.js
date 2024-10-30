// pages/api/users.js
import { connectMongoDB } from "@/app/lib/mongodb";
import User from "@/app/models/User";

export default async function handler(req, res) {
  await connectMongoDB();

  if (req.method === 'GET') {
    const users = await User.find(); // Fetch users from the database
    return res.status(200).json(users);
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
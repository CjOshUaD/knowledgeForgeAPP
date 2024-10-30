import { connectMongoDB } from "@/app/lib/mongodb";
import User from "@/app/models/User";

export default async function handler(req, res){
    await connectMongoDB();

    if (req.method === "GET"){
        const users = await User.find();
        res.status(200).json(users);
    } else if(req.method === 'POST'){
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } else{
        res.status(201).json(user);
        res.status(405).end(`Method ${req.method} Not Allowed` );
    }
}
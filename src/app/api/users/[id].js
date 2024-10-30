import { connectMongoDB } from "@/app/lib/mongodb";
import User from "@/app/models/User";


export default async function handler(req, res){
    await connectMongoDB();
    const {id} = req.query;
    if(req.method === 'GET'){
        const user = await User.findById(id);
        if(!user) return res.status(404).json({message: 'User not found'});
        res.status(200).json(user);
    }else if (req.method === 'PUT'){
        const user = await User.findByIdAndUpdate(id, req.body, {new: true});
        if(!user) res.status(404).json({message:'User not found' });
        res.status(200).json(user);
    }else if (req.method === 'DELETE') {
        await User.findByIdAndDelete(id);
        res.status(204).end();
    } else {
        res.statusHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
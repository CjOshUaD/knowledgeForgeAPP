import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("knowledgeForge");
        const users = await db.collection("users").find({}).toArray();
        
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        const { id } = await request.json();
        const client = await clientPromise;
        const db = client.db("knowledgeForge");
        
        const result = await db.collection("users").deleteOne({
            _id: new ObjectId(id)
        });
        
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete user" },
            { status: 500 }
        );
    }
}
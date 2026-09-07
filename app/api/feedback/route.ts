import { prisma } from "@/lib/prisma";
import { syncCurrentUser } from "@/lib/sync-user";
import { NextResponse } from "next/server";

export async function POST(request : NextResponse){
    try{
        //first check if user is present or nto to be able to give feedback, by calling the syncfunction we created
        const dbUser = await syncCurrentUser();
        if(!dbUser){
            //senda nextresponse from witerror and status if no db user lgged in
            return NextResponse.json({error: "Unauthorized"}, { status: 401})
        }
        //if user present then can give feedback , code goes here
        const body = await request.json();
        const {title,description, category} = body;

        //creating teh first post from the ocontent we are getting from request.json's body
        const post = await prisma.post.create({
            data: {
                title,
                description,
                category,
                authorId: dbUser.id
            }
        })
        return NextResponse.json(post);
    }
    catch (error){
        console.log("Error creating post: ", error);
        return NextResponse.json({
            error: "Internal Server Error"
        },{status: 500})
        
    }
}

//fetching all feedback
export async function GET(){
    try{
        const posts = await prisma.post.findMany({
            include: {
                author: true,
                votes: true,
            },
            orderBy: {
                createdAt: "desc",
            }
        })
        return NextResponse.json(posts);
    } catch (error) {
        console.log("Error Fetching post : ", error);
        return NextResponse.json({
            error: "Internal Server Error"
        },{status: 500})
    }
}
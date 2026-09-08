import { STATUS_ORDER } from "@/app/data/status-data";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, {params}: {params: Promise<{id : number}>}) {
    try {
        //fetching userid from clerk - auth()
        const {userId} = await auth();
        if(!userId){
            return NextResponse.json({error: "Unauthorized"}, { status: 401})    
        }
        //now chekc if user is admin or not, if the upper check/find user is not three then check for admin
        const user = await prisma.user.findUnique({
            where: {
                clerkUserId: userId,
            }
        })

        if(!user || user.role !== "admin"){
            return NextResponse.json({
                error: "ADMIN access required"
            }, {status: 403})
        }

        //if this deosnt happen then we are takig the status from our response, by changing the status of feedback
        const {status} = await request.json();
        const {id: postId} = await params
        const numericPostId = Number(postId)

        //VALIDATE STATUS FROM THE TYPE STATUS WE CREATED IN STATUS-DATA
        if(!STATUS_ORDER.includes(status)){
            return NextResponse.json({error: "Invalid status"}, { status: 400})
        }

        const updatedPost = await prisma.post.update({
            where: {
                id: numericPostId
            },
            data: {
                status
            },
            include: {
                author: true,
                votes: true,
            }
        })
        return NextResponse.json(updatedPost)

    } catch (error) {
        console.log("Error Updating post status : ", error);
        return NextResponse.json({
            error: "Internal Server Error"
        },{status: 500})
    }
}
import { prisma } from "@/lib/prisma";
import { syncCurrentUser } from "@/lib/sync-user";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest){
    try {
        //first check if user is present or nto to be able to give feedback, by calling the syncfunction we created
                const dbUser = await syncCurrentUser();
                if(!dbUser){
                    //senda nextresponse from witerror and status if no db user lgged in
                    return NextResponse.json({error: "Unauthorized"}, { status: 401})
                }
                //if user present then can give feedback , code goes here
                const {postId} = await request.json();
                if(!postId){
                    return NextResponse.json({
                        error: "POSTID is required"
                    },
                    {status: 400}
                    )
                }

                //CHECK IF VOTE ALREADY EXISTS BY THE USER FOR A PARTICUALR FEEDBACK
                // SO THE LOGIC IS IF WE HAVE GIVEN IT WE REMOVE IT AND IF NOT GIVNE WE GIVE IT
                const existingVote = await prisma.vote.findUnique({
                    where: {userId_postId:{
                        userId: dbUser.id,
                        postId,
                    }}
                })

                if(existingVote){
                    //REMOVE VOTE IF EXSITING IN DB by USRID on PSOTID
                    await prisma.vote.delete({
                        where: {
                            id: existingVote.id
                        }
                    })
                    return NextResponse.json({voted: false})
                } else {
                    //ADDING VOTE IF EIXSITNG VOTE NOT PRESENT
                    await prisma.vote.create({
                        data: {
                            userId: dbUser.id,
                            postId,
                        }
                    })
                    return NextResponse.json({voted: true})
                }
    } catch (error) {
        console.log("Error Updating/toggling Vote status : ", error);
        return NextResponse.json({
            error: "Internal Server Error"
        },{status: 500})
    }
}
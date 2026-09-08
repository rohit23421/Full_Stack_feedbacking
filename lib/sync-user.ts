import { currentUser } from "@clerk/nextjs/server"
import { prisma } from "./prisma";

//this utility first checks if a user is present in databse or not, and if not present in DB it creates one, when user tries to signup
export async function syncCurrentUser(){
    try {
        //GET USER DATA FROM CLERK
        //currentUser() is anextjs server method to fetch current logged in users
        const clerkUser = await currentUser();

        //if there is no clerk user checknig
        if(!clerkUser){
            return null
        }

        //then extract these details if no user present to create new user with this details
        const email = clerkUser.emailAddresses[0]?.emailAddress

        if(!email){
            throw new Error("User email not found")
        }

        //CHECK IF USER EXISTS IN DB or nOT
        let dbUser = await prisma.user.findUnique({
            where: {clerkUserId: clerkUser.id}
        })

        //
        if(dbUser) {
            //UPDATING EXISTING USER
            dbUser = await prisma.user.update({
                where: {id : dbUser.id},
                data: {
                    email,
                    name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
                    image: clerkUser.imageUrl
                }
            })
        } else {
            // CREATING A NEW USER IN DATABSE
            // ALSO CHECK IF ITS FIRST USER - HERE WE WILL BE AMKING THEM AS ADMIN

            const userCount = await prisma.user.count();
            const isFirstUser = userCount === 0;

            //creating the user with users data
            dbUser = await prisma.user.create({
                data: {
                    clerkUserId: clerkUser.id,
                    email,
                    name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
                    image: clerkUser.imageUrl,
                    role: isFirstUser ? "admin" : "user",
                },
            })
            console.log(`New user was created: ${email} with role: ${dbUser.role}`);
            
        }
        return dbUser;
    } catch (error: any) {
        // Don't log Next.js's internal dynamic-rendering signal as a real error
        if (error?.digest === "DYNAMIC_SERVER_USAGE") {
            throw error; // let Next.js handle it silently
        }
        console.log("Error syncing user frmo Clerk to DB:", error);
        throw error;
    }
}
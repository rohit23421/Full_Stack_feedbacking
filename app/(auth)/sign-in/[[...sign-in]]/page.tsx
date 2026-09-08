"use client";
import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/ui/themes";
import { useTheme } from "next-themes";

export default function Page() {
  const { theme: currentTheme } = useTheme(); // renamed to avoid clashing with Clerk's `theme` prop
  return (
    <div className="flex min-h-screen justify-center">
      <SignIn
        appearance={{
          theme: currentTheme === "light" ? dark : undefined,
        }}
      />
    </div>
  );
}

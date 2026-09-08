"use client";
import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/ui/themes";
import { useTheme } from "next-themes";

export default function Page() {
  const { theme: currentTheme } = useTheme();
  return (
    <div className="flex min-h-screen justify-center">
      <SignUp
        appearance={{
          theme: currentTheme === "light" ? dark : undefined,
        }}
      />
    </div>
  );
}

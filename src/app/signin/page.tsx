import { Suspense } from "react";
import { SignInContent } from "@/components/Auth/SignInContent";

export default function SignInPage() {
    return (
        <Suspense fallback={null}>
            <SignInContent />
        </Suspense>
    );
}
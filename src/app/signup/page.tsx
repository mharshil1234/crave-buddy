import { Suspense } from "react";
import { SignUpContent } from "@/components/Auth/SignUpContent";

export default function SignUpPage() {
    return (
        <Suspense fallback={null}>
            <SignUpContent />
        </Suspense>
    );
}
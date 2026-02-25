import { APP_CONFIG } from "../../config/app";
import { cn } from "../../utils/utils";

interface AppLogoProps {
    className?: string;
    showText?: boolean;
    size?: "sm" | "md" | "lg";
}

export function AppLogo({ className, showText = true, size = "md" }: AppLogoProps) {
    const sizeClasses = {
        sm: "h-6 w-6",
        md: "h-8 w-8",
        lg: "h-12 w-12"
    };

    const textSizeClasses = {
        sm: "text-lg",
        md: "text-xl",
        lg: "text-3xl"
    };

    return (
        <div className={cn("flex items-center gap-2 font-bold tracking-tight select-none", className)}>
            <img
                src={APP_CONFIG.logo}
                alt={`${APP_CONFIG.name} Logo`}
                className={cn("object-contain rounded-md", sizeClasses[size])}
            />
            {showText && (
                <span className={cn("text-foreground", textSizeClasses[size])}>
                    {APP_CONFIG.name}
                </span>
            )}
        </div>
    );
}

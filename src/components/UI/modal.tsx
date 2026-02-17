import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';
import { Button } from './button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
    width?: "sm" | "md" | "lg" | "xl" | "full";
}

export function Modal({ isOpen, onClose, children, className, width = "lg" }: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on ESC
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden'; // Prevent background scroll
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Close on click outside (Overlay click)
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    if (!isOpen) return null;

    const widthClasses = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-2xl", // Increased default width as requested (600-800px range)
        xl: "max-w-4xl",
        full: "max-w-[95vw]"
    };

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleOverlayClick}
        >
            <div
                ref={modalRef}
                className={cn(
                    "bg-background w-full rounded-xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]",
                    widthClasses[width],
                    className
                )}
                role="dialog"
                aria-modal="true"
            >
                {children}
            </div>
        </div>,
        document.body
    );
}

interface ModalHeaderProps {
    title: string;
    description?: string;
    onClose?: () => void;
    className?: string;
}

export function ModalHeader({ title, description, onClose, className }: ModalHeaderProps) {
    return (
        <div className={cn("flex items-start justify-between p-6 border-b border-border bg-muted/5 shrink-0", className)}>
            <div className="space-y-1 pr-6">
                <h2 className="text-xl font-semibold tracking-tight leading-none text-foreground">
                    {title}
                </h2>
                {description && (
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {onClose && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground -mr-2 -mt-2"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Fechar</span>
                </Button>
            )}
        </div>
    );
}

export function ModalBody({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("p-6 overflow-y-auto flex-1", className)}>
            {children}
        </div>
    );
}

export function ModalFooter({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("flex items-center justify-end p-6 border-t border-border bg-muted/5 gap-3 shrink-0", className)}>
            {children}
        </div>
    );
}

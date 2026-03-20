"use client";

import { useState, useCallback } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Share2, Mail, Facebook, Instagram, Link, Check } from "lucide-react";

// X (Twitter) icon – lucide doesn't have it
const XIcon = ({ className }) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        width="16"
        height="16"
    >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const channels = [
    {
        id: "email",
        label: "Email",
        icon: Mail,
        color: "hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400",
        action: (url, title) => {
            window.open(
                `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
                "_blank"
            );
        },
    },
    {
        id: "facebook",
        label: "Facebook",
        icon: Facebook,
        color: "hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950 dark:hover:text-indigo-400",
        action: (url) => {
            window.open(
                `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
                "_blank",
                "noopener,noreferrer,width=600,height=400"
            );
        },
    },
    {
        id: "x",
        label: "X",
        icon: XIcon,
        color: "hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
        action: (url, title) => {
            window.open(
                `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
                "_blank",
                "noopener,noreferrer,width=600,height=400"
            );
        },
    },
    {
        id: "instagram",
        label: "Instagram",
        icon: Instagram,
        color: "hover:bg-pink-50 hover:text-pink-600 dark:hover:bg-pink-950 dark:hover:text-pink-400",
        action: (url) => {
            // Instagram nie wspiera bezpośredniego share linku – kopiujemy do schowka
            navigator.clipboard.writeText(url);
        },
    },
    {
        id: "copy",
        label: "Kopiuj link",
        icon: Link,
        color: "hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950 dark:hover:text-emerald-400",
        action: (url) => {
            navigator.clipboard.writeText(url);
        },
    },
];

export default function ShareIt({
    url = typeof window !== "undefined" ? window.location.href : "",
    title = "",
    className = "",
}) {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(null);

    const handleShare = useCallback(
        (channel) => {
            channel.action(url, title);

            if (channel.id === "copy" || channel.id === "instagram") {
                setCopied(channel.id);
                setTimeout(() => setCopied(null), 2000);
            }
        },
        [url, title]
    );

    return (
        <TooltipProvider delayDuration={0}>
            <Popover open={open} onOpenChange={setOpen}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className={`relative ${className}`}
                                onMouseEnter={() => setOpen(true)}
                                aria-label="Udostępnij"
                            >
                                <Share2 className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                    </TooltipTrigger>
                    {!open && (
                        <TooltipContent side="bottom">
                            <p>Udostępnij</p>
                        </TooltipContent>
                    )}
                </Tooltip>

                <PopoverContent
                    className="w-auto p-1.5"
                    side="bottom"
                    align="center"
                    sideOffset={4}
                    onMouseLeave={() => setOpen(false)}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <div className="flex items-center gap-0.5">
                        {channels.map((channel) => {
                            const Icon = channel.icon;
                            const isCopied = copied === channel.id;

                            return (
                                <Tooltip key={channel.id}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={`h-9 w-9 rounded-lg transition-colors ${channel.color}`}
                                            onClick={() => handleShare(channel)}
                                        >
                                            {isCopied ? (
                                                <Check className="h-4 w-4 text-emerald-500" />
                                            ) : (
                                                <Icon className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="text-xs">
                                        <p>
                                            {isCopied
                                                ? channel.id === "instagram"
                                                    ? "Link skopiowany! Wklej na Instagramie"
                                                    : "Skopiowano!"
                                                : channel.label}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </div>
                </PopoverContent>
            </Popover>
        </TooltipProvider>
    );
}
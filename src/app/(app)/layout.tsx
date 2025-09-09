// app/layout.tsx (or a specific layout file like app/(dashboard)/layout.tsx)

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useClerk, useUser } from '@clerk/nextjs';
import {
    LogOutIcon,
    MenuIcon,
    LayoutDashboardIcon,
    Share2Icon,
    UploadIcon,
    ImageIcon,
    // Add ChevronLeft for sidebar collapse if needed
    // ChevronLeft
} from 'lucide-react';

// Import shadcn components
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    // SheetClose // Optional for closing sheet on link click
} from '@/components/ui/sheet';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Define sidebar items type
type SidebarItem = {
    href: string;
    icon: React.ComponentType<{ className?: string }>; // Expecting Lucide icons
    label: string;
};

const sidebarItems: SidebarItem[] = [
    { href: '/home', icon: LayoutDashboardIcon, label: 'Home Page' },
    { href: '/social-share', icon: Share2Icon, label: 'Social Share' },
    { href: '/video-upload', icon: UploadIcon, label: 'Video Upload' },
    // Add more items here as needed
];

// Define props for the layout
export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { signOut } = useClerk();
    const { user } = useUser();

    const handleLogoClick = () => {
        router.push('/'); // Or '/home' if that's your main dashboard
    };

    const handleSignOut = async () => {
        await signOut();
        // Optional: Redirect after sign out if needed
        // router.push('/sign-in');
    };

    // Function to close sidebar on mobile after navigation (optional)
    const closeSidebar = () => {
        if (window.innerWidth < 768) {
            // Tailwind's md breakpoint
            setSidebarOpen(false);
        }
    };

    return (
        <TooltipProvider>
            {' '}
            {/* Wrap in TooltipProvider for tooltips */}
            <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
                {/* Sidebar for larger screens, hidden on mobile by default */}
                <div className="hidden border-r bg-muted/40 md:block">
                    <div className="flex h-full max-h-screen flex-col gap-2">
                        {/* Sidebar Header/Logo */}
                        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                            <Link
                                href="/"
                                className="flex items-center gap-2 font-semibold"
                            >
                                <ImageIcon className="h-6 w-6" />
                                <span className="">My App</span>
                            </Link>
                        </div>
                        {/* Sidebar Navigation */}
                        <div className="flex-1 overflow-auto py-2">
                            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                                {sidebarItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={closeSidebar} // Close on mobile nav
                                            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                                                isActive
                                                    ? 'bg-muted text-primary'
                                                    : 'text-muted-foreground'
                                            }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex flex-col">
                    {/* Mobile Header with Sheet Trigger */}
                    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
                        {/* Sheet Trigger for Mobile Sidebar */}
                        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="shrink-0 md:hidden"
                                >
                                    <MenuIcon className="h-5 w-5" />
                                    <span className="sr-only">
                                        Toggle navigation menu
                                    </span>
                                </Button>
                            </SheetTrigger>
                            {/* Mobile Sidebar Content (Sheet) */}
                            <SheetContent side="left" className="flex flex-col">
                                {/* Mobile Sidebar Header/Logo */}
                                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                                    <Link
                                        href="/"
                                        className="flex items-center gap-2 font-semibold"
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <ImageIcon className="h-6 w-6" />
                                        <span className="">My App</span>
                                    </Link>
                                </div>
                                {/* Mobile Sidebar Navigation */}
                                <div className="flex-1 overflow-auto py-2">
                                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                                        {sidebarItems.map((item) => {
                                            const Icon = item.icon;
                                            const isActive =
                                                pathname === item.href;
                                            return (
                                                // Optionally wrap Link in SheetClose if needed for smoother close
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    onClick={() => {
                                                        closeSidebar();
                                                        setSidebarOpen(false);
                                                    }} // Ensure close on click
                                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                                                        isActive
                                                            ? 'bg-muted text-primary'
                                                            : 'text-muted-foreground'
                                                    }`}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    {item.label}
                                                </Link>
                                            );
                                        })}
                                    </nav>
                                </div>
                                {/* Optional: Add footer content to the mobile sheet if needed */}
                                {/* <div className="mt-auto p-4">...</div> */}
                            </SheetContent>
                        </Sheet>
                        {/* Optional: Add a desktop logo/title here if different from sidebar */}
                        <div className="w-full flex-1">
                            {/* Could be a search bar or page title */}
                        </div>
                        {/* User Profile Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="rounded-full"
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage
                                            src={user?.imageUrl}
                                            alt={
                                                user?.fullName || 'User Avatar'
                                            }
                                        />
                                        <AvatarFallback>
                                            {user?.firstName?.charAt(0)}
                                            {user?.lastName?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="sr-only">
                                        Toggle user menu
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>
                                    {user?.fullName ||
                                        user?.emailAddresses[0]?.emailAddress ||
                                        'My Account'}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {/* Add more dropdown items here if needed (e.g., Profile, Settings) */}
                                {/* <DropdownMenuItem>Profile</DropdownMenuItem>
                                <DropdownMenuItem>Settings</DropdownMenuItem>
                                <DropdownMenuSeparator /> */}
                                <DropdownMenuItem
                                    onClick={handleSignOut}
                                    className="cursor-pointer"
                                >
                                    <LogOutIcon className="mr-2 h-4 w-4" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </header>
                    {/* Main Content */}
                    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                        {children}
                    </main>
                </div>
            </div>
        </TooltipProvider>
    );
}

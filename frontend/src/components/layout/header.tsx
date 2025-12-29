'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LogOut, User, Home, Mic, Target, History, Menu, X, Sparkles, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/speak', label: 'Practice', icon: Mic },
  { href: '/topics', label: 'Topics', icon: Target },
  { href: '/history', label: 'History', icon: History },
  { href: '/feedback', label: 'Feedback', icon: MessageSquare },
];

export function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between max-w-7xl mx-auto">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text hidden sm:inline-block">
              SpeakEase
            </span>
          </Link>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden md:flex items-center space-x-2 absolute left-1/2 transform -translate-x-1/2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className={cn(
                      'flex items-center gap-2 h-10 px-4',
                      isActive && 'bg-gradient-to-r from-primary to-purple-500 text-white hover:from-primary/90 hover:to-purple-500/90'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
          {/* User Menu - Desktop */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hidden md:flex">
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-purple-500 text-white font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="px-3 py-3 border-b">
                  <p className="text-sm font-semibold">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuItem asChild className="cursor-pointer py-3">
                  <Link href="/profile" className="flex items-center">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span>Profile Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer py-3">
                  <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center mr-3">
                    <LogOut className="h-4 w-4" />
                  </div>
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="flex items-center justify-between mb-8">
                  <Link href="/dashboard" className="flex items-center space-x-3" onClick={() => setOpen(false)}>
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-bold">SpeakEase</span>
                  </Link>
                </div>

                {/* User Info */}
                {user && (
                  <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 border-2 border-primary/20">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-primary/30">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-purple-500 text-white font-semibold text-lg">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mobile Navigation */}
                <nav className="flex-1 space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                    
                    return (
                      <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                        <Button
                          variant={isActive ? 'default' : 'ghost'}
                          className={cn(
                            'w-full justify-start h-12 text-base',
                            isActive && 'bg-gradient-to-r from-primary to-purple-500 text-white'
                          )}
                        >
                          <div className={cn(
                            'h-8 w-8 rounded-lg flex items-center justify-center mr-3',
                            isActive ? 'bg-white/20' : 'bg-primary/10'
                          )}>
                            <Icon className="h-5 w-5" />
                          </div>
                          {item.label}
                        </Button>
                      </Link>
                    );
                  })}
                </nav>

                {/* Mobile Footer Actions */}
                <div className="space-y-2 pt-4 border-t">
                  <Link href="/profile" onClick={() => setOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start h-12">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      Profile Settings
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-12 text-destructive hover:text-destructive"
                    onClick={() => {
                      setOpen(false);
                      logout();
                    }}
                  >
                    <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center mr-3">
                      <LogOut className="h-5 w-5" />
                    </div>
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}


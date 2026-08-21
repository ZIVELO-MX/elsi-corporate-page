"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/safe-image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Menu, Shield, UserRound, X } from "lucide-react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import { useAuth } from "@/components/auth-context";
import {
  isNavigationItemActive,
  type PrimaryNavigationItem,
} from "@/lib/navigation";

export default function Header({
  navigation,
}: {
  navigation: readonly PrimaryNavigationItem[];
}) {
  const { user, requestLogout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setMenuOpen(false); triggerRef.current?.focus(); }
    };
    window.addEventListener("keydown", onKeyDown);
    menuRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    setAccountMenuOpen(false);
    requestLogout();
  };

  // The admin panel is its own full-height shell with its own navigation.
  // (Runs after all hooks so the Rules of Hooks are respected.)
  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="logo-block" aria-label="ELSI, inicio">
          <SafeImage src="/logos/elsi-wordmark.png" alt="ELSI" className="header-logo-img" width={123} height={70} />
        </Link>
        <nav className="header-nav" aria-label="Navegación principal">
          {navigation.map(({ href, label }) => (
            <Link href={href} key={href} aria-current={isNavigationItemActive(pathname, href) ? "page" : undefined}>{label}</Link>
          ))}
        </nav>
        <div className={`header-actions${user ? " header-actions-authenticated" : ""}`}>
          {user ? (
            <DropdownMenuPrimitive.Root open={accountMenuOpen} onOpenChange={setAccountMenuOpen}>
              <DropdownMenuPrimitive.Trigger asChild>
                <button
                  type="button"
                  className="header-user-trigger"
                  aria-haspopup="menu"
                  aria-expanded={accountMenuOpen}
                  aria-label={`Abrir menú de usuario de ${user.name}`}
                >
                  <Avatar>
                    <AvatarImage src={user.avatarUrl} alt="" />
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="header-avatar-name">{user.name}</span>
                  <ChevronDown aria-hidden="true" size={14} />
                </button>
              </DropdownMenuPrimitive.Trigger>
              <DropdownMenuPrimitive.Portal>
                <DropdownMenuPrimitive.Content
                  role="menu"
                  align="end"
                  sideOffset={8}
                  collisionPadding={12}
                  className="header-user-popover"
                >
                  <DropdownMenuPrimitive.Item asChild className="header-user-menu-item">
                    <Link href="/profile">
                      <UserRound aria-hidden="true" size={16} />
                      Mi perfil
                    </Link>
                  </DropdownMenuPrimitive.Item>
                  {user.role === "admin" ? (
                    <DropdownMenuPrimitive.Item asChild className="header-user-menu-item">
                      <Link href="/admin">
                        <Shield aria-hidden="true" size={16} />
                        Panel admin
                      </Link>
                    </DropdownMenuPrimitive.Item>
                  ) : null}
                  <DropdownMenuPrimitive.Separator className="header-user-menu-separator" />
                  <DropdownMenuPrimitive.Item
                    className="header-user-menu-item header-user-menu-logout"
                    onSelect={handleLogout}
                  >
                    <LogOut aria-hidden="true" size={16} />
                    Cerrar sesión
                  </DropdownMenuPrimitive.Item>
                </DropdownMenuPrimitive.Content>
              </DropdownMenuPrimitive.Portal>
            </DropdownMenuPrimitive.Root>
          ) : (
            <>
              <Link href="/login" className="header-contact-link">Iniciar sesión</Link>
              <Button asChild variant="primary" className="header-primary">
                <Link href="/cursos">Explorar cursos</Link>
              </Button>
            </>
          )}
        </div>
        <button ref={triggerRef} type="button" className="header-menu-toggle" aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"} onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
        </button>
      </div>
      <div className="mobile-nav-backdrop" data-open={menuOpen} aria-hidden="true" onClick={() => setMenuOpen(false)} />
      <div id="mobile-navigation" ref={menuRef} className="mobile-navigation" data-open={menuOpen} aria-label="Navegación móvil">
        <nav aria-label="Navegación principal móvil">
          {navigation.map(({ href, label }) => (
            <Link href={href} key={href} aria-current={isNavigationItemActive(pathname, href) ? "page" : undefined} onClick={() => setMenuOpen(false)}>{label}</Link>
          ))}
        </nav>
        <div className="mobile-navigation-actions">
          {user ? (
            <>
              <Link href="/profile" onClick={() => setMenuOpen(false)}>Mi perfil</Link>
              {user.role === "admin" ? <Link href="/admin" onClick={() => setMenuOpen(false)}>Panel admin</Link> : null}
              <button type="button" onClick={handleLogout}>Cerrar sesión</button>
            </>
          ) : <Link href="/login" onClick={() => setMenuOpen(false)}>Iniciar sesión</Link>}
          <Link href="/cursos" className="mobile-navigation-cta" onClick={() => setMenuOpen(false)}>Explorar cursos</Link>
        </div>
      </div>
    </header>
  );
}

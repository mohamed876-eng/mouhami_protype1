"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LogOut, Menu, X } from "lucide-react";
import { icones, tailles } from "@/components/lottie/icones";
import IconeAnimee from "@/components/ui/IconeAnimee";
import LogoMouhami from "@/components/ui/LogoMouhami";
import ReminderBell from "@/components/reminders/ReminderBell";
import { getStoredUser, clearAuth } from "@/lib/auth";

// Navigation PRINCIPALE — unique, chaque entrée possède UNE icône correspondant à SA fonction.
const navItems = [
  { label: "لوحة القيادة", href: "/dashboard", icone: icones.justice },
  { label: "الملفات", href: "/cases", icone: icones.dossiers },
  { label: "الجلسات", href: "/audiences", icone: icones.calendrier },
  { label: "العملاء", href: "/clients", icone: icones.clients },
  { label: "المستندات", href: "/documents", icone: icones.documents },
  { label: "المكتبة", href: "/ai/legal-search", icone: icones.bibliotheque },
  { label: "المساعد", href: "/ai", icone: icones.ajouter },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getStoredUser();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="bg-white shadow-[0_1px_0_0_#E8EEF7] sticky top-0 z-20">
      <div className="flex items-center justify-between lg:grid lg:grid-cols-[1fr_auto_1fr] h-20 lg:h-auto px-4 sm:px-6 lg:px-10 gap-3 sm:gap-6 lg:gap-5">
        {/* Logo — réduit sur petits écrans */}
        <Link href="/dashboard" className="flex items-center shrink-0 lg:justify-self-start lg:col-start-1">
          <LogoMouhami />
        </Link>

        {/* Menu hamburger (mobile/tablette) */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden inline-flex items-center justify-center w-12 h-12 rounded-xl hover:bg-[#EAF2FF] text-[#0F3D91] transition-colors cursor-pointer shrink-0"
          aria-label="القائمة"
        >
          {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>

        {/* Navigation principale — centrée sur l'axe de l'en-tête (grille 1fr auto 1fr) */}
        <nav className="hidden lg:flex items-center gap-3 justify-center overflow-x-auto hide-scrollbar lg:col-start-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center gap-1.5 px-5 py-4 rounded-2xl transition-all duration-250 shrink-0 ${
                  active
                    ? "text-[#0F3D91] font-bold bg-[#EAF2FF]"
                    : "text-[#6B7280] hover:text-[#0F3D91] font-semibold hover:bg-[#EAF2FF]/60"
                }`}
              >
                <IconeAnimee icone={item.icone} taille={tailles.navigation} title={item.label} />
                <span className="text-base whitespace-nowrap">{item.label}</span>
                {active && (
                  <span className="absolute -bottom-0.5 right-1/2 translate-x-1/2 w-10 h-1 bg-[#FF9F1C] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions droite */}
        <div className="flex items-center gap-3 sm:gap-6 shrink-0 lg:justify-self-end lg:col-start-3">
          {/* Cloche de rappel */}
          <ReminderBell />

          {/* Menu utilisateur */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 sm:gap-4 px-2 sm:px-5 py-3 sm:py-4 rounded-xl hover:bg-[#EAF2FF] transition-all duration-250 cursor-pointer"
              aria-label="قائمة المستخدم"
            >
              <div className="w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 xl:w-20 xl:h-20 rounded-full bg-gradient-to-br from-[#0F3D91] to-[#1E5BDB] flex items-center justify-center text-white text-lg sm:text-xl md:text-3xl font-bold shadow-sm">
                {user?.nom?.charAt(0) || "م"}
              </div>
              <div className="hidden xl:block text-right">
                <p className="text-lg font-bold text-[#0E2F6B] leading-tight">
                  {user?.prenom} {user?.nom}
                </p>
                <p className="text-sm text-[#6B7280] leading-tight">محامٍ</p>
              </div>
              <ChevronDown
                className={`hidden sm:block w-6 h-6 text-[#6B7280] transition-transform duration-250 ${
                  showDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute left-0 top-full mt-2 w-72 max-w-[calc(100vw-1rem)] bg-white rounded-card shadow-card border border-border z-20 overflow-hidden animate-scale-in">
                  <div className="p-4 border-b border-border">
                    <p className="font-bold text-[#0E2F6B] text-lg">
                      {user?.prenom} {user?.nom}
                    </p>
                    <p className="text-sm text-[#6B7280] mt-1 break-all">
                      {user?.email}
                    </p>
                  </div>
                  <Link
                    href="/documents"
                    onClick={() => setShowDropdown(false)}
                    className="w-full text-right px-4 py-4 text-lg text-[#0E2F6B] hover:bg-primary-50 transition-colors flex items-center gap-3"
                  >
                    <IconeAnimee icone={icones.documents} taille={tailles.petit} animation="none" title="المستندات" />
                    المستندات
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setShowDropdown(false)}
                    className="w-full text-right px-4 py-4 text-lg text-[#0E2F6B] hover:bg-primary-50 transition-colors flex items-center gap-3"
                  >
                    <IconeAnimee icone={icones.dossiers} taille={tailles.petit} animation="none" title="الإعدادات" />
                    الإعدادات
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-right px-4 py-4 text-lg text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 cursor-pointer border-t border-border"
                  >
                    <LogOut className="w-7 h-7" />
                    تسجيل الخروج
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tiroir de navigation mobile (tablette / mobile) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/30" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-72 max-w-[85vw] bg-white shadow-card overflow-y-auto animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <LogoMouhami />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl hover:bg-[#EAF2FF] text-[#0F3D91] cursor-pointer"
                aria-label="إغلاق"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="p-3 space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-250 ${
                      active
                        ? "bg-[#EAF2FF] text-[#0F3D91] font-bold"
                        : "text-[#6B7280] font-semibold hover:bg-[#EAF2FF]/60 hover:text-[#0F3D91]"
                    }`}
                  >
                    <IconeAnimee icone={item.icone} taille={tailles.petit} title={item.label} />
                    <span className="text-base">{item.label}</span>
                  </Link>
                );
              })}
              <div className="border-t border-border pt-2 mt-2 space-y-1">
                <Link
                  href="/documents"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-4 rounded-xl text-[#0E2F6B] hover:bg-[#EAF2FF]/60 font-semibold"
                >
                  <IconeAnimee icone={icones.documents} taille={tailles.petit} animation="none" title="المستندات" />
                  المستندات
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-4 rounded-xl text-[#0E2F6B] hover:bg-[#EAF2FF]/60 font-semibold"
                >
                  <IconeAnimee icone={icones.dossiers} taille={tailles.petit} animation="none" title="الإعدادات" />
                  الإعدادات
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-red-600 hover:bg-red-50 font-semibold cursor-pointer"
                >
                  <LogOut className="w-6 h-6" />
                  تسجيل الخروج
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LogOut } from "lucide-react";
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

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <header className="h-54 bg-white shadow-[0_1px_0_0_#E8EEF7] sticky top-0 z-20">
      <div className="flex items-center justify-between h-full px-10 gap-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center shrink-0">
          <LogoMouhami />
        </Link>

        {/* Navigation principale — décalée de 1,5cm (~57px) vers la gauche pour
            laisser suffisamment de place au logo Lottie élargi. */}
        <nav className="flex items-center gap-3 flex-1 justify-center overflow-x-auto hide-scrollbar mr-[57px]">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center gap-2 px-6 py-5 rounded-2xl transition-all duration-250 min-w-[110px] ${
                  isActive
                    ? "text-[#0F3D91] font-bold bg-[#EAF2FF]"
                    : "text-[#6B7280] hover:text-[#0F3D91] font-semibold hover:bg-[#EAF2FF]/60"
                }`}
              >
                <IconeAnimee icone={item.icone} taille={tailles.navigation} title={item.label} />
                <span className="text-lg whitespace-nowrap">{item.label}</span>
                {isActive && (
                  <span className="absolute -bottom-0.5 right-1/2 translate-x-1/2 w-10 h-1 bg-[#FF9F1C] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions droite */}
        <div className="flex items-center gap-6 shrink-0">
          {/* Cloche de rappel */}
          <ReminderBell />

          {/* Menu utilisateur */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-4 px-5 py-4 rounded-xl hover:bg-[#EAF2FF] transition-all duration-250 cursor-pointer"
              aria-label="قائمة المستخدم"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0F3D91] to-[#1E5BDB] flex items-center justify-center text-white text-3xl font-bold shadow-sm">
                {user?.nom?.charAt(0) || "م"}
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-xl font-bold text-[#0E2F6B] leading-tight">
                  {user?.prenom} {user?.nom}
                </p>
                <p className="text-base text-[#6B7280] leading-tight">محامٍ</p>
              </div>
              <ChevronDown
                className={`w-6 h-6 text-[#6B7280] transition-transform duration-250 ${
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
                <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-card shadow-card border border-border z-20 overflow-hidden animate-scale-in">
                  <div className="p-4 border-b border-border">
                    <p className="font-bold text-[#0E2F6B] text-lg">
                      {user?.prenom} {user?.nom}
                    </p>
                    <p className="text-sm text-[#6B7280] mt-1">
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
    </header>
  );
}

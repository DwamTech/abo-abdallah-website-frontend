"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { FooterContact } from "@/lib/footerContact";

const FooterContactContext = createContext<FooterContact | null>(null);

export function FooterContactProvider({
  contact,
  children,
}: {
  contact: FooterContact;
  children: ReactNode;
}) {
  return (
    <FooterContactContext.Provider value={contact}>
      {children}
    </FooterContactContext.Provider>
  );
}

export function useFooterContact() {
  return useContext(FooterContactContext);
}

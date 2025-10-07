"use client";

import React from "react";
import { RepositoryProvider } from "@/contexts/RepositoryContext";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RepositoryProvider>{children}</RepositoryProvider>;
}

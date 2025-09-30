//frontend\src\app\admin\layout.tsx
"use client";

import React, { ReactNode } from "react";
import AdminLayoutClient from "./AdminLayoutClient";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}

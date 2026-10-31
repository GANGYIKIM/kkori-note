import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseCatalog } from "@/components/preview/CaseCatalog";

export const metadata: Metadata = { title: "PRD 장면 미리보기 · 꼬리노트" };

export default function PreviewCasesPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <CaseCatalog />;
}

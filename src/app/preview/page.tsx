import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComponentCatalog } from "@/components/preview/ComponentCatalog";

export const metadata: Metadata = { title: "컴포넌트 미리보기 · 꼬리노트" };

export default function PreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <ComponentCatalog />;
}

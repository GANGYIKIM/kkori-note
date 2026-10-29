import type { Metadata } from "next";
import { PreviewCatalog } from "@/components/preview/PreviewCatalog";

export const metadata: Metadata = { title: "컴포넌트 미리보기 · 꼬리노트" };

export default function PreviewPage() {
  return <PreviewCatalog />;
}

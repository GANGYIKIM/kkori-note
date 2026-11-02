import type { Variant } from "@/components/preview/variant";
import { Skeleton } from "./Skeleton";

const variants: Variant[] = [
  { name: "글 한 줄", render: () => <Skeleton className="h-4 w-40" /> },
  { name: "말풍선", render: () => <Skeleton className="h-12 w-56 rounded-2xl" /> },
];

export { variants };

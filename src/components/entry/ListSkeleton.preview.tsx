import type { Variant } from "@/components/preview/variant";
import { ListSkeleton } from "./ListSkeleton";

const variants: Variant[] = [{ name: "3줄", render: () => <ListSkeleton /> }];

export { variants };

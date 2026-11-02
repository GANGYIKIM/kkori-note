import type { Variant } from "@/components/preview/variant";
import { ConversationSkeleton } from "./ConversationSkeleton";

const variants: Variant[] = [{ name: "말풍선 2개", render: () => <ConversationSkeleton /> }];

export { variants };

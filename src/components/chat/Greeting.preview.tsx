import type { Variant } from "@/components/preview/variant";
import { Greeting } from "./Greeting";

const variants: Variant[] = [{ name: "대화 없음", render: () => <Greeting /> }];

export { variants };

import { variants as Banner } from "@/components/common/Banner.preview";
import { variants as EmptyState } from "@/components/common/EmptyState.preview";
import { variants as Icons } from "@/components/common/Icons.preview";
import { variants as ListRow } from "@/components/common/ListRow.preview";
import { variants as Tag } from "@/components/common/Tag.preview";
import { variants as UnitInput } from "@/components/common/UnitInput.preview";
import { variants as AppHeader } from "@/components/layout/AppHeader.preview";
import { variants as BottomSheet } from "@/components/layout/BottomSheet.preview";
import { variants as SidePanel } from "@/components/layout/SidePanel.preview";
import { variants as Conversation } from "@/components/chat/Conversation.preview";
import { variants as EntryChipCard } from "@/components/chat/EntryChipCard.preview";
import { variants as EpisodeCard } from "@/components/chat/EpisodeCard.preview";
import { variants as EvidenceCard } from "@/components/chat/EvidenceCard.preview";
import { variants as MessageComposer } from "@/components/chat/MessageComposer.preview";
import { variants as RiskBanner } from "@/components/chat/RiskBanner.preview";
import { variants as DateGroupedList } from "@/components/entry/DateGroupedList.preview";
import { variants as EditSheet } from "@/components/entry/EditSheet.preview";
import { variants as OngoingEpisodeBar } from "@/components/entry/OngoingEpisodeBar.preview";
import { variants as Home } from "@/components/main/Home.preview";
import { variants as ProfileForm } from "@/components/settings/ProfileForm.preview";
import { variants as ErrorState } from "@/components/common/ErrorState.preview";
import { variants as LoadStateView } from "@/components/common/LoadStateView.preview";
import { variants as ScrollArea } from "@/components/common/ScrollArea.preview";
import { variants as Skeleton } from "@/components/common/Skeleton.preview";
import { variants as ConversationSkeleton } from "@/components/chat/ConversationSkeleton.preview";
import { variants as Greeting } from "@/components/chat/Greeting.preview";
import { variants as FirstRecordGuide } from "@/components/entry/FirstRecordGuide.preview";
import { variants as ListSkeleton } from "@/components/entry/ListSkeleton.preview";
import type { Variant } from "./variant";

const FOLDER_ORDER = ["common", "layout", "chat", "entry", "main", "settings"] as const;

/** 컴포넌트 탭에 그릴 목록. 경로는 `src/components` 기준 폴더/파일 이름이다 */
const CATALOG: Record<string, readonly Variant[]> = {
  "common/Banner": Banner,
  "common/EmptyState": EmptyState,
  "common/ErrorState": ErrorState,
  "common/Icons": Icons,
  "common/ListRow": ListRow,
  "common/LoadStateView": LoadStateView,
  "common/ScrollArea": ScrollArea,
  "common/Skeleton": Skeleton,
  "common/Tag": Tag,
  "common/UnitInput": UnitInput,
  "layout/AppHeader": AppHeader,
  "layout/BottomSheet": BottomSheet,
  "layout/SidePanel": SidePanel,
  "chat/Conversation": Conversation,
  "chat/ConversationSkeleton": ConversationSkeleton,
  "chat/EntryChipCard": EntryChipCard,
  "chat/EpisodeCard": EpisodeCard,
  "chat/EvidenceCard": EvidenceCard,
  "chat/Greeting": Greeting,
  "chat/MessageComposer": MessageComposer,
  "chat/RiskBanner": RiskBanner,
  "entry/DateGroupedList": DateGroupedList,
  "entry/EditSheet": EditSheet,
  "entry/FirstRecordGuide": FirstRecordGuide,
  "entry/ListSkeleton": ListSkeleton,
  "entry/OngoingEpisodeBar": OngoingEpisodeBar,
  "main/Home": Home,
  "settings/ProfileForm": ProfileForm,
};

export { CATALOG, FOLDER_ORDER };

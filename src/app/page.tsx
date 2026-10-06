import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { ChatPane } from "@/components/ChatPane";
import { FeatureDrawer } from "@/components/FeatureDrawer";

export default function Home() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-zinc-950">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <ChatPane />
      </div>
      <FeatureDrawer />
    </div>
  );
}

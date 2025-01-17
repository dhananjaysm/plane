import { observer } from "mobx-react-lite";
import useSWR from "swr";
import { TPageNavigationTabs } from "@plane/types";
// components
import { PagesListHeaderRoot, PagesListMainContent } from "@/components/pages";
// hooks
import { useProjectPages } from "@/hooks/store";

type TPageView = {
  workspaceSlug: string;
  projectId: string;
  pageType: TPageNavigationTabs;
  children: React.ReactNode;
};

export const PagesListView: React.FC<TPageView> = observer((props) => {
  const { workspaceSlug, projectId, pageType, children } = props;
  // store hooks
  const { getAllPages } = useProjectPages(projectId);
  // fetching pages list
  useSWR(
    projectId && pageType ? `PROJECT_PAGES_${projectId}_${pageType}` : null,
    projectId && pageType ? () => getAllPages(pageType) : null
  );

  // pages loader
  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col">
      {/* tab header */}
      <PagesListHeaderRoot pageType={pageType} projectId={projectId} workspaceSlug={workspaceSlug} />
      <PagesListMainContent pageType={pageType} projectId={projectId}>
        {children}
      </PagesListMainContent>
    </div>
  );
});

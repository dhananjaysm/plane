import { FC } from "react";
import { observer } from "mobx-react-lite";
// hooks
import { useIssueDetail } from "@/hooks/store";
// components
import { TActivityOperations } from "../root";
import { IssueCommentCard } from "./comment-card";
// types

type TIssueCommentRoot = {
  projectId: string;
  workspaceSlug: string;
  issueId: string;
  activityOperations: TActivityOperations;
  showAccessSpecifier?: boolean;
  disabled?: boolean;
};

export const IssueCommentRoot: FC<TIssueCommentRoot> = observer((props) => {
  const { workspaceSlug, projectId, issueId, activityOperations, showAccessSpecifier, disabled } = props;
  // hooks
  const {
    comment: { getCommentsByIssueId },
  } = useIssueDetail();

  const commentIds = getCommentsByIssueId(issueId);
  if (!commentIds) return <></>;

  return (
    <div>
      {commentIds.map((commentId, index) => (
        <IssueCommentCard
          projectId={projectId}
          key={commentId}
          workspaceSlug={workspaceSlug}
          commentId={commentId}
          ends={index === 0 ? "top" : index === commentIds.length - 1 ? "bottom" : undefined}
          activityOperations={activityOperations}
          showAccessSpecifier={showAccessSpecifier}
          disabled={disabled}
        />
      ))}
    </div>
  );
});

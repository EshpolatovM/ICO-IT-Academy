'use client';

import { Badge } from './Badge';
import { Button } from './Button';
import { isPresentNode } from './isPresentNode';

import type { TreeListItem, TreeListMoveContext, TreeListMoveHandler } from './TreeList.types';

export interface TreeListRowProps {
  item: TreeListItem;
  context: TreeListMoveContext;
  isLast: boolean;
  expanded: boolean;
  groupId: string;
  onToggle: () => void;
  onMoveUp?: TreeListMoveHandler;
  onMoveDown?: TreeListMoveHandler;
  moveDisabled: boolean;
}

function ToggleButton({ item, expanded, groupId, onToggle }: TreeListRowProps) {
  const hasChildren = (item.children?.length ?? 0) > 0;
  if (!hasChildren) {
    return <span aria-hidden="true" className="w-8" />;
  }
  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-8 px-0"
      aria-expanded={expanded}
      aria-controls={groupId}
      aria-label={`${expanded ? "Yig'ish" : 'Yoyish'}: ${item.title}`}
      onClick={onToggle}
    >
      <span aria-hidden="true">{expanded ? '−' : '+'}</span>
    </Button>
  );
}

function MoveButtons({
  item,
  context,
  isLast,
  onMoveUp,
  onMoveDown,
  moveDisabled,
}: TreeListRowProps) {
  return (
    <>
      {onMoveUp !== undefined ? (
        <Button
          variant="secondary"
          size="sm"
          aria-label={`Yuqoriga: ${item.title}`}
          disabled={moveDisabled || context.index === 0}
          onClick={() => {
            onMoveUp(item, context);
          }}
        >
          Yuqoriga
        </Button>
      ) : null}
      {onMoveDown !== undefined ? (
        <Button
          variant="secondary"
          size="sm"
          aria-label={`Pastga: ${item.title}`}
          disabled={moveDisabled || isLast}
          onClick={() => {
            onMoveDown(item, context);
          }}
        >
          Pastga
        </Button>
      ) : null}
    </>
  );
}

/** TreeList'ning bitta qatori: yoyish tugmasi, sarlavha, Badge, amallar va tartiblash. */
export function TreeListRow(props: TreeListRowProps) {
  const { item } = props;
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-border-muted bg-bg px-2 py-1">
      <ToggleButton {...props} />
      <span className="font-medium text-text">{item.title}</span>
      {item.status !== undefined ? (
        <Badge variant={item.status.variant}>{item.status.label}</Badge>
      ) : null}
      <div className="ml-auto flex flex-wrap items-center gap-2">
        {isPresentNode(item.actions) ? item.actions : null}
        <MoveButtons {...props} />
      </div>
    </div>
  );
}

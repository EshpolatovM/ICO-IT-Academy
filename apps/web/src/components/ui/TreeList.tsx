'use client';

import { useCallback, useId, useState } from 'react';

import { TreeListRow } from './TreeListRow';

import type { TreeListItem, TreeListProps } from './TreeList.types';

type BranchProps = Omit<TreeListProps, 'items' | 'label' | 'defaultExpanded' | 'className'> & {
  items: readonly TreeListItem[];
  parentId: string | null;
  isExpanded: (id: string) => boolean;
  toggle: (id: string) => void;
  idPrefix: string;
  listId?: string;
  ariaLabel?: string;
};

/** Ochiq/yopiq holat: faqat "standartdan farq qilgan" id'lar saqlanadi. */
function useExpandedState(defaultExpanded: boolean) {
  const [toggled, setToggled] = useState<ReadonlySet<string>>(() => new Set());
  const isExpanded = useCallback(
    (id: string) => (toggled.has(id) ? !defaultExpanded : defaultExpanded),
    [toggled, defaultExpanded],
  );
  const toggle = useCallback((id: string) => {
    setToggled((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);
  return { isExpanded, toggle };
}

function TreeBranch(props: BranchProps) {
  const { items, parentId, isExpanded, toggle, idPrefix, listId, ariaLabel, ...rowProps } = props;
  return (
    <ul id={listId} aria-label={ariaLabel} className="flex flex-col gap-1">
      {items.map((item, index) => {
        const expanded = isExpanded(item.id);
        const groupId = `${idPrefix}-${item.id}`;
        const children = item.children ?? [];
        return (
          <li key={item.id} className="flex flex-col gap-1">
            <TreeListRow
              item={item}
              context={{ parentId, index }}
              isLast={index === items.length - 1}
              expanded={expanded}
              groupId={groupId}
              onToggle={() => {
                toggle(item.id);
              }}
              onMoveUp={rowProps.onMoveUp}
              onMoveDown={rowProps.onMoveDown}
              moveDisabled={rowProps.moveDisabled ?? false}
            />
            {children.length > 0 ? (
              <div className="pl-6" hidden={!expanded}>
                <TreeBranch
                  {...props}
                  items={children}
                  parentId={item.id}
                  listId={groupId}
                  ariaLabel={undefined}
                />
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Admin kontent daraxti (yo'l → bo'lim → mavzu → dars): ichma-ich `ul`, yoyish tugmasida
 * `aria-expanded`, har qatorda "Yuqoriga"/"Pastga" tugmalari. Drag-and-drop yo'q.
 */
export function TreeList({
  items,
  label,
  defaultExpanded = true,
  className,
  ...rest
}: TreeListProps) {
  const idPrefix = useId();
  const { isExpanded, toggle } = useExpandedState(defaultExpanded);
  return (
    <div className={className}>
      <TreeBranch
        {...rest}
        items={items}
        parentId={null}
        isExpanded={isExpanded}
        toggle={toggle}
        idPrefix={idPrefix}
        ariaLabel={label}
      />
    </div>
  );
}

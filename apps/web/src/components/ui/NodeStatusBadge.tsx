import { Badge } from './Badge';
import { CHEST_STATUS_VIEW, TOPIC_STATUS_VIEW } from './nodeStatus';

import type { ChestNodeStatus, TopicNodeStatus } from './nodeStatus';

export type NodeStatusBadgeProps =
  | { kind: 'TOPIC'; status: TopicNodeStatus; className?: string }
  | { kind: 'CHEST'; status: ChestNodeStatus; className?: string };

/**
 * Mavzu yoki sandiq holati: oddiy belgi + matn. Ma'no rangda emas, matnda
 * (rang faqat mavjud semantik Badge variantlaridan).
 */
export function NodeStatusBadge(props: NodeStatusBadgeProps) {
  const view =
    props.kind === 'TOPIC' ? TOPIC_STATUS_VIEW[props.status] : CHEST_STATUS_VIEW[props.status];

  return (
    <Badge variant={view.variant} className={props.className}>
      <span aria-hidden="true" className="mr-1">
        {view.symbol}
      </span>
      {view.label}
    </Badge>
  );
}

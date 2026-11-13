'use client';

import {
  Alert,
  Button,
  EmptyState,
  PageHeader,
  PathSection,
  ProgressBar,
  Stack,
} from '@/components/ui';

import { findCurrentTopicId } from '../lib/current-node';
import { toSectionNode } from '../lib/path-nodes';

import type { ReviewBlock, StudentPathMap } from '../types/learning-path.types';

const PAGE_TITLE = "Ilm yo'li";
const CURRENT_NODE_SELECTOR = '[aria-current="step"]';

/** "Joriy joyga o'tish" (docs/03 §2.1). */
function scrollToCurrent(): void {
  document.querySelector(CURRENT_NODE_SELECTOR)?.scrollIntoView({ block: 'center' });
}

function ReviewBlockAlert({ reviewBlock }: { reviewBlock: ReviewBlock }) {
  if (!reviewBlock.blocked) {
    return null;
  }
  return (
    <Alert variant="warning" title="Takrorlash kerak">
      Yangi dars ochilishi uchun avval takrorlang ({reviewBlock.dueCount} ta mavzu).
    </Alert>
  );
}

/** Xarita: yo'l nomi va progressi, "takrorlash kerak" belgisi, bo'limlar zanjiri. */
export function PathMapView({ map }: { map: StudentPathMap }) {
  if (map.path === null) {
    return (
      <Stack gap="6">
        <PageHeader title={PAGE_TITLE} />
        <EmptyState
          title="Ilm yo'li hali biriktirilmagan"
          description="Guruhingizga yo'l biriktirilgach, xarita shu yerda paydo bo'ladi."
        />
      </Stack>
    );
  }
  const currentTopicId = findCurrentTopicId(map.sections);
  return (
    <Stack gap="6">
      <PageHeader
        title={map.path.title}
        actions={
          currentTopicId === null ? null : (
            <Button variant="secondary" size="sm" onClick={scrollToCurrent}>
              Joriy joyga o&apos;tish
            </Button>
          )
        }
      />
      <ProgressBar value={map.path.progress} label="Yo'l progressi" />
      <ReviewBlockAlert reviewBlock={map.reviewBlock} />
      {map.sections.length === 0 ? (
        <EmptyState title="Yo'lda hali mavzu yo'q" description="Mavzular qo'shilgach ko'rinadi." />
      ) : (
        map.sections.map((section) => (
          <PathSection
            key={section.id}
            title={section.title}
            progress={section.progress}
            nodes={section.nodes.map((node) => toSectionNode(node, currentTopicId))}
          />
        ))
      )}
    </Stack>
  );
}

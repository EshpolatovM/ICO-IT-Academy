'use client';

import { QueryView } from '@/components/shared';

import { usePathMap } from '../hooks/useLearningPathQueries';

import { PathMapView } from './PathMapView';

/** `/path` — ilm yo'li xaritasi (docs/03 §2.1). */
export function PathMapPage() {
  return <QueryView query={usePathMap()}>{(map) => <PathMapView map={map} />}</QueryView>;
}

import { TextLink } from '@/components/ui';
import { SAFE_IMAGE_PROTOCOLS, toSafeUrl } from '@/lib/safeUrl';

/** Video — faqat `https:` havola, yangi tabda; embed yo'q (Q-10). Xavfsiz bo'lmasa — chiqmaydi. */
export function LessonVideoLink({ videoUrl }: { videoUrl: string | null }) {
  const href = toSafeUrl(videoUrl, SAFE_IMAGE_PROTOCOLS);
  if (href === null) {
    return null;
  }
  return (
    <TextLink href={href} external className="self-start">
      Videoni ko&apos;rish (yangi oynada)
    </TextLink>
  );
}

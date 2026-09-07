import { classRoleEmojiUrl, type ClassRoleEmoji } from "@/lib/botInternalApi";

export function EmojiIcon({ emoji, label }: { emoji: ClassRoleEmoji | undefined; label: string }) {
  const src = classRoleEmojiUrl(emoji);
  if (!src) return null;

  // eslint-disable-next-line @next/next/no-img-element -- external Discord CDN, not a local asset
  return <img src={src} alt={label} title={label} className="inline-block h-4 w-4 align-text-bottom" />;
}

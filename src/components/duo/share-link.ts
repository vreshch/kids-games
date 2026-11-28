/** Shares the link with the phone's share sheet, or copies it where there is none. */
export async function shareLink(title: string, link: string) {
  if (navigator.share) return navigator.share({ title, url: link }).then(() => false);
  await navigator.clipboard.writeText(link);
  return true;
}

/** The link to this page with the room in it, for the friend. */
export const roomLink = (room: string | null) =>
  room ? `${location.origin}${location.pathname}?room=${room}` : '';

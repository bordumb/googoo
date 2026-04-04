/** Deterministic listing image URL using picsum.photos. */
export function listingImage(id: string, index: number): string {
  return `https://picsum.photos/seed/listing-${id}-${index}/400/300`;
}

/** Deterministic avatar URL using picsum.photos. */
export function avatarImage(id: string): string {
  return `https://picsum.photos/seed/avatar-${id}/100/100`;
}

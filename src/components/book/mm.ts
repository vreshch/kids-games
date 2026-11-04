/** Inside a book sheet the spacing unit is one millimetre, so text sizes use the same scale. */
export function mm(value: number): string {
  return `calc(var(--spacing) * ${value})`;
}

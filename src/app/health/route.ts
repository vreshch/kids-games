import { healthResponse } from '@agentage/observability/health';

// Never prerender, or commit/buildTime are baked at build instead of read from the
// running container.
export const dynamic = 'force-dynamic';
export const GET = () => healthResponse({ service: 'kids-games-web' });

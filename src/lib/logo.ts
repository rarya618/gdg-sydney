import { existsSync } from 'node:fs';
import { join } from 'node:path';

// The site is dark, so it needs the official GDG Sydney logo for dark backgrounds. Drop it in
// public/ as gdg-logo-dark.png and it is used everywhere on the next build. Until then the
// light-background logo is shown on a light chip: the brand guide rules out recolouring it.
const DARK_LOGO = 'gdg-logo-dark.png';

export const hasDarkLogo = existsSync(join(process.cwd(), 'public', DARK_LOGO));

export const logoSrc = hasDarkLogo ? `/${DARK_LOGO}` : '/gdg-logo-light.png';

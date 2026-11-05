import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// The site is dark, so it needs the official GDG Sydney logo for dark backgrounds. Drop it in
// public/ as gdg-logo-dark.png and it is used everywhere on the next build. Until then the
// light-background logo is shown on a light chip: the brand guide rules out recolouring it.
const DARK_LOGO = 'gdg-logo-dark.png';
const LIGHT_LOGO = 'gdg-logo-light.png';

export const hasDarkLogo = existsSync(join(process.cwd(), 'public', DARK_LOGO));

const file = hasDarkLogo ? DARK_LOGO : LIGHT_LOGO;

export const logoSrc = `/${file}`;

// Intrinsic size, read from the PNG header (width and height are big-endian at bytes 16
// and 20), so the <img> tags can reserve their space and the header doesn't shift on load.
const png = readFileSync(join(process.cwd(), 'public', file));
export const logoWidth = png.readUInt32BE(16);
export const logoHeight = png.readUInt32BE(20);

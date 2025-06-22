export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';

// MVP Game Settings Limits & Defaults
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 10; // Actualizado de 4 a 10
export const DEFAULT_NUM_PLAYERS = 2;

export const MIN_ROUNDS_PER_PLAYER = 1;
export const MAX_ROUNDS_PER_PLAYER = 10; // Actualizado de 5 a 10
export const DEFAULT_NUM_ROUNDS_PER_PLAYER = 2;

export const MIN_TOPICS = 1;
export const MAX_TOPICS = 5;

export const PLAYER_DEFAULT_NAME_PREFIX = "Jugador"; // e.g., Jugador 1, Jugador 2

export const AVATARS: string[] = ['👽', '🤖', '👾', '🚀', '🌟', '🧠', '💡', '🎮', '👑', '🧙', '🧑‍🚀', '🦄'];
export const DEFAULT_AVATAR = AVATARS[0];

// Neon Styles (classes for Tailwind) - Keep these as they are, or adjust if needed
export const BG_DARK_MAIN = 'bg-slate-900'; // #1a202c

export const NEON_PINK = '#ff00ff';
export const NEON_BLUE = '#00ffff';
export const NEON_GREEN = '#39FF14';
export const NEON_RED = '#FF3131';

export const TEXT_NEON_PINK = 'text-pink-500';
export const BORDER_NEON_PINK = 'border-pink-500';
export const SHADOW_NEON_PINK_HOVER = 'hover:shadow-[0_0_15px_2px_rgba(236,72,153,0.6)]';
export const SHADOW_NEON_PINK = 'shadow-[0_0_10px_1px_rgba(236,72,153,0.5)]';

export const TEXT_NEON_BLUE = 'text-cyan-400';
export const BORDER_NEON_BLUE = 'border-cyan-400';
export const SHADOW_NEON_BLUE_HOVER = 'hover:shadow-[0_0_15px_2px_rgba(34,211,238,0.6)]';
export const SHADOW_NEON_BLUE = 'shadow-[0_0_10px_1px_rgba(34,211,238,0.5)]';

export const TEXT_NEON_GREEN = 'text-green-400';
export const BORDER_NEON_GREEN = 'border-green-400';

export const TEXT_NEON_RED = 'text-red-500';
export const BORDER_NEON_RED = 'border-red-500';

export const TITLE_FONT_FAMILY = 'font-poppins-extrabold';
export const BODY_FONT_FAMILY = 'font-inter';
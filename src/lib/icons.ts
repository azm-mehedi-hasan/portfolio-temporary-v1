import {
  IconArticle,
  IconBolt,
  IconBook,
  IconBrandDiscord,
  IconBrandFacebook,
  IconBrandGithub,
  IconBrandGmail,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandMedium,
  IconBrandStackoverflow,
  IconBrandTelegram,
  IconBrandWhatsapp,
  IconBrandX,
  IconBrandYoutube,
  IconBriefcase2,
  IconCode,
  IconFileText,
  IconHome,
  IconMail,
  IconMessage2,
  IconPhone,
  IconPhoto,
  IconSparkles,
  IconUser,
  IconWorld,
  type TablerIconsProps,
} from "@tabler/icons-react";

/**
 * Explicit allowlist mapping a stored string to a component.
 *
 * Icons cannot be serialized into a database row, so NavLink/Social store a
 * name. Resolution goes through this map rather than a dynamic import, so a
 * value in the database can never cause an arbitrary module to be loaded.
 */
export const ICONS = {
  IconArticle,
  IconBolt,
  IconBook,
  IconBrandDiscord,
  IconBrandFacebook,
  IconBrandGithub,
  IconBrandGmail,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandMedium,
  IconBrandStackoverflow,
  IconBrandTelegram,
  IconBrandWhatsapp,
  IconBrandX,
  IconBrandYoutube,
  IconBriefcase2,
  IconCode,
  IconFileText,
  IconHome,
  IconMail,
  IconMessage2,
  IconPhone,
  IconPhoto,
  IconSparkles,
  IconUser,
  IconWorld,
} as const;

export type IconName = keyof typeof ICONS;

export const ICON_NAMES = Object.keys(ICONS) as IconName[];

export function isIconName(value: string): value is IconName {
  return value in ICONS;
}

/** Falls back to a neutral icon so an unknown name never crashes a page. */
export function getIcon(name: string): React.ComponentType<TablerIconsProps> {
  return isIconName(name) ? ICONS[name] : IconWorld;
}

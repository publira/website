import { createNavigation } from "next-intl/navigation";

import { routing } from "#i18n/routing";

export const { getPathname, Link, usePathname } = createNavigation(routing);

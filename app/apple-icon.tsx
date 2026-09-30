import { renderAppIcon } from "#components/app-icon";

export const size = { height: 180, width: 180 };
export const contentType = "image/png";

const appleIcon = () => renderAppIcon(size);

export default appleIcon;

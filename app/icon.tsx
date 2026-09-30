import { renderAppIcon } from "#components/app-icon";

export const size = { height: 32, width: 32 };
export const contentType = "image/png";

const icon = () => renderAppIcon(size);

export default icon;

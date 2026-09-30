import { ImageResponse } from "next/og";

import { loadOrganizationAvatar } from "#lib/image-assets";

/** The GitHub organization's avatar, scaled to one icon size. */
export const renderAppIcon = async (size: {
  readonly height: number;
  readonly width: number;
}) => {
  const avatar = await loadOrganizationAvatar();

  return new ImageResponse(
    <div
      style={{
        backgroundImage: `url(${avatar})`,
        backgroundSize: "100% 100%",
        height: "100%",
        width: "100%",
      }}
    />,
    size
  );
};

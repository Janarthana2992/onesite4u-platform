"use client";

import { QRCodeSVG } from "qrcode.react";


/**
 * A real, scannable QR code for the profile URL, with the brand mark punched
 * out of the middle (error correction level H leaves room for it).
 */
export function ProfileQr({ size = 220, value }: { size?: number; value: string }) {
  return (
    <QRCodeSVG
      value={value}
      size={size}
      level="H"
      marginSize={2}
      bgColor="#ffffff"
      fgColor="#111827"
      title="Scan to open this profile"
      imageSettings={{
        src:
          "data:image/svg+xml;base64," +
          btoa(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44">' +
              '<rect width="44" height="44" rx="10" fill="#4f46e5"/>' +
              '<text x="22" y="29" text-anchor="middle" font-family="system-ui,sans-serif" ' +
              'font-size="17" font-weight="800" fill="#fff">1S</text>' +
              "</svg>",
          ),
        height: 44,
        width: 44,
        excavate: true,
      }}
    />
  );
}

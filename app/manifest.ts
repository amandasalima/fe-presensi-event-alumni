import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Presensi Event Alumni Al-Falah",
    short_name: "Presensi Al-Falah",
    description: "Sistem Presensi Event Alumni Pondok Pesantren Al-Qur'an Al-Falah",
    start_url: "/",
    display: "standalone",
    background_color: "#0D5C3A",
    theme_color: "#0D5C3A",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/images/logo-pesantren.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "3D Print Cost",
    short_name: "PrintCost",
    description: "Calculate true 3D printing costs and manage profit margins",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#6366f1",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

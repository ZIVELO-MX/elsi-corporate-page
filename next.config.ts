import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      { source: "/shop", destination: "/cursos", permanent: true },
      { source: "/tienda", destination: "/cursos", permanent: true },
      { source: "/finalizar-compra", destination: "/checkout", permanent: true },
      { source: "/account", destination: "/profile", permanent: true },
      { source: "/mi-cuenta", destination: "/profile", permanent: true },
    ];
  },
};
export default nextConfig;

const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: isProd ? '/dev-portfolio' : '',
};

export default nextConfig;

// const isProd = process.env.NODE_ENV === 'production';
// const basePath = isProd ? '/dev-portfolio' : '';

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   output: 'export',
//   images: {
//     unoptimized: true,
//   },
//   basePath,
//   env: {
//     NEXT_PUBLIC_BASE_PATH: basePath,
//   },
// };

// export default nextConfig;
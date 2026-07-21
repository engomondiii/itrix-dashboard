import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Pin the workspace root to THIS directory.
   *
   * Next walks up looking for a lockfile to infer the root, and there is a
   * stray `package.json` + `package-lock.json` in the user profile directory
   * (`C:\Users\<user>\`, an unrelated one-off `docx` install). Next was picking
   * that as the root and warning on every build, which also means module
   * resolution and output tracing were anchored several levels above the repo.
   *
   * The same stray file is why `npm install` fails in here with a confusing
   * ERESOLVE about a dependency this project does not have: npm walks up too,
   * finds that package.json, and resolves against it as "the root project".
   * This repo is pnpm — see the `packageManager` field in package.json.
   */
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;

/**
 * Refuse npm and yarn in this repo, with an explanation.
 *
 * WHY THIS EXISTS. `npm install` here does not fail because of a dependency
 * conflict — it fails because pnpm's `node_modules/.pnpm/` virtual store is not
 * a shape npm understands. npm walks into it, treats each of the ~965 packages
 * there as part of the tree, and starts resolving THEIR devDependencies. The
 * confusing result is an ERESOLVE naming a package this project has never heard
 * of (`knip`, which is a devDependency of `@eslint-community/eslint-utils`),
 * after several minutes of work.
 *
 * That error is unactionable — there is nothing to fix in the graph, and
 * `--force` / `--legacy-peer-deps` would "succeed" by writing a broken
 * node_modules over pnpm's. So the guard fails fast and says what to run.
 *
 * `packageManager` in package.json is the declarative half of this; corepack
 * enforces it for `pnpm`/`yarn` shims but not for a plain `npm install`, which
 * is why the script is here too.
 */
const agent = process.env.npm_config_user_agent ?? "";
const tool = agent.split("/")[0];

if (tool && tool !== "pnpm") {
  const red = "[31m";
  const bold = "[1m";
  const dim = "[2m";
  const reset = "[0m";

  process.stderr.write(
    `\n${red}${bold}This repo uses pnpm.${reset}\n\n` +
      `  You ran: ${bold}${tool}${reset}\n` +
      `  Run instead:\n\n` +
      `      ${bold}pnpm install${reset}          ${dim}# install${reset}\n` +
      `      ${bold}pnpm add <pkg>${reset}        ${dim}# add a dependency${reset}\n\n` +
      `  ${dim}npm cannot read pnpm's node_modules/.pnpm store. It walks the whole\n` +
      `  store and reports an ERESOLVE about a package this project does not\n` +
      `  depend on. There is nothing to fix in the dependency graph.${reset}\n\n` +
      `  ${dim}If you genuinely need npm here, delete node_modules first —\n` +
      `  but that replaces the pnpm tree and breaks the lockfile.${reset}\n\n`,
  );
  process.exit(1);
}

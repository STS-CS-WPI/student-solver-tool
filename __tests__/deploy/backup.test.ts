// @vitest-environment node
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it } from "vitest";

let directory: string;
afterEach(async () => {
  if (directory) await rm(directory, { recursive: true, force: true });
});

it.each(["", "backup", "migration"])(
  "pauses writers and handles deployment failure: %s",
  async (failure) => {
    directory = await mkdtemp(join(tmpdir(), "sts-deploy-"));
    await mkdir(join(directory, "deploy"));
    await mkdir(join(directory, "bin"));
    const script = (await readFile("deploy/deploy.sh", "utf8")).replace(
      'BACKUP_DIR="/home/backups"',
      `BACKUP_DIR="${directory}/backups"`,
    );
    const scriptPath = join(directory, "deploy/deploy.sh");
    await writeFile(scriptPath, script);
    await writeFile(join(directory, "bin/git"), "#!/bin/sh\nexit 0\n", {
      mode: 0o755,
    });
    await writeFile(
      join(directory, "bin/docker"),
      `#!/bin/sh
printf '%s\n' "$*" >> "$DEPLOY_TEST_LOG"
case "$*" in
  "compose ps --status running -q sts") echo running-container ;;
  "run --rm"*) [ "$DEPLOY_TEST_FAILURE" != backup ] || exit 1 ;;
  "compose --profile migrate run --rm sts-migrate") [ "$DEPLOY_TEST_FAILURE" != migration ] || exit 1 ;;
esac
exit 0
`,
      { mode: 0o755 },
    );
    execFileSync("bash", ["-n", scriptPath]);
    const logPath = join(directory, "commands");
    const result = spawnSync("bash", [scriptPath], {
      encoding: "utf8",
      env: {
        ...process.env,
        PATH: `${directory}/bin:${process.env.PATH}`,
        DEPLOY_TEST_LOG: logPath,
        DEPLOY_TEST_FAILURE: failure,
      },
    });
    const commands = (await readFile(logPath, "utf8")).split("\n");
    const stop = commands.indexOf("compose stop sts");
    const backup = commands.findIndex((line) => line.startsWith("run --rm"));
    const migrate = commands.indexOf(
      "compose --profile migrate run --rm sts-migrate",
    );
    expect(stop).toBeGreaterThan(-1);
    expect(backup).toBeGreaterThan(stop);
    expect(commands[backup]).toContain("sts_sqlite:/data:ro");
    expect(commands[backup]).toContain("tar -czf");
    if (failure) {
      expect(result.status).not.toBe(0);
      expect(commands).toContain("compose start sts");
      expect(commands).not.toContain("compose up -d --remove-orphans");
      if (failure === "backup") expect(migrate).toBe(-1);
    } else {
      expect(result.status).toBe(0);
      expect(migrate).toBeGreaterThan(backup);
      expect(
        commands.indexOf("compose up -d --remove-orphans"),
      ).toBeGreaterThan(migrate);
      expect(commands).not.toContain("compose start sts");
    }
  },
);

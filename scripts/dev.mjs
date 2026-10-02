import { spawn } from "node:child_process";
import process from "node:process";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const services = [
  ["Next.js", "dev:next"],
  ["Express API", "dev:api"],
  ["BullMQ Worker", "dev:worker"],
];

const children = services.map(([name, script]) => {
  const child = spawn(npm, ["run", script], {
    stdio: "inherit",
    env: { ...process.env },
    shell: process.platform === "win32",
    windowsHide: false,
  });

  child.on("exit", (code, signal) => {
    if (signal) console.log("[CTP] " + name + " stopped by " + signal);
    else if (code !== 0 && code !== null) console.error("[CTP] " + name + " exited with code " + code);
  });

  child.on("error", (error) => {
    console.error("[CTP] Failed to start " + name + ":", error.message);
  });

  return child;
});

let shuttingDown = false;
const shutdown = (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log("\nStopping CTP Alpha Terminal (" + signal + ")...");
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  setTimeout(() => process.exit(0), 500);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

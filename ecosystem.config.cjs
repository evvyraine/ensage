// ENSAGE_NODE_BIN lets a host run ensage on a Node build other than the one
// PM2 itself uses (e.g. an isolated Node 26 install). Fork mode is required
// for a custom interpreter; cluster mode would use PM2's own Node.
const nodeBin = process.env.ENSAGE_NODE_BIN || undefined

module.exports = {
  apps: [
    {
      name: "ensage",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      interpreter: nodeBin,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "1G",
      kill_timeout: 30000,
      listen_timeout: 10000,
      env: { NODE_ENV: "production", PORT: process.env.PORT || 3000 },
    },
    {
      name: "ensage-cleanup",
      script: "scripts/cleanup.mjs",
      interpreter: nodeBin,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      kill_timeout: 10000,
      env: { NODE_ENV: "production" },
    },
  ],
}

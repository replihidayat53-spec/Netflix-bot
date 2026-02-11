module.exports = {
  apps: [
    {
      name: "netflix-bot",
      script: "./index.js",
      cwd: "./bot/telegram",
      watch: false,
      ignore_watch: ["node_modules", ".git"],
      env: {
        NODE_ENV: "production",
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "../../logs/bot-error.log",
      out_file: "../../logs/bot-out.log"
    },
    {
      name: "netflix-dashboard",
      script: "npm",
      args: "run dev",
      cwd: "./dashboard",
      watch: false,
      ignore_watch: ["node_modules", ".git"],
      env: {
        NODE_ENV: "development",
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "./logs/dashboard-error.log",
      out_file: "./logs/dashboard-out.log"
    }
  ]
};

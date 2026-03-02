module.exports = {
  apps: [
    {
      name: "simcard-tracking-api-dev",
      script: "dist/main.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "development",
        PORT: 3300,
        DB_TYPE: "sqlite",
        TYPEORM_SYNC: false,
      },
      error_file: "logs/err.log",
      out_file: "logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      restart_delay: 4000,
      max_memory_restart: "500M",
    },
  ],
};

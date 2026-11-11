module.exports = {
  apps: [
    {
      name: 'smart-qr-print-backend',
      script: 'src/server.js',
      instances: 1, // Single fork required for SQLite file-lock safety
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
};

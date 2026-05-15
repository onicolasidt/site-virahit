module.exports = {
  apps: [{
    name: 'quiz-virahit',
    script: './dist/server.js',
    cwd: '/home/hermes_general/empresa/site-virahit/apps/quiz',
    instances: 'max',        // cluster mode — usa todos os cores
    exec_mode: 'cluster',
    node_args: '--require dotenv/config',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DOTENV_CONFIG_PATH: '/home/hermes_general/empresa/site-virahit/apps/quiz/.env'
    },
    // Restart automatico se travar
    watch: false,
    max_memory_restart: '400M',
    restart_delay: 1000,
    // Logs
    out_file: '/home/hermes_general/empresa/site-virahit/apps/quiz/logs/out.log',
    error_file: '/home/hermes_general/empresa/site-virahit/apps/quiz/logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true
  }]
};

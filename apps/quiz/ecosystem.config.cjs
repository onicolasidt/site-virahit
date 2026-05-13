module.exports = {
  apps: [{
    name: 'quiz-virahit',
    script: './dist/server.js',
    cwd: '/home/hermes_general/empresa/funil-web/quiz-virahit-v2',
    instances: 'max',        // cluster mode — usa todos os cores
    exec_mode: 'cluster',
    node_args: '--require dotenv/config',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DOTENV_CONFIG_PATH: '/home/hermes_general/empresa/funil-web/quiz-virahit-v2/.env'
    },
    // Restart automatico se travar
    watch: false,
    max_memory_restart: '400M',
    restart_delay: 1000,
    // Logs
    out_file: '/home/hermes_general/empresa/funil-web/quiz-virahit-v2/logs/out.log',
    error_file: '/home/hermes_general/empresa/funil-web/quiz-virahit-v2/logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true
  }]
};

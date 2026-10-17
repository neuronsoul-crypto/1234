// PM2: pm2 start ecosystem.config.cjs && pm2 save
module.exports = {
  apps: [
    {
      name: 'hramy-gaspry',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: __dirname,
      instances: 1, // один процесс: ограничитель частоты форм и задачи Payload живут в памяти
      exec_mode: 'fork',
      max_memory_restart: '1G',
      env: { NODE_ENV: 'production', NODE_OPTIONS: '--no-deprecation' },
      time: true,
    },
  ],
}

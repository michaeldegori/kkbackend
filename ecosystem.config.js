module.exports = {
    /**
     * Application configuration section
     * http://pm2.keymetrics.io/docs/usage/application-declaration/
     */
    apps : [
        {
            name      : 'kiddiekredit-api',
            script    : 'server.js',
            env: {
                COMMON_VARIABLE: 'true'
            },
            env_production : {
                NODE_ENV: 'production',
                PORT: 80
            }
        },
    ],

    /**
     * Deployment section
     * http://pm2.keymetrics.io/docs/usage/deployment/
     * none of this stuff is used, i deploy directly with git and ssh
     */
    deploy : {
        production : {
            user : 'ubuntu',
            host : '212.83.163.1',
            ref  : 'origin/master',
            repo : 'git@github.com:repo.git',
            path : '/var/www/production',
            'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
        },
        dev : {
            user : 'ubuntu',
            host : '18.235.253.24',
            ref  : 'origin/master',
            repo : 'git@github.com:kiddiekredit/kkbackend.git',
            path : '/home/ubuntu/kiddiekdredit-api/repo',
            'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env dev',
            env  : {
                NODE_ENV: 'dev'
            }
        }
    }
};
module.exports = {
    /**
     * http://pm2.keymetrics.io/docs/usage/application-declaration/
     */
    apps : [

        {
            name      : 'VenomKB API',
            script    : './index/bin/www',
            env: {
                MONGO_ADDR: 'mongodb://34.197.121.158:27017'
            },
            env_production : {
                NODE_ENV: 'production',
                API_HOSTNAME: 'http://venomkb.org/api/'
            },
            env_test : {
                NODE_ENV: 'development',
                API_HOSTNAME: 'http://54.165.86.64/api/'
            },
            env_dev : {
                NODE_ENV: 'development'
            }
        },
        {
            name : 'VenomKB',
            script : './server/index.js',
            env_test : {
                NODE_ENV: 'test',
                API_HOSTNAME: 'http://54.165.86.64/api/'
            },
            env_production : {
                NODE_ENV: 'production',
                API_HOSTNAME: 'http://venomkb.org/api/'
            },
            env_dev : {
                NODE_ENV: 'development',
                API_HOSTNAME: 'http://localhost:3001/api/'
            }
        }
    ],

    /**
     * http://pm2.keymetrics.io/docs/usage/deployment/
     */
    deploy : {
        production : {
            user : 'ubuntu',
            host : 'venomkb.org',
            ref  : 'origin/master',
            repo : 'git@github.com:JDRomano2/venomkb.git',
            path : '/var/www/venomkb',
            'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
        },
        dev : {
            user : 'jdr2160',
            host : 'localhost',
            ref  : 'origin/master',
            repo : 'git@github.com:JDRomano2/venomkb.git',
            path : '/User/jdr2160/developer/venomkb',
            'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env dev',
            env  : {
                NODE_ENV: 'development'
            }
        },
        test : {
            user : 'ubuntu',
            host : 'vkbtest',
            ref  : 'origin/master',
            repo : 'git@github.com:JDRomano2/venomkb.git',
            path : '/var/www/venomkb',
            'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env test'
        }
    }
};

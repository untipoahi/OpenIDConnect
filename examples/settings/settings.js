var sailsRedis = require('sails-redis');
var crypto = require('crypto');
module.exports = {
      adapters: {
            redis: sailsRedis
      },
      connections: {
            def: {
                adapter: 'redis'
            }
      },
      models:{
        user: {
            identity: 'user',
            connection: 'def',
            schema: true,
            policies: 'loggedIn',
            attributes: {
                name: {type: 'string', required: true },
                given_name: {type: 'string', required: true},
                middle_name: 'string',
                family_name: {type: 'string', required: true},
                profile: 'string',
                email: {type: 'email', required: true, unique: true},
                password: 'string',
                picture: 'binary',
                birthdate: 'date',
                gender: 'string',
                phone_number: 'string',
                samePassword: function(clearText) {
                    var sha256 = crypto.createHash('sha256');
                    sha256.update(clearText);
                    return this.password == sha256.digest('hex');
                }
            },
            beforeCreate: function(values, next) {
                if(values.password) {
                    if(values.password != values.passConfirm) {
                        return next("Password and confirmation does not match");
                    }
                    var sha256 = crypto.createHash('sha256');
                    sha256.update(values.password);
                    values.password = sha256.digest('hex');
                }
                next();
            },
            beforeUpdate: function(values, next) {
                if(values.password) {
                    if(values.password != values.passConfirm) {
                        return next("Password and confirmation does not match");
                    }
                    var sha256 = crypto.createHash('sha256');
                    sha256.update(values.password);
                    values.password = sha256.digest('hex');
                }
                next();
            }
        },
        client: {
            identity: 'client',
            connection: 'def',
            schema: true,
            policies: 'loggedIn',
            attributes: {
                key: {type: 'string', required: true, unique: true},
                secret: {type: 'string', required: true, unique: true},
                name: {type: 'string', required: true},
                image: 'binary',
                user: {model: 'user'},
                redirect_uris: {type:'array', required: true},
                credentialsFlow: {type: 'boolean', defaultsTo: false}
            },
            beforeCreate: function(values, next) {
                if(!values.key) {
                    var sha256 = crypto.createHash('sha256');
                    sha256.update(values.name);
                    sha256.update(Math.random()+'');
                    values.key = sha256.digest('hex');
                }
                if(!values.secret) {
                    var sha256 = crypto.createHash('sha256');
                    sha256.update(values.key);
                    sha256.update(values.name);
                    sha256.update(Math.random()+'');
                    values.secret = sha256.digest('hex');
                }
                next();
            }
        },
        consent: {
            identity: 'consent',
            connection: 'def',
            policies: 'loggedIn',
            attributes: {
                user: {model: 'user', required: true},
                client: {model: 'client', required: true},
                scopes: 'array'
            }
        },
        auth: {
            identity: 'auth',
            connection: 'def',
            policies: 'loggedIn',
            attributes: {
                client: {model: 'client',   required: true},
                scope: {type: 'array', required: true},
                user: {model: 'user', required: true},
                sub: {type: 'string', required: true},
                code: {type: 'string', required: true},
                redirectUri: {type: 'string', required: true},
                responseType: {type: 'string', required: true},
                status: {type: 'string', required: true},
                accessTokens: {
                    collection: 'access',
                    via: 'auth'
                },
                refreshTokens: {
                    collection: 'refresh',
                    via: 'auth'
                }
            }
        },
        access: {
            identity: 'access',
            connection: 'def',
            attributes: {
                token: {type: 'string', required: true},
                type: {type: 'string', required: true},
                idToken: 'string',
                expiresIn: 'integer',
                scope: {type: 'array', required: true},
                client: {model: 'client', required: true},
                user: {model: 'user', required: true},
                auth: {model: 'auth'}
            }
        },
        refresh: {
            identity: 'refresh',
            connection: 'def',
            attributes: {
                token: {type: 'string', required: true},
                scope: {type: 'array', required: true},
                auth: {model: 'auth'},
                status: {type: 'string', required: true}
            }
        }
      }
};

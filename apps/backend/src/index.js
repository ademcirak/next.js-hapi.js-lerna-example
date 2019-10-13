import Hapi from '@hapi/hapi';
import path from 'path';
import {
    pathWrapper,
    defaultHandlerWrapper,
    nextHandlerWrapper
} from './utils/next-warapper';
import next from '@app/frontend';
import env from '@app/env';

const init = async () => {

    console.log(process.cwd());
    console.log(env.DOMAIN, env.URL);

    const dev = env.APP_ENVIRONMENT !== 'production';
    const app = next({
        dev,
        dir: path.join(process.cwd(), '..', 'frontend')
    });

    await app.prepare();

    const server = Hapi.server({
        port: 3000,
        host: 'localhost'
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: pathWrapper(app, '/index')

    });

    server.route({
        method: 'GET',
        path: '/b',
        handler: pathWrapper(app, '/b')
    });

    server.route({
        method: 'GET',
        path: '/_next/{p*}' /* next specific routes */,
        handler: nextHandlerWrapper(app)
    });

    server.route({
        method: 'GET',
        path: '/static/{p*}' /* use next to handle static files */,
        handler: nextHandlerWrapper(app)
    });

    server.route({
        method: '*',
        path: '/{p*}' /* catch all route */,
        handler: defaultHandlerWrapper(app)
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init().catch((err) => {
    console.error(err.message, err.stack);
});

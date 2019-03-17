const tor_control = require('../index');
const assert = require('assert');

describe('tor control', function() {

    const tor = new tor_control({
        host: 'localhost',
        port: 9051,
        password: 'giraffe',
    });

    it('connect tor client', async function() {

        let response = await tor.connect();
        assert.equal(response.message, 'OK');
    });

    it('get new session', async function() {

        let response = await tor.signalNewnym();
        assert.equal(response.message, 'OK');
    }).timeout(3000);

    it('get information', async function() {
        let response = await tor.getInfo('config-file');
        assert.equal(response.type, 250);
    });

    it('disconnect tor client', async function() {

        let response = await tor.quit();
        assert.equal(response.message, 'closing connection');
    });
});
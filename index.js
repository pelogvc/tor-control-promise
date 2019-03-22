'use strict';

const net = require('net')

class Tor {

    constructor({ host, port, password } = {}) {
        
        this.opts = {
            'host': host || 'localhost',
            'port': port || 9051,
            'password': password || '',
        }
    }

    connect() {
        return new Promise((resolve, reject) => {

            this.connection = net.connect({
                host: this.opts.host,
                port: this.opts.port,
            });

            this.connection.on('error', function (err) {
                reject({
                    type: 0,
                    message: err,
                    data: err,
                });
            });
        
            this.connection.on('data', function (data) {
                data = data.toString();
                let ret = /([0-9]{1,3})\s(.*)\r\n/.exec(data);
                if ( ret !== null && parseInt(ret[1]) === 250 ) {
                    resolve({
                        type: parseInt(ret[1]),
                        message: ret[2],
                        data: data,
                    })
                }
                reject({
                    type: 0,
                    message: 'Authentication failed',
                    data: data,
                });
            });

            this.connection.write('AUTHENTICATE "' + this.opts.password + '"\r\n'); // Chapter 3.5
        });
    }
    
    sendCommand(command) {
        return new Promise((resolve, reject) => {

            //resolve(this);

            if (this.connection === undefined) {
                reject({
                    type: 0,
                    message: 'Need a socket connection (please call connect function)',
                    data: '',
                })
            }
            
            this.connection.on('error', function (err) {
                reject({
                    type: 0,
                    message: err,
                    data: err,
                });
            });
        
            this.connection.on('data', function (data) {
                data = data.toString();
                let ret = /([0-9]{1,3})\s(.*)\r\n/.exec(data);
                try {
                    resolve({
                        type: parseInt(ret[1]),
                        message: ret[2],
                        data: data,
                    })
                }catch(e){
                    reject({
                        type: 0,
                        message: 'Failed parsing data',
                        data: data,
                    });
                }
            });

            this.connection.write(command + '\r\n');
        });
    }

    /*
    Refrenece by https://github.com/atd-schubert/node-tor-control/blob/master/index.js
                https://gitweb.torproject.org/torspec.git/tree/control-spec.txt
    */
    quit () {
        return this.sendCommand('QUIT');
    }
    setConf (request) { // Chapter 3.1
        return this.sendCommand('SETCONF ' + request);
    }
    resetConf (request) { // Chapter 3.2
        return this.sendCommand('RESETCONF ' + request);
    }
    getConf (request) { // Chapter 3.3
        return this.sendCommand('GETCONF ' + request);
    }
    getEvents (request) { // Chapter 3.4
        return this.sendCommand('GETEVENTS ' + request);
    }
    saveConf (request) { // Chapter 3.6
        return this.sendCommand('SAVECONF ' + request);
    }
    // Signals:
    signal (signal) { // Chapter 3.7
        return this.sendCommand('SIGNAL ' + signal);
    }
    signalReload () {
        return this.signal('RELOAD');
    }
    signalHup () {
        return this.signal('HUP');
    }
    signalShutdown () {
        return this.signal('SHUTDOWN');
    }
    signalDump () {
        return this.signal('DUMP');
    }
    signalUsr1 () {
        return this.signal('USR1');
    }
    signalDebug () {
        return this.signal('DEBUG');
    }
    signalUsr2 () {
        return this.signal('USR2');
    }
    signalHalt () {
        return this.signal('HALT');
    }
    signalTerm () {
        return this.signal('TERM');
    }
    signalInt () {
        return this.signal('INT');
    }
    signalNewnym () {
        return this.signal('NEWNYM');
    }
    signalCleardnscache () {
        return this.signal('CLEARDNSCACHE');
    }

    mapAddress (address) { // Chapter 3.8
        return this.sendCommand('MAPADDRESS ' + address);
    }
    getInfo (request) { // Chapter 3.9
        if (!Array.prototype.isPrototypeOf(request)) {
            request = [request];
        }
        return this.sendCommand('GETINFO ' + request.join(' '));
    }
    extendCircuit (id, superspec, purpose) { // Chapter 3.10
        var str = 'EXTENDCIRCUIT ' + id;
        if (superspec) {
            str += ' ' + superspec;
        }
        if (purpose) {
            str += ' ' + purpose;
        }
        return this.sendCommand(str);
    }
    setCircuitPurpose (id, purpose) { // Chapter 3.11
        return this.sendCommand('SETCIRCUITPURPOSE ' + id + ' purpose=' + purpose);
    }
    setRouterPurpose (nicknameOrKey, purpose) { // Chapter 3.12
        return this.sendCommand('SETROUTERPURPOSE ' + nicknameOrKey + ' ' + purpose);
    }
    attachStream (streamId, circuitId, hop) { // Chapter 3.13
        let str = 'ATTACHSTREAM ' + streamId + ' ' + circuitId;

        if (hop) {
            str += ' ' + hop;
        }

        return this.sendCommand(str);
    }
    
}

module.exports = Tor; 
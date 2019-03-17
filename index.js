var net = require('net');

let control = function control({ host, port, password }) {

    let self = this;

    this.opts = {
        'host': host || 'localhost',
        'port': port || 9051,
        'password': password || '',
    }

    this.connection = null;

    this.connect = function connect() {
        return new Promise(function (resolve, reject) {

            self.connection = net.connect({
                host: self.opts.host,
                port: self.opts.port,
            });
        
            self.connection.on('data', function (data) {
                data = data.toString();
                let ret = /([0-9]{1,3})\s(.*)\r\n/.exec(data);
                if ( ret[0] !== 250 ) {
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

            self.connection.write('AUTHENTICATE "' + self.opts.password + '"\r\n'); // Chapter 3.5
        });
    }
    
    this.sendCommand = function sendCommand(command) {
        return new Promise(function (resolve, reject) {

            if (!self.connection) {
                reject({
                    type: 0,
                    message: 'Need a socket connection (please call connect function)',
                    data: '',
                })
            }
            
            self.connection.on('error', function (err) {
                reject({
                    type: 0,
                    message: err,
                    data: err,
                });
            });
        
            self.connection.on('data', function (data) {
                data = data.toString();
                let ret = /([0-9]{1,3})\s(.*)\r\n/.exec(data);
                if (ret[0]) {
                    resolve({
                        type: parseInt(ret[1]),
                        message: ret[2],
                        data: data,
                    })
                }
                reject({
                    type: 0,
                    message: 'Failed parsing data',
                    data: data,
                });
            });

            self.connection.write(command + '\r\n');
        });
    }
    
}

/*
Refrenece by https://github.com/atd-schubert/node-tor-control/blob/master/index.js
             https://gitweb.torproject.org/torspec.git/tree/control-spec.txt
*/
control.prototype = {
    sendCommand: function sendCommand(command) {
       return this.sendCommand(command);
    },
    connect: function connect() {
        return this.connect();
    },
    quit: function quit() {
        return this.sendCommand('QUIT');
    },
    setConf: function setConf(request) { // Chapter 3.1
        return this.sendCommand('SETCONF ' + request);
    },
    resetConf: function resetConf(request) { // Chapter 3.2
        return this.sendCommand('RESETCONF ' + request);
    },
    getConf: function getConf(request) { // Chapter 3.3
        return this.sendCommand('GETCONF ' + request);
    },
    getEvents: function getEvents(request) { // Chapter 3.4
        return this.sendCommand('GETEVENTS ' + request);
    },
    saveConf: function saveConf(request) { // Chapter 3.6
        return this.sendCommand('SAVECONF ' + request);
    },

    // Signals:
    signal: function sendSignalToTorCOntrol(signal) { // Chapter 3.7
        return this.sendCommand('SIGNAL ' + signal);
    },
    signalReload: function sendSignalReload() {
        return this.signal('RELOAD');
    },
    signalHup: function sendSignalHup() {
        return this.signal('HUP');
    },
    signalShutdown: function sendSignalShutdown() {
        return this.signal('SHUTDOWN');
    },
    signalDump: function sendSignalDump() {
        return this.signal('DUMP');
    },
    signalUsr1: function sendSignalUsr1() {
        return this.signal('USR1');
    },
    signalDebug: function sendSignalDegug() {
        return this.signal('DEBUG');
    },
    signalUsr2: function sendSignalUsr2() {
        return this.signal('USR2');
    },
    signalHalt: function sendSignalHalt() {
        return this.signal('HALT');
    },
    signalTerm: function sendSignalTerm() {
        return this.signal('TERM');
    },
    signalInt: function sendSignalInt() {
        return this.signal('INT');
    },
    signalNewnym: function sendSignalNewNym() {
        return this.signal('NEWNYM');
    },
    signalCleardnscache: function sendSignalClearDnsCache() {
        return this.signal('CLEARDNSCACHE');
    },

    mapAddress: function mapAddress(address) { // Chapter 3.8
        return this.sendCommand('MAPADDRESS ' + address);
    },
    getInfo: function (request) { // Chapter 3.9
        if (!Array.prototype.isPrototypeOf(request)) {
            request = [request];
        }
        return this.sendCommand('GETINFO ' + request.join(' '));
    },
    extendCircuit: function (id, superspec, purpose) { // Chapter 3.10
        var str = 'EXTENDCIRCUIT ' + id;
        if (superspec) {
            str += ' ' + superspec;
        }
        if (purpose) {
            str += ' ' + purpose;
        }
        return this.sendCommand(str);
    },
    setCircuitPurpose: function (id, purpose) { // Chapter 3.11
        return this.sendCommand('SETCIRCUITPURPOSE ' + id + ' purpose=' + purpose);
    },
    setRouterPurpose: function (nicknameOrKey, purpose) { // Chapter 3.12
        return this.sendCommand('SETROUTERPURPOSE ' + nicknameOrKey + ' ' + purpose);
    },
    attachStream: function (streamId, circuitId, hop) { // Chapter 3.13
        let str = 'ATTACHSTREAM ' + streamId + ' ' + circuitId;

        if (hop) {
            str += ' ' + hop;
        }

        return this.sendCommand(str);
    },
}

module.exports = control;
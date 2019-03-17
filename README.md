# tor-control-promise
NodeJS, Promise based tor controller
## Installing
```
$ npm install tor-control-promise
```
## Install tor client
On Debian you can install and run a relatively up to date Tor with.
```
apt-get install tor # should auto run as daemon after install
```
On OSX you can install with homebrew
```
brew install tor
tor & # run as background process
```
## Enable Tor ControlPort
You need to enable the Tor ControlPort if you want to programmatically refresh the Tor session (i.e., get a new proxy IP address) without restarting your Tor client.
```
tor --hash-password giraffe
```
The last line of the output contains the hash password that you copy paste into torrc
```
Jul 21 13:08:50.363 [notice] Tor v0.2.6.10 (git-58c51dc6087b0936) running on Darwin with Libevent 2.0.22-stable, OpenSSL 1.0.2h and Zlib 1.2.5.
Jul 21 13:08:50.363 [notice] Tor can't help you if you use it wrong! Learn how to be safe at https://www.torproject.org/download/download#warning
16:AEBC98A6777A318660659EC88648EF43EDACF4C20D564B20FF244E81DF
```
Copy the generated hash password and add it to your torrc file
```
# sample torrc file 
ControlPort 9051
HashedControlPassword 16:AEBC98A6777A318660659EC88648EF43EDACF4C20D564B20FF244E81DF
```
## Example
```js
const tor_control = require('tor-control-promise');
const tor = new tor_control({
    host: 'localhost',
    port: 9051,
    password: 'giraffe',
});

await tor.connect(); // connect tor client

await tor.signalNewnym(); // change tor ip

let response = await tor.getInfo('config-file'); // get config file
console.log(response);
// sample response:
// { type: 250,
//  message: 'OK',
//  data: '250-config-file=/usr/local/etc/tor/torrc\r\n250 OK\r\n'
// }

await tor.quit(); // disconnect tor client
```
## Tor control spec
https://gitweb.torproject.org/torspec.git/tree/control-spec.txt
## Test
```
npm test
```
## License
MIT
# givecoin-dapp
 
### How to Run

1. download the project
2. in `givecoin-dapp` folder run `npm install` to install node_modeles (assuming you have node.js installed)
3. download ganache
4. `brew install ganache` (if on mac, dunno on windows)
5. when launched you should click quick workspace server should be http://127.0.0.1 where your port is 7545 (this is quite typical)
6. Your network id should be unique, so you need to modify the `truffle-config.js` file
   `development: {
      host: "127.0.0.1", // server here
      port: "7545", // port here
      network_id: "XXXX" // your id here
    }`
7. run `truffle compile` in `givecoin-dapp` this will compile everything and change the files in `src/truffle-abis`
8. run `truffle test` this should pass all the tests
9. install MetaMask on computer...you need to create a personal account
10. once logged in there should be an option to add an network -> settings -> network -> add test network -> input values from Ganache
11. add accounts -> add account -> import account -> go to ganache & copy private key of **Account 2** -> go back to MetaMask and paste
12. go to terminal in `givecoin-app` run `npm start` -> this should launch your local host -> a pop up from MetaMask will occur saying "Connect to localhost" and click it
13. now everything should work

Honestly i hope this works if it doesn't welp good luck.

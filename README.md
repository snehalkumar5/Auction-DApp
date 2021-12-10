# Auction DApp

This is a decentralized app used for simulating an auction house.

---

## Functionality:
The app contains functionalities for:
1. Creating auction
2. Participating in active auctions
3. Place private bids and reveal them after bidding time closes
4. Closing the auction by the organizer 
5. Confirming the bids placed and declaring the winner
6. Delivering the item to the winner with confirmation

There are 4 types of auctions supported:
1. Market listing: A normal listing which remains public and active till the organizer closes the auction. The winner is the highest bidder.
2. Blind Auction: A type of sealed bid auction where the bids are private and the winner is the highest bidder.
3. Vickrey Auction: A type of sealed bid auction where the bids are private. The winner is the highest bidder but the price paid is the second-highest bid.
4. Average Price Auction: A type of sealed bid auction where the bids are private. The winner is the highest bidder but the price paid is the average of all bids.

The auctions are conducted through smart-contracts written in Solidity and Metamask is used for client side communication. 

---

## Instructions
To run the react app:
```
$ cd client
$ npm install
$ npm start
```

To start the truffle development server (smart-contracts):
```
$ truffle develop
$ truffle compile
$ truffle migrate
```

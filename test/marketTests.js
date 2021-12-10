const Market = artifacts.require("Market.sol");
const EthCrypto = require('eth-crypto');


contract("Market", accounts => {
	// Test case 1
	it("should demonstrate successfully enlisting items and displaying active enlistments", async () => {
		const marketPlace = await Market.deployed(); // Creating instance of contract
		await marketPlace.createListings(200,
			"Book",
			"Harry Potter and the Philosopher's Stone",
			{ from: accounts[0] }
		); // Enlist and item
		await marketPlace.createListings(20000, "Mobile Phone", "One Plus 5T", { from: accounts[0] }); // Enlist and item
		await marketPlace.createListings(
			3500,
			"Netflix screen",
			"3 Screens, FHD",
			{ from: accounts[1] }
		); // Enlist and item
		console.log(await marketPlace.fetchactivelistings()); // Display active listings
	});

	// Test case 2
	it("should demonstrate successful purchase of one item", async () => {
		console.log("Second Test")
		const marketPlace = await Market.deployed(); // Creating instance of contract
		let initialBuyerBalance = await web3.eth.getBalance(accounts[2]); // Get initial balance of buyer
		let initialSellerBalance = await web3.eth.getBalance(accounts[0]); // Get initial balance of seller
		console.log(
			"buyer initial balance: ",
			initialBuyerBalance,
			",seller initial balance: ",
			initialSellerBalance
		);
		// generate a private-key - public key pair for the buyer.In truffle it is already created when ganache is started
		// you can just use that in actual time
		// here we are using private - public key from here but the account is an
		//premade ganache account
		// note any private-public key can perform assymetric encryption 
		//hence it is not neccessary our private key is somehow linked to our account address
		// but in truffle it is linked 
		buyer_info = await EthCrypto.createIdentity();
		const buyer_public_key = buyer_info.publicKey;
		const buyer_private_key = buyer_info.privateKey;
		
		
		let res = await marketPlace.requestBuy(0, buyer_public_key,{ from: accounts[2], value: 400 }); // Make request for purchase of an item and send the public key
		//retrieve the public key of buyer by seller by reading the output of event PurchaseRequested from logs
		b_pub_key = await res.logs[0].args.pub_key;
		//the secret item string
		secret_item_string = "hagrid";
		console.log("The secrtet item of Seller is ",secret_item_string);
		//encrypt the item key using buyers public key off chain
		// returns a cypher text
		const encrypted_message = await EthCrypto.encryptWithPublicKey(
			b_pub_key, // publicKey
			secret_item_string // message
		);
		//convert the cypher text to string off chain
		secret_cipher_string = await EthCrypto.cipher.stringify(encrypted_message);
		// send the secret cypher string using the function sell Item
		// note that the seller and buyer can run the following code in the console to get the list of events
		/*
		await M.getPastEvents( 'PurchaseRequested', { fromBlock: 0, toBlock: 'latest' } )

		*/
		// and manually read the buyers public key(for seller) and stringified cyper text by the buyer 
		// for the event EmitEncrypted 
		// here we cant read it manually hence the complicated code
		console.log("the encypted string sent by the seller",secret_cipher_string);	
		res2 = await marketPlace.sellItem(0, secret_cipher_string, { from: accounts[0], value: 400 }); // Sell the item to the buyer
		// read the secret cypher string from the event emit encrypted 
		sent_string = await res2.logs[0].args.H;
		console.log("The encypted message received by the buyer in the event EmitEncrypted is ",sent_string);
		//get the cipher from the string offchain
		cipher = EthCrypto.cipher.parse(sent_string);
		//decrypt using the private key offchain
		sent_item = await EthCrypto.decryptWithPrivateKey(buyer_private_key,cipher);
		console.log("Received item is buyer after decryption",sent_item);
		await marketPlace.confirmDelivery(0, { from: accounts[2] }); // Confirm Delivery of the purchased item
		let finalBuyerBalance = await web3.eth.getBalance(accounts[2]); // Get final balance of buyer
		let finalSellerBalance = await web3.eth.getBalance(accounts[0]); // Get final balance of seller
		console.log(
			"buyer final balance: ",
			finalBuyerBalance,
			",seller final balance: ",
			finalSellerBalance
		);
		console.log("Final Active Listings", await marketPlace.fetchactivelistings()); // Display active listings
	});

	// Test case 3
	it("should demonstrate successful purchase two items in parallel", async () => {
		const marketPlace = await Market.deployed(); // Creating instance of contract
		console.log("person 2 will be buying Netflix screen from person 1 and person 1 will be buying Mobile Phone from Person 0");
		let initialPerson0Balance = await web3.eth.getBalance(accounts[0]); // Get initial balance of person 0
		let initialPerson1Balance = await web3.eth.getBalance(accounts[1]); // Get initial balance of person 1
		let initialPerson2Balance = await web3.eth.getBalance(accounts[2]); // Get initial balance of person 2
		console.log(
			"Person 0 initial balance: ",
			initialPerson0Balance,
			", Person 1 initial balance: ",
			initialPerson1Balance,
			", Person 2 initial balance: ",
			initialPerson2Balance
		);
		// generate buyer1 public and private keys
		buyer1_info = await EthCrypto.createIdentity();
		const buyer1_public_key = buyer1_info.publicKey;
		const buyer1_private_key = buyer1_info.privateKey;

		// generate buyer2 public and private keys
		buyer2_info = await EthCrypto.createIdentity();
		const buyer2_public_key = buyer2_info.publicKey;
		const buyer2_private_key = buyer2_info.privateKey;
		
		//make the buying requests
		let res1 = await marketPlace.requestBuy(2, buyer1_public_key,{ from: accounts[2], value: 7000 }); // Make request for purchase of an item
		let res2 = await marketPlace.requestBuy(1, buyer2_public_key,{ from: accounts[1], value: 40000 }); // Make request for purchase of an item
		
		//seller 1 retrieve buyer1s public key from Event 
		// Here you dont need to differentiate as the code handles it automatically
		// but in truffle develop both PurchaseRequest Events will be visible to all users
		// So seller need to differentiate using the listing id of their products

		//seller 1 retrieves buyer 1 public_key
		// seller 2 retrieves buyer 2 public key
		b1_pub_key = await res1.logs[0].args.pub_key;
		b2_pub_key = await res2.logs[0].args.pub_key;

		//the secret item string of seller' 1
		secret_item_string1 = "Money Heist";
		//the secret item string of seller' 2
		secret_item_string2 = "Android";

		console.log("The secrtet item of Seller1 is ",secret_item_string1);
		console.log("The secrtet item of Seller2 is ",secret_item_string2);

		//encrypt the item key using buyer1 public key off chain
		// returns a cypher text
		// This is done by Seller 1
		const encrypted_message1 = await EthCrypto.encryptWithPublicKey(
			b1_pub_key, // publicKey
			secret_item_string1 // message
		);

		//encrypt the item key using buyer2 public key off chain
		// returns a cypher text
		// This is done by Seller 2
		const encrypted_message2 = await EthCrypto.encryptWithPublicKey(
			b2_pub_key, // publicKey
			secret_item_string2 // message
		);
		//convert the cypher text to string off chain by seller 1
		secret_cipher_string1 = await EthCrypto.cipher.stringify(encrypted_message1);

		//convert the cypher text to string off chain by seller 2
		secret_cipher_string2 = await EthCrypto.cipher.stringify(encrypted_message2);

		
		//selling by seller 1 and 2
		let s1 = await marketPlace.sellItem(2, secret_cipher_string1, { from: accounts[1], value: 7000 }); // Sell the item to the buyer
		let s2 = await marketPlace.sellItem(1, secret_cipher_string2, { from: accounts[0], value: 40000 }); // Sell the item to the buyer
		
		
		//Note in this case the differentiation of which event is for which buyer is done 
		// by the code logic but in truflle environment the buyer has to look through the 
		// event logs and choose the data corresponding to the proper listing id
		// read the secret cypher string from the event emit encrypted by buyer 1
		sent_string1 = await s1.logs[0].args.H;
		// read the secret cypher string from the event emit encrypted by buyer 2
		sent_string2 = await s2.logs[0].args.H;
		
		console.log("The encypted message received by the buyer1 in the event EmitEncrypted is ",sent_string1);
		console.log("The encypted message received by the buyer2 in the event EmitEncrypted is ",sent_string2);

		//get the cipher from the string offchain(done by buyer 1)
		cipher1 = EthCrypto.cipher.parse(sent_string1);

		//get the cipher from the string offchain(done by buyer 1)
		cipher2 = EthCrypto.cipher.parse(sent_string2);
		
		//buyer1 decrypts cipher1 using the private key offchain of buyer1
		sent_item1 = await EthCrypto.decryptWithPrivateKey(buyer1_private_key,cipher1);
		//buyer2 decrypts cipher2 using the private key offchain of buyer2
		sent_item2 = await EthCrypto.decryptWithPrivateKey(buyer2_private_key,cipher2);

		console.log("Received item is buyer after decryption",sent_item1);
		console.log("Received item is buyer after decryption",sent_item2);

		await marketPlace.confirmDelivery(2, { from: accounts[2] }); // Confirm Delivery of the purchased item
		await marketPlace.confirmDelivery(1, { from: accounts[1] }); // Confirm Delivery of the purchased item
		let finalPerson0Balance = await web3.eth.getBalance(accounts[0]); // Get final balance of person 0
		let finalPerson1Balance = await web3.eth.getBalance(accounts[1]); // Get final balance of person 1
		let finalPerson2Balance = await web3.eth.getBalance(accounts[2]); // Get final balance of person 2
		console.log(
			"Person 0 final balance: ",
			finalPerson0Balance,
			", Person 1 final balance: ",
			finalPerson1Balance,
			", Person 2 final balance: ",
			finalPerson2Balance
		);
		console.log("Final Active Listings", await marketPlace.fetchactivelistings()); // Display active listings
	});

	// Test case 4
	it("should demonstrate error message while trying to buy an unavailable item", async () => {
		const marketPlace = await Market.deployed(); // Creating instance of contract
		console.log("A person 3 will try to buy the book from Person 0");
		let initialBuyerBalance = await web3.eth.getBalance(accounts[3]); // Get initial balance of buyer
		let initialSellerBalance = await web3.eth.getBalance(accounts[0]); // Get initial balance of seller
		console.log(
			"buyer initial balance: ",
			initialBuyerBalance,
			",seller initial balance: ",
			initialSellerBalance
		);
		buyer_info = await EthCrypto.createIdentity();
		const buyer_public_key = buyer_info.publicKey;
		const buyer_private_key = buyer_info.privateKey;
		try {
			await marketPlace.requestBuy(0, buyer_public_key,{ from: accounts[3], value: 400 }); // Make request for purchase of an item
			
			b_pub_key = await res.logs[0].args.pub_key;
		//the secret item string
		secret_item_string = "hagrid";
		console.log("The secrtet item of Seller is ",secret_item_string);
		//encrypt the item key using buyers public key off chain
		// returns a cypher text
		const encrypted_message = await EthCrypto.encryptWithPublicKey(
			b_pub_key, // publicKey
			secret_item_string // message
		);
		//convert the cypher text to string off chain
		secret_cipher_string = await EthCrypto.cipher.stringify(encrypted_message);
		// send the secret cypher string using the function sell Item
		// note that the seller and buyer can run the following code in the console to get the list of events
		/*
		await M.getPastEvents( 'PurchaseRequested', { fromBlock: 0, toBlock: 'latest' } )

		*/
		// and manually read the buyers public key(for seller) and stringified cyper text by the buyer 
		// for the event EmitEncrypted 
		// here we cant read it manually hence the complicated code
		console.log("the encypted string sent by the seller",secret_cipher_string);
			
			await marketPlace.sellItem(0, secret_cipher_string , { from: accounts[0], value: 400 }); // Sell the item to the buyer
			await marketPlace.confirmDelivery(0, { from: accounts[3] }); // Confirm Delivery of the purchased item
		} catch (error) {
			console.log(
				"\n An Error occurred during transaction because ",
				error.reason,
				"\n"
			); // Display reason of transaction failing
		}
		let finalBuyerBalance = await web3.eth.getBalance(accounts[3]); // Get final balance of buyer
		let finalSellerBalance = await web3.eth.getBalance(accounts[0]); // Get final balance of seller
		console.log(
			"buyer final balance: ",
			finalBuyerBalance,
			",seller final balance: ",
			finalSellerBalance
		);
		console.log("Final Active Listings", await marketPlace.fetchactivelistings()); // Display active listings
	});
});

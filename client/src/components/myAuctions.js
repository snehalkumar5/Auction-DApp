import React, { Component } from 'react'
import { Table, Button, InputGroup } from 'react-bootstrap';
import { get_secret, getPublicKey } from '../pub_pvt';

class MyAuctions extends Component {
  constructor(props) {
    super(props)
    this.state = {
      web3: null,
      accounts: null,
      currentAccount: null,
      market: null,
      blind_contract: null,
      vickrey_contract: null,
      average_contract: null,
      listings: [],
      makebid: false,
      formData: {}
    }
    this.handleChange = this.handleChange.bind(this);
    this.endAuction = this.endAuction.bind(this);
    this.sellItem = this.sellItem.bind(this);

  }
  componentDidMount = async () => {
    try {
      this.setState({
        vickrey_contract: this.props.vickrey_contract,
        blind_contract: this.props.blind_contract,
        average_contract: this.props.average_contract,
        web3: this.props.web3,
        currentAccount: this.props.account,
        market: this.props.market
      });
      let mylist = []
      let offSet = 1000;

      let marketListings = await this.props.market.methods.fetchalllistings().call({ from: this.props.account });
      for (let i = 0; i < marketListings.length; ++i) {
        if (marketListings[i]["beneficiary"] == this.props.account) {
          marketListings[i]["type"] = "Normal Listing";
          marketListings[i]["new_auction_id"] = parseInt(marketListings[i]["auction_id"]) + offSet;
          marketListings[i]["bidding_deadline"] = "NA";
          marketListings[i]["reveal_deadline"] = "NA";
          mylist.push(marketListings[i]);
        }
      }

      offSet += mylist.length;
      let blindAuctions = await this.props.blind_contract.methods.getallauctions().call({ from: this.props.account });
      for (let i = 0; i < blindAuctions.length; ++i) {
        if (blindAuctions[i]["beneficiary"] == this.props.account) {
          blindAuctions[i]["type"] = "Blind Auction";
          blindAuctions[i]["new_auction_id"] = parseInt(blindAuctions[i]["auction_id"]) + offSet;
          blindAuctions[i]["bidding_deadline"] = new Date(blindAuctions[i]["biddingEnd"] * 1000);
          blindAuctions[i]["reveal_deadline"] = new Date(blindAuctions[i]["revealEnd"] * 1000);
          mylist.push(blindAuctions[i]);
        }
      }
      offSet += mylist.length;
      let vikreyAuctions = await this.props.vickrey_contract.methods.getallauctions().call({ from: this.props.account });
      for (let i = 0; i < vikreyAuctions.length; ++i) {
        if (vikreyAuctions[i]["beneficiary"] == this.props.account) {
          vikreyAuctions[i]["type"] = "Vikrey Auction";
          vikreyAuctions[i]["new_auction_id"] = parseInt(vikreyAuctions[i]["auction_id"]) + offSet;
          vikreyAuctions[i]["bidding_deadline"] = new Date(vikreyAuctions[i]["biddingEnd"] * 1000);
          vikreyAuctions[i]["reveal_deadline"] = new Date(vikreyAuctions[i]["revealEnd"] * 1000);
          mylist.push(vikreyAuctions[i]);
        }
      }
      offSet += mylist.length;
      let averageAuctions = await this.props.average_contract.methods.getallauctions().call({ from: this.props.account });
      for (let i = 0; i < averageAuctions.length; ++i) {
        if (averageAuctions[i]["beneficiary"] == this.props.account) {
          averageAuctions[i]["type"] = "Average Price Auction";
          averageAuctions[i]["new_auction_id"] = parseInt(averageAuctions[i]["auction_id"]) + offSet;
          averageAuctions[i]["bidding_deadline"] = new Date(averageAuctions[i]["biddingEnd"] * 1000);
          averageAuctions[i]["reveal_deadline"] = new Date(averageAuctions[i]["revealEnd"] * 1000);
          mylist.push(averageAuctions[i]);
        }
      }
      offSet += averageAuctions.length;
      this.setState({ listings: mylist });

    } catch (error) {
      alert(`Loading error...`);
    }
  };

  handleChange(e) {
    e.preventDefault();
    const formData = Object.assign({}, this.state.formData);
    formData[e.target.id] = e.target.value;
    this.setState({ formData: formData });
  };

  sellItem = (auction_id, type) => async (e) => {
    try {
      if (type === "Normal Listing") {
        let marketListings = await this.state.market.methods.fetchalllistings().call({ from: this.state.currentAccount });
        let pubkey = marketListings[auction_id].pubkey;
        let secret = await get_secret(pubkey, this.state.formData.unique_string);
        let value = (marketListings[auction_id].price * 2);
        await this.state.market.methods.sellItem(auction_id, secret)
          .send({
            from: this.state.currentAccount,
            value
          });
      }
      else if (type === "Blind Auction") {
        let marketListings = await this.state.blind_contract.methods.getallauctions().call({ from: this.state.currentAccount });
        let pubkey = marketListings[auction_id].pubkey;
        let secret = await get_secret(pubkey, this.state.formData.unique_string);
        let value = (marketListings[auction_id].finalBid * 2);
        await this.state.blind_contract.methods.sellItem(auction_id, secret)
          .send({
            from: this.state.currentAccount,
            value
          });

      } else if (type === "Vikrey Auction") {
        let marketListings = await this.state.vickrey_contract.methods.getallauctions().call({ from: this.state.currentAccount });
        let pubkey = marketListings[auction_id].pubkey;
        let secret = await get_secret(pubkey, this.state.formData.unique_string);
        let value = (marketListings[auction_id].finalBid * 2);
        await this.state.vickrey_contract.methods.sellItem(auction_id, secret)
          .send({
            from: this.state.currentAccount,
            value
          });

      } else {
        let marketListings = await this.state.average_contract.methods.getallauctions().call({ from: this.state.currentAccount });
        let pubkey = marketListings[auction_id].pubkey;
        let secr = await get_secret(pubkey, this.state.formData.unique_string);
        let value = (marketListings[auction_id].finalBid * 2);
        await this.state.average_contract.methods.sellItem(auction_id, secr)
          .send({
            from: this.state.currentAccount,
            value
          });

      }
    } catch (error) {
      alert(`Sell Item Error: ${error}`);
    }
  };

  endAuction = (auction_id, type) => async (e) => {
    e.preventDefault();
    const { market, blind_contract, vickrey_contract, average_contract } = this.state;
    try {
      if (type === "Normal Listing") {
        await market.methods.sellItem(
          parseInt(auction_id),
          this.state.formData.unique_string
        ).send({
          from: this.state.currentAccount
        });
      }
      else if (type === "Blind Auction") {
        await blind_contract.methods.auctionEnd(
          parseInt(auction_id)
        ).send({
          from: this.state.currentAccount
        });
      } else if (type === "Vikrey Auction") {
        await vickrey_contract.methods.auctionEnd(
          parseInt(auction_id)
        ).send({
          from: this.state.currentAccount
        });
      } else {
        await average_contract.methods.auctionEnd(
          parseInt(auction_id)
        ).send({
          from: this.state.currentAccount
        });
      }
    } catch (error) {
      alert(`End Auction Error: ${error.message}`);
    }
  };

  render() {
    return (
      <>
        <h2>My Listed Auctions</h2>
        <br />
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
          <Table striped bordered hover>
            <thead>
              <tr>
                <td>Listing ID</td>
                <td>Listing Type</td>
                <td>Item Name</td>
                <td>Item Description</td>
                <td>Item Price</td>
                <td>Bidding Deadline</td>
                <td>Bid Reveal Deadline</td>
                <td>Manage</td>
              </tr>
            </thead>
            <tbody>
              {this.state.listings.map(listing => {
                let status = 'Active'
                if (listing.type === "Normal Listing") {
                  if (listing.buyer_alloted) {
                    status = 'Requested'
                  }
                  if (listing.H) {
                    status = 'Sold'
                  }
                  if (listing.sold_or_withdrawn) {
                    status = 'Done'
                  }
                } else {
                  if (Date.now() > listing.reveal_deadline) {
                    status = 'Reveal Over'
                  }
                  if (listing.ended) {
                    status = 'Ended'
                  }
                  if (listing.H) {
                    status = 'Sold'
                  }
                  if (listing.sold) {
                    status = 'Done'
                  }
                }
                return (
                  <tr key={listing.new_auction_id}>
                    <td>{listing.new_auction_id}</td>
                    <td>{listing.type}</td>
                    <td>{listing.item_name}</td>
                    <td>{listing.item_description}</td>
                    <td>{listing.type != "Normal Listing" ? "NA" : listing.price}</td>
                    <td>{listing.type != "Normal Listing" ? listing.bidding_deadline.toString() : listing.bidding_deadline}</td>
                    <td>{listing.type != "Normal Listing" ? listing.reveal_deadline.toString() : listing.reveal_deadline}</td>
                    <td>
                      {listing.type === "Normal Listing" ?
                        (status === 'Active') ?
                          <Button variant="outline-success" disabled>Active</Button>
                          :
                          (status === 'Requested') ?
                            <>
                              <p>Item requested. <br /> Buyer: {listing.buyer ? listing.buyer : "None"} <br /> Selling Price: {listing.price}</p>
                              <input type="string" className="form-control" id="unique_string" required onChange={this.handleChange} placeholder="Unique String" />
                              <Button variant="success" onClick={this.sellItem(listing.auction_id, listing.type)}>Sell Item</Button>
                            </>
                            :
                            (status === 'Sold') ?
                              <>
                                <Button variant="outline-info" disabled>Out for Delivery</Button>
                                <p><br /> Buyer: {listing.buyer ? listing.buyer : "None"} <br /> Selling Price: {listing.price}</p>
                              </>
                              :
                              (status === 'Done') ?
                                <>
                                  <Button variant="outline-success" disabled>Delivered</Button>
                                  <p><br /> Buyer: {listing.buyer ? listing.buyer : "None"} <br /> Selling Price: {listing.price}</p>
                                </>
                                :
                                <></>
                        :
                        // Auctions
                        (status === 'Active') ?
                          <Button variant="outline-success" disabled>Active</Button>
                          :
                          (status === 'Reveal Over') ?
                            <Button onClick={this.endAuction(listing.auction_id, listing.type)} variant="danger">End Auction</Button>
                            :
                            (status === 'Ended') ?
                              <>
                                <p>Auction Ended Successfully. <br /> Winner: {listing.finalBid > 0 ? listing.winner : "None"} <br /> Winning Bid: {listing.finalBid > 0 ? listing.finalBid : "NA"}</p>
                                {listing.finalBid > 0 &&
                                  <>
                                    <input type="string" className="form-control" id="unique_string" required onChange={this.handleChange} placeholder="Unique String" />
                                    <Button variant="success" onClick={this.sellItem(listing.auction_id, listing.type)}>Sell Item</Button>
                                  </>
                                }
                              </>
                              :
                              (status === 'Sold') ?
                                <>
                                  <Button variant="outline-info" disabled>Out for Delivery</Button>
                                </>
                                :
                                (status === 'Done') ?
                                  <>
                                    <Button variant="outline-success" disabled>Delivered</Button>
                                  </>
                                  :
                                  <></>
                      }
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        </div>
      </>
    );
  }
}
export default MyAuctions;
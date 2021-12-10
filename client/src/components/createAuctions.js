import React, { Component } from 'react'
import { Button, InputGroup, Alert } from 'react-bootstrap';

class CreateAuctions extends Component {
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
      formData: {
        auctionType: ""
      },
      error: null,
      eventsuccess: [],
      eventfails: ["ItemUnsold", "DepositNotEnough", "BidRevealFailed", "Aborted"]
    }
    this.handleChange = this.handleChange.bind(this);
    this.createAuction = this.createAuction.bind(this);
  }
  componentDidMount = async () => {
    this.setState({
      vickrey_contract: this.props.vickrey_contract,
      blind_contract: this.props.blind_contract,
      average_contract: this.props.average_contract,
      market: this.props.market,
      web3: this.props.web3,
      currentAccount: this.props.account
    });
  }
  handleChange(e) {
    e.preventDefault();
    const formData = Object.assign({}, this.state.formData);
    formData[e.target.id] = e.target.value;
    this.setState({ formData: formData });
  }

  createAuction = async (e) => {
    e.preventDefault();
    const accounts = await this.state.web3.eth.getAccounts();
    this.setState({ accounts });
    const { market, blind_contract, vickrey_contract, average_contract } = this.state;
    if (this.state.formData.auctionType === "Normal Listing") {
      const { auctionType, item_name, item_description, item_price } = this.state.formData;
      await market.methods.createListings(item_price, item_name, item_description)
        .send({ from: accounts[0] });
    }
    else {
      const { auctionType, item_name, item_description, bidding_deadline, reveal_deadline } = this.state.formData;
      let bidding_time = parseInt(((new Date(bidding_deadline)).getTime() - Date.now()) / 1000);
      let reveal_time = parseInt(((new Date(reveal_deadline)).getTime() - Date.now()) / 1000) - bidding_time;
      if (bidding_time <= 0) {
        alert("Invalid Bidding Deadline");
        return false;
      }
      if (reveal_time <= 0) {
        alert("Invalid Reveal Deadline");
        return false;
      }
      if (auctionType === "Blind Auction") {

        await blind_contract.methods.auctionItem(item_name, item_description, bidding_time, reveal_time)
          .send({ from: accounts[0] });
      }
      else if (auctionType === "Vickrey Auction") {
        await vickrey_contract.methods.auctionItem(item_name, item_description, bidding_time, reveal_time)
          .send({ from: accounts[0] });
      }
      else {
        await average_contract.methods.auctionItem(item_name, item_description, bidding_time, reveal_time)
          .send({ from: accounts[0] });
      }
    }
  };


  render() {
    return (
      <>
        <div className="form-group">
          <form onSubmit={this.createAuction}>
            <h2>Add your listing</h2>
            <br />
            <div className="mb-3">
              <label className="form-label">Listing Type</label>
              <select className="form-select" id="auctionType" placeholder="Select Auction Type" required onChange={this.handleChange}>
                <option value="Select Type" disabled="disabled" selected>Select Type</option>
                <option value="Normal Listing">Normal Listing</option>
                <option value="Blind Auction">Blind Auction</option>
                <option value="Vickrey Auction">Vickrey Auction</option>
                <option value="Average Price Auction">Average Price Auction</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Item Name</label>
              <input type="item_name" className="form-control" id="item_name" required onChange={this.handleChange} placeholder="Book" />
            </div>
            <div className="mb-3">
              <label className="form-label">Item description</label>
              <input type="item_description" className="form-control" id="item_description" required onChange={this.handleChange} placeholder="Harry Potter" />
            </div>
            {this.state.formData.auctionType === "" ?
              <></>
              :
              <>
                {
                  this.state.formData.auctionType === "Normal Listing" ?
                    <div className="mb-3">
                      <label className="form-label">Item Price</label>
                      <input type="number" className="form-control" id="item_price" required onChange={this.handleChange} />
                    </div>
                    :
                    <>
                      <div className="mb-3">
                        <label className="form-label">Bidding Deadline</label>
                        <input type="datetime-local" className="form-control" id="bidding_deadline" required onChange={this.handleChange} />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Reveal Deadline</label>
                        <input type="datetime-local" className="form-control" id="reveal_deadline" required onChange={this.handleChange} />
                      </div>
                    </>
                }
              </>
            }
            <Button type="submit">Create Auction</Button>
          </form>
        </div>
      </>
    );
  }
}
export default CreateAuctions;
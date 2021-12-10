import React, { Component } from 'react'
import { Card, Button, CardGroup, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";

class Dashboard extends Component {
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
      formData: {}
    }
  }
  componentDidMount = async()=>{
    this.setState({
      vickrey_contract: this.props.vickrey_contract,
      blind_contract: this.props.blind_contract,
      average_contract: this.props.average_contract,
      market: this.props.market,
      web3: this.props.web3,
      currentAccount: this.props.account
    });
  }
  render() {
    return (
        <>
				<h1>Smart Auction</h1>
        <br/>
        
        <CardGroup>
            <Card style={{ width: '18rem', marginLeft: '10px', marginRight: '10px'  }}>
              <Card.Img variant="top" src="auctionhouse.png" alt="te" />
              <Card.Body>
                <Card.Title>Auction House</Card.Title>
                <Card.Text>
                  Have a look at the active listings in the auction house!
                </Card.Text>
                <Link to="/auctionhouse">
                	<Button variant="primary">Go to Auction House</Button>
                </Link>
              </Card.Body>
            </Card>
            <Card style={{ width: '18rem', marginLeft: '10px', marginRight: '10px'  }}>
              <Card.Img variant="top" src="listitem.png" alt="te" />
              <Card.Body>
                <Card.Title>Create Auction Listing</Card.Title>
                <Card.Text>
                  Host your own auction and add it to the auctions!
                </Card.Text>
                <Link to="/create">
                	<Button variant="warning">List your item</Button>
                </Link>
              </Card.Body>
            </Card>
        </CardGroup>
          <br/>
        <CardGroup>
          <Card style={{ width: '18rem', marginLeft: '10px', marginRight: '10px' }}>
            <Card.Img variant="top" src="myauctions.png" alt="te" />
            <Card.Body>
							<Card.Title>My Auctions</Card.Title>
							<Card.Text>
								Look and manage your auctions!
							</Card.Text>
							<Link to="/myauctions">
								<Button variant="primary">My Auctions</Button>
							</Link>
            </Card.Body>
          </Card>
        <Card style={{ width: '18rem', marginLeft: '10px', marginRight: '10px' }}>
            <Card.Img variant="top" src="mybids.png" alt="te" />
            <Card.Body>
							<Card.Title>My Bids</Card.Title>
							<Card.Text>
								Look and manage your current bids!
							</Card.Text>
							<Link to="/mybids">
								<Button variant="primary">My Bids</Button>
							</Link>
            </Card.Body>
          </Card>
        </CardGroup>
        </>
    );
  }
}
export default Dashboard;
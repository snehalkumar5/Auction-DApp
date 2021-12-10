import React, { Component } from "react";
import { Navbar, Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./navbar.css";

class Navbr extends Component{
  constructor(props){
    super(props)
  }
  render() {
    return(
    <>
      <Navbar bg="dark" variant="dark" sticky="top">
      <Container>
        <Link to="/">
          <Navbar.Brand>Tripple Auction
          </Navbar.Brand>
        </Link>
        <Link to="/auctionhouse">
          <Button variant="dark" className="justify-content-end"> Auctions
          </Button>
        </Link>
        <Link to="/create">
          <Button variant="dark" className="justify-content-end"> Create Auction
          </Button>
        </Link>
        <Link to="/myauctions">
          <Button variant="dark" className="justify-content-end"> My Auctions
          </Button>
        </Link>
        <Link to="/mybids">
          <Button variant="dark" className="justify-content-end"> My Bids
          </Button>
        </Link>
        <Link to="/events">
          <Button variant="dark" className="justify-content-end"> Event Logs
          </Button>
        </Link>
      </Container>
      </Navbar>
    </>
    )
  }
}

export default Navbr;
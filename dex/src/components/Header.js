import React from 'react'
// import Logo from "../moralis-logo.svg"
import Logo from "../komorebi-logo-4.svg"
import radix_network from "../radix-network-logo.svg"
import { Link } from "react-router-dom"

function Header() {
  return (
    <header>
      <div className = "leftH">
        <img src={ Logo } alt="logo" className="logo" />
        <Link to="/" className="link">
          <div className="headerItem">Swap</div>
        </Link>
        <Link to="/pools" className="link">
          <div className="headerItem">Pools</div>
        </Link>
        <Link to="/tokens" className="link">
          <div className="headerItem">Tokens</div>
        </Link>
      </div>
      <div className="rightH">
        <div className="headerItem">
          <img src={ radix_network } alt="radix_network" className="radix-network" />
        </div>
      </div>
    </header>
  )
}

export default Header
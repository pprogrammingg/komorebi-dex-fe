import "./App.css";
import Header from "./components/Header"
import Swap from "./components/swap/Swap"
import Pools from "./components/pools/Pools"
import Tokens from "./components/Tokens"
import { Routes, Route } from "react-router-dom"
import { RadixDappToolkit } from '@radixdlt/radix-dapp-toolkit'

function App() {
  const rdt = RadixDappToolkit(
    { dAppDefinitionAddress: process.env.REACT_APP_DAPP_DEFINITION_ACCOUNT, dAppName: 'komorebi' },
    (requestData) => {
      requestData({
        accounts: { quantifier: 'atLeast', quantity: 1 },
      }).map(({ data: { accounts } }) => {
        // add accounts to dApp application state
        console.log("account data: ", accounts)
      })
    },
    {
      networkId: 12, // 12 is for RCnet 01 for Mainnet
      onDisconnect: () => {
        // clear your application state
      },
      onInit: ({ accounts }) => {
        // set your initial application state
        console.log("onInit accounts: ", accounts)
        if (accounts.length > 0) {
        }
      },
    }
  )
  console.log("dApp Toolkit: ", rdt)

  return (
    <div className="App">
      <Header />
      <radix-connect-button></radix-connect-button>
      <div className="mainWindow">
        <Routes>
          <Route path="/" element={ <Swap rdt={ rdt }/> } />
          <Route path="/pools" element={ <Pools rdt={ rdt } /> } />
          <Route path="/tokens" element={ <Tokens /> } />
        </Routes>
      </div>
    </div>
  )
}

export default App;

import React, {useState, useEffect} from 'react'
import styles from "./pools.module.css"
import { Input, Popover, Radio, Modal, message } from "antd"
import {
  PlusOutlined,
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons"

import tokenList from "../../tokenList.json"
import axios from "axios"

import {
  ManifestBuilder,
  Decimal,
  Bucket,
  Expression,
  Address
} from '@radixdlt/radix-dapp-toolkit'

import { TransactionApi, StateApi, StatusApi, StreamApi, Configuration } from "@radixdlt/babylon-gateway-api-sdk";
import { RadixDappToolkit } from '@radixdlt/radix-dapp-toolkit'

function Pools({ rdt }) {

  // Instantiate Gateway SDK
  const transactionApi = new TransactionApi()
  const stateApi = new StateApi();
  const TOKEN_A_ADDRESS="resource_tdx_c_1qxjq2rkzsu84dvxgy9vzcxt0xn5tdp5vuctx4fp4ag5san5uym";
  const TOKEN_B_ADDRESS="resource_tdx_c_1qyv2f4kv37fzy4vg0uklaeg9jmahnmpk8yxkud7x4vmqutkume";
  const COMPONENT_ADDRESS="component_tdx_c_1qvctnnucndpcskpzne2j08kzgat0wazmyfaa034zxneqgs3ve9";
  const LP_TOKEN="resource_tdx_c_1qyt0m0pwtq526r97z42txlnm3tsx0mvjw03pw5pv4euqydynlh";
  const AWESOME_TOKEN_ADDRESS="resource_tdx_c_1q8q4fnreqyc5l44lhfv5h6ay87s98ur63scnk8aerhqq5kp6ge";
  const accountAddress="account_tdx_c_1pxmzp2q730rxgxh8m8jl6c8f8whud5lfjq90kjkuekms6680u2";
  const [slippage, setSlippage] = useState(2.5);
  const [tokenOneAmount, setTokenOneAmount] = useState(null);
  const [tokenTwoAmount, setTokenTwoAmount] = useState(null);
  const [tokenOne, setTokenOne] = useState(tokenList[0]);
  const [tokenTwo, setTokenTwo] = useState(tokenList[1]);
  const [isOpen, setIsOpen] = useState(false);
  const [changeToken, setChangeToken] = useState(1);
  const [prices, setPrices] = useState(null);

  function handleSlippageChange(e){
    setSlippage(e.target.value);
  }

  function changeAmount(e) {
    setTokenOneAmount(e.target.value)
    if(e.target.value && prices){
      setTokenTwoAmount((e.target.value * prices.ratio).toFixed(5))
    } else {
      setTokenTwoAmount(null)
    }
  }

//   function switchTokens(){
//     setPrices(null);
//     setTokenOneAmount(null);
//     setTokenTwoAmount(null);
//     const one = tokenOne;
//     const two = tokenTwo;
//     setTokenOne(two);
//     setTokenTwo(one);
//     fetchPrices(two.address, one.address);
//   }

  function openModal(asset){
    setChangeToken(asset);
    setIsOpen(true);
  }

  function modifyToken(i){
    setPrices(null);
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    if (changeToken === 1){
      setTokenOne(tokenList[i]);
      fetchPrices(tokenList[i].address, tokenTwo.address)
    } else {
      setTokenTwo(tokenList[i].address);
      fetchPrices( tokenOne.address, tokenList[i].address)
    }
   
    setIsOpen(false);
  }

  async function fetchPrices(one, two){
    const res = await axios.get(`http://localhost:3001/tokenPrice`, {
      params: {addressOne: one, addressTwo: two }
    })

    console.log(res);
    setPrices(res.data);
  }

  useEffect(() => {
    fetchPrices(tokenList[0].address, tokenList[1].address)
  }, []);

  const settings = (
    <>
      <div>Slippage Tolerance</div>
      <div>
          <Radio.Group value={slippage} onChange={handleSlippageChange}>
            <Radio.Button value={0.5}>0.5%</Radio.Button>
            <Radio.Button value={2.5}>2.5%</Radio.Button>
            <Radio.Button value={5}>5.0%</Radio.Button>
          </Radio.Group>
      </div>
    
    </>
  );

  // TODO: token_b is just half amount of token_a
  async function handleAddLiquidity() {
    console.log("Enter handle Add Liquidity");
    let manifest = new ManifestBuilder()
      .callMethod(accountAddress, "withdraw", [Address(TOKEN_A_ADDRESS), Decimal(tokenOneAmount)])
      .takeFromWorktop(TOKEN_A_ADDRESS, "token_a_bucket")
      .callMethod(accountAddress, "withdraw", [Address(TOKEN_B_ADDRESS), Decimal(tokenOneAmount / 2)])
      .takeFromWorktop(TOKEN_B_ADDRESS, "token_b_bucket")
      .callMethod(COMPONENT_ADDRESS, "add_liquidity", [Bucket("token_a_bucket"), Bucket("token_b_bucket")])
      .callMethod(accountAddress, "deposit_batch", [Expression("ENTIRE_WORKTOP")])
      .build()
      .toString();
  
    console.log('Add liquidity pair of token_a and token_b manifest: ', manifest)
  
    // Send manifest to extension for signing
    const result = await rdt
      .sendTransaction({
        transactionManifest: manifest,
        version: 1,
      })
  
    if (result.isErr()) throw result.error
  
    console.log("Add liquidity sendTransaction Result: ", result)
  
    // Fetch the transaction status from the Gateway SDK
    let status = await transactionApi.transactionStatus({
      transactionStatusRequest: {
        intent_hash_hex: result.value.transactionIntentHash
      }
    });
    console.log('Add liquidity TransactionAPI transaction/status: ', status)
  
    // fetch commit reciept from gateway api 
    let commitReceipt = await transactionApi.transactionCommittedDetails({
      transactionCommittedDetailsRequest: {
        intent_hash_hex: result.value.transactionIntentHash
      }
    })
    console.log('Add liquidity Committed Details Receipt', commitReceipt)
  };
  
  return (
    <>
      <Modal
        open={ isOpen }
        footer={ null }
        onCancel={() => setIsOpen(false)}
        title="Select a token" 
      >
        <div className="modalContent">
          {tokenList?.map((e,i) => {
            return (
              <div
                className="tokenChoice"
                key={i}
                onClick={() => modifyToken(i)}
              >
                <img src={e.img} alt={e.ticker} className="tokenLogo" />
                <div className="tokenChoiceNames">
                  <div className="tokenName">{ e.name }</div>
                  <div className="tokenTicker">{ e.ticker }</div>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
      <div className="tradeBox">
        <div className="tradeBoxHeader">
          <h4>Swap</h4>
          <Popover
              content={settings}
              title="Settings"
              trigger="click"
              placement="bottomRight"
            >
              <SettingOutlined className="cog" />
            </Popover>
        </div>
        <div className="inputs">
          <Input placeholder="0" value={tokenOneAmount} onChange={changeAmount} disabled={!prices}/>
          <Input placeholder="0" value={tokenTwoAmount} disabled={true} />
          <div className="plusIcon">
            <PlusOutlined />
          </div>
          <div className="assetOne" onClick={() => openModal(1)}>
              <img src={tokenOne.img} alt="assetOneLogo" className="assetLogo" />
              {tokenOne.ticker}
              <DownOutlined />
          </div>
          <div className="assetTwo" onClick={() => openModal(2)}>
              <img src={tokenTwo.img} alt="assetTwoLogo" className="assetLogo" />
              {tokenTwo.ticker}
              <DownOutlined />
          </div>
        </div>
        <div id="addButton" className="addButton" disabled={ !tokenOneAmount } onClick= { handleAddLiquidity }>Add Liquidity</div>
      </div>
    </>
  )
}

export default Pools
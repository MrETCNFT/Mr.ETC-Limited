import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background-color: var(--secondary);
  padding: 10px;
  font-weight: bold;
  color: var(--secondary-text);
  width: 100px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
  width: 200px;
  @media (min-width: 767px) {
    width: 300px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  border: 4px dashed var(--secondary);
  background-color: var(--accent);
  border-radius: 100%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Up to 20 Mr.ETCs / Mint.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "0xB800fDc9c661dB8ab4950314Bd1461eE1872F81d",
    SCAN_LINK: "https://rinkeby.etherscan.io/address/0xb800fdc9c661db8ab4950314bd1461ee1872f81d",
    NETWORK: {
      NAME: "Rinkeby Testnet",
      SYMBOL: "RinkebyETH",
      ID: 4,
    },
    NFT_NAME: "Mr.ETC Limited",
    SYMBOL: "MRETC",
    MAX_SUPPLY: 3500,
    WEI_COST: 1000000000000000000,
    DISPLAY_COST: 2,
    GAS_LIMIT: 300000,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
    .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("🤔 Oops, something went wrong. Please try again.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `🥳 Woohoo, Success! Add The Mr.ETC Contract 0x & Your NFT #ID(s) to view.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 20) {
      newMintAmount = 20;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  return (
    <s.Screen>
      <s.Container
        flex={1}
        ai={"center"}
        style={{ padding: 24, backgroundColor: "var(--primary)" }}
        image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg.gif" : null}
      >
        <StyledLogo alt={"logo"} src={"/config/images/logo.png"} />
        <s.SpacerSmall />
        <ResponsiveWrapper flex={1} style={{ padding: 24 }} test>
          <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg alt={"example"} src={"/config/images/example.gif"} />
          </s.Container>
          <s.SpacerLarge />
          <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
            style={{
              backgroundColor: "var(--accent)",
              padding: 24,
              borderRadius: 24,
              border: "4px dashed var(--secondary)",
              boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.7)",
            }}
          >
            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 50,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              {data.totalSupply} / {CONFIG.MAX_SUPPLY}
            </s.TextTitle>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
              }}
            >
              <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
                {truncate(CONFIG.CONTRACT_ADDRESS, 15)}
              </StyledLink>
            </s.TextDescription>
            <s.SpacerSmall />
            {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  The sale has ended.
                </s.TextTitle>
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  You can still find {CONFIG.NFT_NAME} on
                </s.TextDescription>
                <s.SpacerSmall />
                <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                  {CONFIG.MARKETPLACE}
                </StyledLink>
              </>
            ) : (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  💚 1 {CONFIG.SYMBOL} = {CONFIG.DISPLAY_COST}{" "}
                  {CONFIG.NETWORK.SYMBOL} 💚
                </s.TextTitle>
                <s.SpacerLarge />
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                 The Mr.ETC Army Is Unleashed - MINTING LIVE 
                  <s.SpacerLarge />
                  🚀 A Truly Iconic LIMITED ETC NFT Collection 🚀
                  <s.SpacerLarge />
                   <s.SpacerMedium />
                   Mr.ETC is of The 1st Completely Original & Very Scarce ERC-721 Collections to Exist on The Immutable PoW {CONFIG.NETWORK.NAME} Blockchain. 🍀
                  <s.SpacerLarge />
                  <s.SpacerMedium />
                   THERE IS ONLY 3.5k ORIGINAL MR.ETCS 
                  <s.SpacerXSmall />
                  ---------------
               <s.SpacerMedium />
                  ✅ - 100% Fair & Equal Distribution
                  <s.SpacerMedium />
                  ✅ - OG ETC NFT, Unique and Provably Rare
                  <s.SpacerMedium />
                  ✅ - Iconic, Immutable & Living on The Greatest Blockchain in History.
                  <s.SpacerMedium />
                  ✅ - Hold NFTs To Become Part of Mr.ETCs Estate! (Community) :
                  <s.SpacerSmall />
                  Constant Giveaways, IRL Rewards Holder Tiers. Plus Participation In An Ever Growing Jam-Packed Roadmap
                  - Long Live Ethereum Classic!
                  <s.SpacerLarge />
                  <s.SpacerLarge />
               🤝 A Collection For True OG ETC NFT Collectors 🤝
               <s.SpacerXSmall />
               ---------------
               <s.SpacerMedium />
               Mr.ETC is the Embodiment & Personification of The Great Ethereum Classic Logo
               <s.SpacerMedium />
               ㅤ- 1000s of Unique Personalities -ㅤ
               <s.SpacerSmall />
               Honorable, Extremely Rare Trait Examples:
               <s.SpacerLarge />
               <s.SpacerMedium />
               BACKGROUND : Pristine Jewels, 24k Gold..
               <s.SpacerSmall />
               EXPRESSION : Sly Pizza, Lasers, Gems, Apacolypse..
               <s.SpacerSmall />
               HEAD : Trippy ETC Cap, Trippy Crown, Archangel..
               <s.SpacerSmall />
               BODY : Noise, Robot, Doombot, Sherbert, Zombie..
               <s.SpacerSmall />
               LEGS : World of ETC, Trippy Legs, Rainbow Legs..
               <s.SpacerLarge />
               To Name A Few - Mr.ETC Has A Total of 9 Layers!
               <s.SpacerLarge />
               <s.SpacerLarge />
               🤝ㅤSINCERLY,ㅤTHE MR.ETC DEV TEAMㅤ🤝
               <s.SpacerMedium />
               Long in the making... The Mr.ETC Army has finally arrived and they are here to stay! 
               <s.SpacerMedium />
               Our ollection is structured as such that each and every NFT is Scarce, Unique and Sought after. 
               <s.SpacerMedium />
               Each Mr.ETC Icludes 9 Layers of Traits - With up to 120+ unqiue attributes per layer - Ranging from Common, Rare to Very Rare. 
               <s.SpacerMedium />
               As such, out of 3,500 NFT's there will is less than 20 Instances of some Very Rare Traits! 🍀
               <s.SpacerMedium />
               <s.SpacerMedium />
               
               🍀 How Rare is Your HODL?
               <s.SpacerMedium />
               Remember, each & every Mr.ETC is Valuable! Some extremely valuable, espcially to the right NFT Collectors.
               <s.SpacerMedium />
               <s.SpacerLarge />
               <s.SpacerLarge />
               This is History, The #MRETC Army is Unstoppbale. We Thank You #ETCArmy So Much For The Massive Support. Cheers!
               <s.SpacerMedium />
               ** Mr.ETC Jamp-packed Roadmap Located Below **
                </s.TextDescription>
                <s.SpacerLarge />
                <s.SpacerLarge />
                {blockchain.account === "" ||
                blockchain.smartContract === null ? (
                  <s.Container ai={"center"} jc={"center"}>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      <s.SpacerSmall />
                      <s.SpacerSmall />
                      ⏳ HURRY, THEY'RE GOING FAST! ⏳
                      <s.SpacerSmall />
                    </s.TextDescription>
                    <s.SpacerLarge />
                    <StyledButton
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(connect());
                        getData();
                      }}
                    >                 
                      Connect to Mint
                    </StyledButton>
                    {blockchain.errorMsg !== "" ? (
                      <>
                        <s.SpacerSmall />
                        <s.TextDescription
                          style={{
                            textAlign: "center",
                            color: "var(--accent-text)",
                          }}
                        >
                          {blockchain.errorMsg}
                        </s.TextDescription>
                      </>
                    ) : null}
                  </s.Container>
                ) : (
                  <>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      {feedback}
                    </s.TextDescription>
                    <s.SpacerMedium />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledRoundButton
                        style={{ lineHeight: 0.4 }}
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          decrementMintAmount();
                        }}
                      >
                        -
                      </StyledRoundButton>
                      <s.SpacerMedium />
                      <s.TextDescription
                        style={{
                          textAlign: "center",
                          color: "var(--accent-text)",
                        }}
                      >
                        {mintAmount}
                      </s.TextDescription>
                      <s.SpacerMedium />
                      <StyledRoundButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          incrementMintAmount();
                        }}
                      >
                        +
                      </StyledRoundButton>
                    </s.Container>
                    <s.SpacerSmall />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          claimNFTs();
                          getData();
                        }}
                      >
                        {claimingNft ? "Fetching Mr.ETC(s).." : "Mint Yours!"}
                      </StyledButton>
                    </s.Container>
                  </>
                )}
              </>
            )}
            <s.SpacerMedium />
          </s.Container>
          <s.SpacerLarge />
          <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg
              alt={"example"}
              src={"/config/images/example.gif"}
              style={{ transform: "scaleX(-1)" }}
            />
          </s.Container>
        </ResponsiveWrapper>
        <s.SpacerMedium />
        <s.Container jc={"center"} ai={"center"} style={{ width: "70%" }}>
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
            📍 Mr.ETCs Jam-Packed Master Masterplan 📍
            <s.SpacerMedium />
            A MASSIVE priority within our collection is giving back to the AMAZING Ethereum Classic Community and Devs who have made it all possible. 
             Not just for us, but for many and more to come.
            <s.SpacerMedium />
             We Thank you, Sincerely. 
             <s.SpacerXSmall />
             Built into our Roadmap, The Mr.ETC Team is Commited to frequently Investing into many new ETC projects in efforts to further enfore the Ecosystem.
            <s.SpacerLarge />
            <s.SpacerLarge />
            ✅ㅤSTAGE I ~ Launch Day: Unleash All 3.5k Mrs
            <s.SpacerLarge />
            STAGE II ~  25% Asset Mintage:
            <s.SpacerSmall />
            - 2% of Funds Donated to ETC Cooperative 
            <s.SpacerXSmall />
            - 2% Funds to Support other ETC Projects
            <s.SpacerXSmall />
            - 3% to ETC Mining to Enforce the Blockchain
            <s.SpacerLarge />
            STAGE III ~ (Coming Soon)
            <s.SpacerLarge />
            - 10 ETC Each Airdropped to 5 Random ETCG Holders  
            <s.SpacerXSmall />
           - 15 ETCG NFT's Total Airdropped to Random Holders
            <s.SpacerMedium />
            STAGE IV (Coming Soon)  ~  45%  Asset Mintage: New Dapp Dev
            <s.SpacerSmall />
            Reinvest Crowd-Sale into New Site.
            <s.SpacerXSmall />
            Featuring: 
	My Gods ,  Browse All Mr.ETCs + Ranking , HENS .ETC Address Ownership Display
  <s.SpacerXSmall />
  Trait Filters, Marketplace and More!
  <s.SpacerXSmall />
  (Market Features Unlock at 100% Mintage)

            <s.SpacerLarge />
            STAGE V ~ 
            <s.SpacerLarge />
            STAGE VI ~ 
            <s.SpacerLarge />
            STAGE VII ~ 
            <s.SpacerLarge />
            STAGE VIII ~ 
            <s.SpacerMedium />
             <s.SpacerLarge />
             <s.SpacerLarge />
            Please ensure you are connected to the (
            {CONFIG.NETWORK.NAME} Blockchain) and correct address. Keep in mind:
            Once Minted, this action is immutable.
          </s.TextDescription>
          <s.SpacerSmall />
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
           Gas is set to {CONFIG.GAS_LIMIT} to ensure the contract to
            successfully mints your Epic Mr.ETC NFTs.
          </s.TextDescription>
        </s.Container>
      </s.Container>
    </s.Screen>
  );
}

export default App;

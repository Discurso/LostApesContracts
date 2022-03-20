const NETWORK_ID = 4

const NFT_CONTRACT_ADDRESS = "0x002cc85C772b8719417B88Ae2dFB64EcD4995648"
const TOKEN_CONTRACT_ADDRESS = "0xA93dFeBB543972C9a8241b0E71dE3a7290101807"
const MINTER_CONTRACT_ADDRESS = "0xbEdB996F47e7C6667a671496E5C7c5A1d719FDB1"
const NFT_CONTRACT_ABI_PATH = "./json_abi/NFT.json"
const TOKEN_CONTRACT_ABI_PATH = "./json_abi/Token.json"
const MINTER_CONTRACT_ABI_PATH = "./json_abi/Minter.json"
var minter_contract
var nft_contract
var token_contract

var accounts
var web3
var NFT_PRICE

function metamaskReloadCallback() {
  window.ethereum.on('accountsChanged', (accounts) => {
    document.getElementById("web3_message").textContent="Se cambió el account, refrescando...";
    window.location.reload()
  })
  window.ethereum.on('networkChanged', (accounts) => {
    document.getElementById("web3_message").textContent="Se el network, refrescando...";
    window.location.reload()
  })
}

const getWeb3 = async () => {
  return new Promise((resolve, reject) => {
    if(document.readyState=="complete")
    {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum)
        window.location.reload()
        resolve(web3)
      } else {
        reject("must install MetaMask")
        document.getElementById("web3_message").textContent="Error: Porfavor conéctate a Metamask";
      }
    }else
    {
      window.addEventListener("load", async () => {
        if (window.ethereum) {
          const web3 = new Web3(window.ethereum)
          resolve(web3)
        } else {
          reject("must install MetaMask")
          document.getElementById("web3_message").textContent="Error: Please install Metamask";
        }
      });
    }
  });
};

const getContract = async (web3, address, abi_path) => {
  const response = await fetch(abi_path);
  const data = await response.json();
  
  const netId = await web3.eth.net.getId();
  contract = new web3.eth.Contract(
    data,
    address
    );
  return contract
}

async function loadDapp() {
  metamaskReloadCallback()
  document.getElementById("web3_message").textContent="Please connect to Metamask"
  var awaitWeb3 = async function () {
    web3 = await getWeb3()
    web3.eth.net.getId((err, netId) => {
      if (netId == NETWORK_ID) {
        var awaitContract = async function () {
          minter_contract = await getContract(web3, MINTER_CONTRACT_ADDRESS, MINTER_CONTRACT_ABI_PATH)
          nft_contract = await getContract(web3, NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI_PATH)
          token_contract = await getContract(web3, TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI_PATH)
          document.getElementById("web3_message").textContent="You are connected to Metamask"
          onContractInitCallback()
          web3.eth.getAccounts(function(err, _accounts){
            accounts = _accounts
            if (err != null)
            {
              console.error("An error occurred: "+err)
            } else if (accounts.length > 0)
            {
              onWalletConnected()
              document.getElementById("account_address").style.display = "block"
            } else
            {
              document.getElementById("connect_button").style.display = "block"
            }
          });
        };
        awaitContract();
      } else {
        document.getElementById("web3_message").textContent="Please connect to Rinkeby";
      }
    });
  };
  awaitWeb3();
}

async function connectWallet() {
  await window.ethereum.request({ method: "eth_requestAccounts" })
  accounts = await web3.eth.getAccounts()
  onWalletConnected()
}

loadDapp()

const onContractInitCallback = async () => {
  NFT_PRICE = await nft_contract.methods.price().call()
  SALE_ACTIVE = await nft_contract.methods.saleActive().call()
  WHITELIST_ACTIVE = await nft_contract.methods.whitelistActive().call()
  CLAIM_ACTIVE = await minter_contract.methods.claimActive().call()
  MAX_SUPPLY = await nft_contract.methods.MAX_SUPPLY().call()
  MAX_MINT_PER_TX = await nft_contract.methods.MAX_MINT_PER_WALLET().call()
  BASE_TOKEN_URI = await nft_contract.methods.baseTokenURI().call()
  OWNER_ADDRESS = await nft_contract.methods.owner().call()
  MINTER_TOKEN_ADDRESS = await minter_contract.methods.TOKEN_CONTRACT_ADDRESS().call()
  MINTER_NFT_ADDRESS = await minter_contract.methods.NFT_CONTRACT_ADDRESS().call()

  var contract_state_str = ""
    + "NFT Price: " + web3.utils.fromWei(NFT_PRICE) + "<br>"
    + "Sale active: " + SALE_ACTIVE + "<br>"
    + "Whitelist active: " + WHITELIST_ACTIVE + "<br>"
    + "Claim active: " + CLAIM_ACTIVE + "<br>"
    + "Max supply: " + MAX_SUPPLY + "<br>"
    + "Max mint per tx: " + MAX_MINT_PER_TX + "<br>"
    + "Base token URI: " + BASE_TOKEN_URI + "<br>"
    + "Owner: " + OWNER_ADDRESS + "<br>"
    + "Token address: " + MINTER_TOKEN_ADDRESS + "<br>"
    + "NFT address: " + MINTER_NFT_ADDRESS + "<br>"
  document.getElementById("contract_state").innerHTML = contract_state_str
}

const onWalletConnected = async () => {
  document.getElementById("account_address").textContent = accounts[0]

  token_balance = await token_contract.methods.balanceOf(accounts[0]).call()
  USER_WHITELIST_RESERVE = await nft_contract.methods.whitelistReserved(accounts[0]).call()
  USER_TOKEN_IDS = await nft_contract.methods.tokensOfOwner(accounts[0]).call()
  ERC20_TOKEN_BALANCE = await token_contract.methods.balanceOf(accounts[0]).call()

  USER_TOKEN_CLAIMABLES = []

  for(var i=0; i<USER_TOKEN_IDS.length; i++)
  {
    claimable_amount = await minter_contract.methods.calculateReward(i).call()
    USER_TOKEN_CLAIMABLES.push(web3.utils.fromWei(claimable_amount))
  }

  var contract_state_str = ""
    + "User Whitelist Reserve: " + USER_WHITELIST_RESERVE + "<br>"
    + "Your tokens: " + USER_TOKEN_IDS + "<br>"
    + "Claimable amounts: " + USER_TOKEN_CLAIMABLES + "<br>"
    + "ERC20 Balance: " + web3.utils.fromWei(ERC20_TOKEN_BALANCE) + "<br>"
  
  document.getElementById("account_state").innerHTML = contract_state_str
}


//// Minter ////

const minterClaim = async (token_id) => {
  const result = await minter_contract.methods.claim(token_id)
  .send({ from: accounts[0], gas: 0, value: 0 })
  .on('transactionHash', function(hash){
    document.getElementById("web3_message").textContent="Claiming...";
  })
  .on('receipt', function(receipt){
    document.getElementById("web3_message").textContent="Success.";    })
  .catch((revertReason) => {
    console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
  });
}

const minterClaimAll = async () => {
  const result = await minter_contract.methods.claimAll()
  .send({ from: accounts[0], gas: 0, value: 0 })
  .on('transactionHash', function(hash){
    document.getElementById("web3_message").textContent="Claiming all...";
  })
  .on('receipt', function(receipt){
    document.getElementById("web3_message").textContent="Success.";    })
  .catch((revertReason) => {
    console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
  });
}

const minterSetClaimActive = async (value) => {
  const result = await minter_contract.methods.setClaimActive(value)
  .send({ from: accounts[0], gas: 0, value: 0 })
  .on('transactionHash', function(hash){
    document.getElementById("web3_message").textContent="Setting claim active...";
  })
  .on('receipt', function(receipt){
    document.getElementById("web3_message").textContent="Success.";    })
  .catch((revertReason) => {
    console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
  });
}

const minterSetRewardPerBlock = async (amount) => {
  const result = await minter_contract.methods.setRewardPerBlock(amount)
  .send({ from: accounts[0], gas: 0, value: 0 })
  .on('transactionHash', function(hash){
    document.getElementById("web3_message").textContent="Setting reward per block...";
  })
  .on('receipt', function(receipt){
    document.getElementById("web3_message").textContent="Success.";    })
  .catch((revertReason) => {
    console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
  });
}

const minterSetNFTContract = async (nft_contract_address) => {
  const result = await minter_contract.methods.setNFTContract(nft_contract_address)
  .send({ from: accounts[0], gas: 0, value: 0 })
  .on('transactionHash', function(hash){
    document.getElementById("web3_message").textContent="Setting NFT contract...";
  })
  .on('receipt', function(receipt){
    document.getElementById("web3_message").textContent="Success.";    })
  .catch((revertReason) => {
    console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
  });
}

const minterSetTokenContract = async (token_contract_address) => {
  const result = await minter_contract.methods.setTokenContract(token_contract_address)
  .send({ from: accounts[0], gas: 0, value: 0 })
  .on('transactionHash', function(hash){
    document.getElementById("web3_message").textContent="Setting token contract...";
  })
  .on('receipt', function(receipt){
    document.getElementById("web3_message").textContent="Success.";    })
  .catch((revertReason) => {
    console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
  });
}

//// NFT ////

const NFTMintWhitelist = async (amount) => {
  const result = await nft_contract.methods.mintWhitelist(amount)
  .send({ from: accounts[0], gas: 0, value: NFT_PRICE * amount })
  .on('transactionHash', function(hash){
    document.getElementById("web3_message").textContent="Minting whitelist...";
  })
  .on('receipt', function(receipt){
    document.getElementById("web3_message").textContent="Success.";    })
  .catch((revertReason) => {
    console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
  });
}

const NFTMint = async (amount) => {
  const result = await nft_contract.methods.mint(amount)
  .send({ from: accounts[0], gas: 0, value: NFT_PRICE * amount })
  .on('transactionHash', function(hash){
    document.getElementById("web3_message").textContent="Minting...";
  })
  .on('receipt', function(receipt){
    document.getElementById("web3_message").textContent="Success.";    })
  .catch((revertReason) => {
    console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
  });
}

const NFTEditWhitelistReserved = async (addresses, amounts) => {
  const result = await nft_contract.methods.editWhitelistReserved(addresses, amounts)
  .send({ from: accounts[0], gas: 0, value: 0 })
  .on('transactionHash', function(hash){
    document.getElementById("web3_message").textContent="Editign whitelist...";
  })
  .on('receipt', function(receipt){
    document.getElementById("web3_message").textContent="Success.";    })
  .catch((revertReason) => {
    console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
  });
}

const NFTSetWhitelistActive = async (value) => {
  const result = await nft_contract.methods.setWhitelistActive(value)
  .send({ from: accounts[0], gas: 0, value: 0 })
  .on('transactionHash', function(hash){
    document.getElementById("web3_message").textContent="Setting whitelist active...";
  })
  .on('receipt', function(receipt){
    document.getElementById("web3_message").textContent="Success.";    })
  .catch((revertReason) => {
    console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
  });
}

const NFTSetSaleActive = async (value) => {
  const result = await nft_contract.methods.setSaleActive(value)
  .send({ from: accounts[0], gas: 0, value: 0 })
  .on('transactionHash', function(hash){
    document.getElementById("web3_message").textContent="Setting sale active...";
  })
  .on('receipt', function(receipt){
    document.getElementById("web3_message").textContent="Success.";    })
  .catch((revertReason) => {
    console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
  });
}

const NFTSetBaseURI = async (base_uri) => {
  const result = await nft_contract.methods.setBaseURI(base_uri)
  .send({ from: accounts[0], gas: 0, value: 0 })
  .on('transactionHash', function(hash){
    document.getElementById("web3_message").textContent="Setting base URI...";
  })
  .on('receipt', function(receipt){
    document.getElementById("web3_message").textContent="Success.";    })
  .catch((revertReason) => {
    console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
  });
}

const NFTSetPrice = async (price) => {
  const result = await nft_contract.methods.setPrice(price)
  .send({ from: accounts[0], gas: 0, value: 0 })
  .on('transactionHash', function(hash){
    document.getElementById("web3_message").textContent="Setting price...";
  })
  .on('receipt', function(receipt){
    document.getElementById("web3_message").textContent="Success.";    })
  .catch((revertReason) => {
    console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
  });
}

const NFTSetMinter = async (minter_address) => {
  const result = await nft_contract.methods.setMinter(minter_address)
  .send({ from: accounts[0], gas: 0, value: 0 })
  .on('transactionHash', function(hash){
    document.getElementById("web3_message").textContent="Setting minter...";
  })
  .on('receipt', function(receipt){
    document.getElementById("web3_message").textContent="Success.";    })
  .catch((revertReason) => {
    console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
  });
}

const NFTWithdrawETH = async () => {
  const result = await nft_contract.methods.NFTWithdrawETH()
  .send({ from: accounts[0], gas: 0, value: 0 })
  .on('transactionHash', function(hash){
    document.getElementById("web3_message").textContent="Withdrawing eth...";
  })
  .on('receipt', function(receipt){
    document.getElementById("web3_message").textContent="Success.";    })
  .catch((revertReason) => {
    console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
  });
}

//// Token ////

const tokenSetMinter = async (minter_address) => {
  const result = await token_contract.methods.setMinter(minter_address)
  .send({ from: accounts[0], gas: 0, value: 0 })
  .on('transactionHash', function(hash){
    document.getElementById("web3_message").textContent="Setting minter...";
  })
  .on('receipt', function(receipt){
    document.getElementById("web3_message").textContent="Success.";    })
  .catch((revertReason) => {
    console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
  });
}
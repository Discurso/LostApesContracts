const NETWORK_ID = 4

const NFT_CONTRACT_ADDRESS = "0x895E3C0C85A7593f5b4c993de546206ea1C75F52"
const TOKEN_CONTRACT_ADDRESS = "0x28FB2D8E2B652058e4Bc4377fA4Cb7f707eDa9dc"
const MINTER_CONTRACT_ADDRESS = "0xAF20800A78dB53bCd637FA2C759b6D74772AE456"
const NFT_CONTRACT_ABI_PATH = "./json_abi/NFT.json"
const TOKEN_CONTRACT_ABI_PATH = "./json_abi/Token.json"
const MINTER_CONTRACT_ABI_PATH = "./json_abi/Minter.json"
var minter_contract
var nft_contract
var token_contract

var accounts
var web3
var ENTRY_PRICE

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
          await window.ethereum.request({ method: "eth_requestAccounts" })
          accounts = await web3.eth.getAccounts()
          document.getElementById("web3_message").textContent="You are connected to Metamask"
          onContractInitCallback()
        };
        awaitContract();
      } else {
        document.getElementById("web3_message").textContent="Please connect to Rinkeby";
      }
    });
  };
  awaitWeb3();
}

loadDapp()

const onContractInitCallback = async () => {
  token_balance = await token_contract.methods.balanceOf(accounts[0]).call()
  xxx = await nft_contract.methods.ownerOf(0).call()
  console.log(token_balance)
  console.log(xxx)
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

//// NFT ////

const NFTMintWhitelist = async (amount) => {
  const result = await nft_contract.methods.mintWhitelist(amount)
  .send({ from: accounts[0], gas: 0, value: NFT_PRICE * amount })
  .on('transactionHash', function(hash){
    document.getElementById("web3_message").textContent="Setting minter...";
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
    document.getElementById("web3_message").textContent="Setting minter...";
  })
  .on('receipt', function(receipt){
    document.getElementById("web3_message").textContent="Success.";    })
  .catch((revertReason) => {
    console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
  });
}

const NFTEditWhitelistReserved = async (addresses, amounts) => {
  const result = await nft_contract.methods.editWhitelistReserved(addresses, amounts)
  .send({ from: accounts[0], gas: 0, value: NFT_PRICE * amount })
  .on('transactionHash', function(hash){
    document.getElementById("web3_message").textContent="Setting minter...";
  })
  .on('receipt', function(receipt){
    document.getElementById("web3_message").textContent="Success.";    })
  .catch((revertReason) => {
    console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
  });
}

const NFTSetWhitelistActive = async (value) => {
  const result = await nft_contract.methods.setWhitelistActive(value)
  .send({ from: accounts[0], gas: 0, value: NFT_PRICE * amount })
  .on('transactionHash', function(hash){
    document.getElementById("web3_message").textContent="Setting minter...";
  })
  .on('receipt', function(receipt){
    document.getElementById("web3_message").textContent="Success.";    })
  .catch((revertReason) => {
    console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
  });
}

const NFTSetSaleActive = async (value) => {
  const result = await nft_contract.methods.setSaleActive(value)
  .send({ from: accounts[0], gas: 0, value: NFT_PRICE * amount })
  .on('transactionHash', function(hash){
    document.getElementById("web3_message").textContent="Setting minter...";
  })
  .on('receipt', function(receipt){
    document.getElementById("web3_message").textContent="Success.";    })
  .catch((revertReason) => {
    console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
  });
}

const NFTSetBaseURI = async (base_uri) => {
  const result = await nft_contract.methods.setBaseURI(base_uri)
  .send({ from: accounts[0], gas: 0, value: NFT_PRICE * amount })
  .on('transactionHash', function(hash){
    document.getElementById("web3_message").textContent="Setting minter...";
  })
  .on('receipt', function(receipt){
    document.getElementById("web3_message").textContent="Success.";    })
  .catch((revertReason) => {
    console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
  });
}

const NFTSetPrice = async (price) => {
  const result = await nft_contract.methods.setPrice(price)
  .send({ from: accounts[0], gas: 0, value: NFT_PRICE * amount })
  .on('transactionHash', function(hash){
    document.getElementById("web3_message").textContent="Setting minter...";
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
// @ts-nocheck
import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("buttonConnect")
const fundButton = document.getElementById("buttonFund")
const divAddress = document.getElementById("divConnectedAddresss")
const checkBalanceButton = document.getElementById("buttonCheckBalance")
const withdrawButton = document.getElementById("buttonWithdraw")
let accountConnected = false
connectButton.onclick = connectWallet
fundButton.onclick = fund
checkBalanceButton.onclick = checkBalance
withdrawButton.onclick = withdraw

window.onload = async function () {
    accountConnected = await getConnectedAccount()
    if (accountConnected) {
        connectWallet()
    }
}

async function connectWallet() {
    if (typeof window.ethereum !== "undefined") {
        console.log("MetaMask detected. Requesting to connect...")
        await window.ethereum.request({
            method: "eth_requestAccounts",
        })
        console.log("MetaMask connected!")
        connectButton.innerHTML = "Connected"
        connectButton.disabled = true
        if (!accountConnected) {
            accountConnected = await getConnectedAccount()
        }
        divAddress.innerHTML = "Connected to " + accountConnected
        checkBalanceButton.disabled = false
        fundButton.disabled = false
        withdrawButton.disabled = false
    }
}

async function getConnectedAccount() {
    let accounts = await window.ethereum.request({ method: "eth_accounts" })
    return accounts[0] || false
}

async function fund() {
    const ethAmount = document.getElementById("txtETHAmount").value
    console.log(`Funding with ${ethAmount} ETH`)
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    try {
        const fundMe = new ethers.Contract(contractAddress, abi, signer)
        const txResponse = await fundMe.fund({ value: ethers.utils.parseEther(ethAmount) })
        await listenForTransactionMined(txResponse, fundMe.provider)
        console.log("Done")
    } catch (error) {
        console.log(error)
    }
}

function listenForTransactionMined(txResponse, provider) {
    console.log(`Mining ${txResponse.hash}`)
    // Listen for transaction to be confirmed
    return new Promise((resolve, reject) => {
        provider.once(txResponse.hash, (txReceipt) => {
            console.log(`Mined with ${txReceipt.confirmations} confirmations.`)
            resolve()
        })
    })
}

async function checkBalance() {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const balanceWei = await provider.getBalance(contractAddress)
    const balanceETH = ethers.utils.formatEther(balanceWei)
    console.log(`Contract balance = ${balanceETH.toString()} ETH`)
}

async function withdraw() {
    console.log("Withdrawing ...")
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    try {
        const fundMe = new ethers.Contract(contractAddress, abi, signer)
        const txResponse = await fundMe.withdraw()
        await listenForTransactionMined(txResponse, fundMe.provider)
        console.log("Done withdrawing")
    } catch (error) {
        console.log(error)
    }
}

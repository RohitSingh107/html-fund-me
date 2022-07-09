import { ethers, providers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

console.log(ethers)

async function connect() {
    if (typeof window.ethereum !== undefined) {
        await window.ethereum.request({
            method: "eth_requestAccounts",
        })
        connectButton.innerHTML = "Connected!"
        console.log("connected")
    } else {
        console.log("No metamask")
        connectButton.innerHTML = "Please install metamask"
    }
}

function listenForTransaction(transactionResponse, provider) {
    return new Promise((resolve, reject) => {
        console.log(`Mining ${transactionResponse.hash}...`)
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}...`)

    const sendValue = ethers.utils.parseEther(ethAmount)
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)

        // const MINIMUM_USD = await contract.getMinimumUSD()
        // const pricefeed = await contract.getEthPrice()
        // const convertedAmount = await contract.getPriceFeedConverted(
        //     ethers.utils.parseEther(ethAmount)
        // )

        // console.log(typeof MINIMUM_USD)
        // console.log(`Ether amount is ${ethers.utils.parseEther(ethAmount)}`)

        // console.log(
        //     `MINIMUM_USD is ${MINIMUM_USD} and convertedAmount is ${convertedAmount}`
        // )

        // console.log(
        //     `convertedAmount is more than MINIMUM_USD: ${
        //         convertedAmount >= MINIMUM_USD
        //     }`
        // )

        // console.log(`Eth price is ${pricefeed}`)

        // console.log(`Division: ${MINIMUM_USD / convertedAmount}`)

        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })

            await listenForTransaction(transactionResponse, provider)
            console.log("Done")
        } catch (error) {
            console.log(error)
        }

        // await transactionResponse.wait(1)
        // const balance = await provider.getBalance(contractAddress)
        // console.log(ethers.utils.formatEther(balance))
    } else {
        fundButton.innerHTML = "Please install MetaMask"
    }
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        console.log("Withdrawing...")
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)

        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransaction(transactionResponse, provider)
        } catch {
            console.log(error)
        }
    }
}

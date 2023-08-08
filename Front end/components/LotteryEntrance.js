import { contractAddresses, abi } from "../constants"
import { useWeb3Contract, useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { useNotification } from "web3uikit"
import { ethers, formatEther } from "ethers"
import { useLotteryEventListener } from "./EventListener.js"

export default function LotteryEntrance() {
    //let counter
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    const [entranceFee, setEntranceFee] = useState("0") // Why do we use State hook instead of let?
    const [NumPlayers, setNumPlayers] = useState("0") // Because "let" will not triger the rerender for as, but State Hook will
    const [RecentWinner, setRecentWinner] = useState("0")
    //let lastWinner, currentWinner

    const dispatch = useNotification()

    const provider = new ethers.JsonRpcProvider("http://localhost:8545/")
    const raffleContract = new ethers.Contract(raffleAddress, abi, provider)

    const {
        runContractFunction: enterRaffle,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        msgValue: entranceFee,
        params: {},
    })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress, // specify the networkId
        functionName: "getEntranceFee",
        params: {},
    })

    const { runContractFunction: getPlayersNumber } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    // async function getlastWinner() {
    //     lastWinner = await getRecentWinner()
    // }

    const handleNewNotification = () => {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Transaction Notification",
            position: "topR",
            icon: "bell",
        })
    }

    const handleSuccess = async (tx) => {
        try {
            await tx.wait(1)
            updateUIValues()
            handleNewNotification(tx)
        } catch (error) {
            console.log(error)
        }
    }

    //Functions

    async function updateUIValues() {
        const entranceFeeFromCall = (await getEntranceFee()).toString()
        const numPlayersFromCall = (await getPlayersNumber()).toString()
        const recentWinnerFromCall = await getRecentWinner()

        await setEntranceFee(entranceFeeFromCall)
        await setNumPlayers(numPlayersFromCall)
        await setRecentWinner(recentWinnerFromCall)
    }

    // Listeners
    useEffect(() => {
        if (isWeb3Enabled) {
            updateUIValues()
        }
    }, [isWeb3Enabled])

    useLotteryEventListener(raffleContract, updateUIValues, provider, NumPlayers)

    // useEffect(() => {
    //     console.log("111111111")
    //     if (isWeb3Enabled && raffleContract) {
    //         console.log("12222")
    //         async function update() {
    //             //getlastWinner()
    //             //currentWinner = await getRecentWinner()
    //             console.log(lastWinner)
    //             console.log("2222222222")
    //             if (lastWinner !== currentWinner) {
    //                 console.log("33333333333")
    //                 updateUIValues()
    //                 lastWinner = currentWinner
    //             }
    //         }
    //         update()
    //     }
    // }, [raffleContract])

    // Return
    return (
        <div className="p-5">
            {raffleAddress ? (
                <div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        onClick={async function () {
                            await enterRaffle({
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            })
                        }}
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            "Enter Raffle"
                        )}
                    </button>
                    <div>Entrance Fee: {ethers.formatEther(entranceFee)} ETH</div>
                    <div>The current number of players is: {NumPlayers}</div>
                    <div>The most previous winner was: {RecentWinner}</div>
                </div>
            ) : (
                <div>No Raffle raffleAddress deteched </div>
            )}
        </div>
    )
}

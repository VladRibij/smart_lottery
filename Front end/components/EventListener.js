import { useEffect } from "react"

export function useLotteryEventListener(raffleContract, onWinnerPicked, provider, NumPlayers) {
    useEffect(() => {
        console.log("11111")
        if (raffleContract) {
            console.log("22222")
            const handleWinnerPicked = async () => {
                console.log("33333")
                onWinnerPicked()
                console.log(NumPlayers)
            }

            provider.once("block", () => {
                console.log("44444")
                raffleContract.once("WinnerPicked", handleWinnerPicked)
            }) // Use 'once' instead of 'on'

            // No need to return anything since 'once' will handle the cleanup automatically
        }
    }, [raffleContract])
}

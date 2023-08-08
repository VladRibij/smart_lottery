import { useEffect } from "react"

export function useLotteryEventListener(raffleContract, onWinnerPicked, provider) {
    useEffect(() => {
        if (raffleContract) {
            const handleWinnerPicked = async () => {
                onWinnerPicked()
            }
            provider.once("block", () => {
                raffleContract.once("WinnerPicked", handleWinnerPicked)
            })
        }
    }, [raffleContract])
}

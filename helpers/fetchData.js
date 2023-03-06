const StoreAddressForm = document.getElementById('storeAddress')
StoreAddressForm.addEventListener('submit', storeAddress)

async function storeAddress(e) {
    e.preventDefault() // to prevent default form behavior 

    const amount = document.getElementById('amountToStore').value
    const address = document.getElementById('addressToStore').value
    const date = document.getElementById('dateToStore').value

    await ethereum.request({
        method: 'wallet_invokeSnap',
        params: [
            snapId,
            {
                method: 'storeAddress',
                params: {
                    amountToStore : amount,
                    addressToStore : address,
                    dateToStore : date,
                }
            }
        ]
    })

    showScheduledPayment()
}
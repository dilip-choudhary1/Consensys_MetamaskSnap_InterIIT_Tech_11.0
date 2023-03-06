async function connect() {
    await ethereum.request({
        method: 'wallet_enable',
        params: [{
            wallet_snap: { [snapId]: {} },
        }]
    })
}
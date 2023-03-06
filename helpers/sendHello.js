async function send() {
    try {
      const response = await ethereum.request({
        method: 'wallet_invokeSnap',
        params: [snapId, {
          method: 'hello'
        }]
      })
    } catch (err) {
      console.error(err)
      alert('Problem happened: ' + err.message || err)
    }
  }

// run the script given below every 30 secs
setInterval(isTransactionScheduled, 5000);

async function clearAddresses() {
    await ethereum.request({
        method: 'wallet_invokeSnap',
        params: [
            snapId,
            {
                method: 'clearAddress'
            }
        ]
    })

    showScheduledPayment();
}
async function showScheduledPayment(){
    state = await ethereum.request({
        method: 'wallet_invokeSnap',
        params: [
            snapId,
            {
                method: 'retrieveAddresses'
            }
        ]
    })

    const message = state.addressToStore == '' ? "You have no payments Scheduled" : `${state.addressToStore}`;

    document.getElementById('addressBook').textContent = '' + `${message}`;
}

// finally write the js function to check if the date matches the given one
function checkDateMatch(scheduledDate, currentDate) {
    let month = currentDate.getMonth() + 1;
    let date = currentDate.getDate();
    const year = currentDate.getFullYear();

    month = month < 10 ? `0${month}` : month;
    date = date < 10 ? `0${date}` : date;

    const finalDateExpression = `${year}-${month}-${date}`

    const hours = new Date().getHours();
    const minutes = new Date().getMinutes();

    const finalTimeExpression = `${hours}:${minutes}`;


    // check if the dates match;
    if (scheduledDate == `${finalDateExpression}T${finalTimeExpression}`) {
        return true;
    }else{
        return false;
    }

}

// check if the transaction is scheduled or not
async function isTransactionScheduled() {
    state = await ethereum.request({
        method: 'wallet_invokeSnap',
        params: [
            snapId,
            {
            method: 'retrieveAddresses'
        }]
    })

    const scheduledDate = state.dateToStore;
    const currentDate = new Date();
    

    console.log(scheduledDate);
    console.log(currentDate);

    const isScheduled = checkDateMatch(scheduledDate, currentDate);

    console.log(isScheduled);
    if (isScheduled) {
        makeScheduledTransaction(state);
    }
}


// made a function to make the scheduled payment
async function makeScheduledTransaction(givenState){
    await ethereum.request({
        method: "wallet_invokeSnap",
        params: [
            snapId,
            {
                method: 'clearAddress'
            }
        ]
    })
    // get the account details
    const accounts = await ethereum.request({method: "eth_requestAccounts"});
    const account = accounts[0];

    // set transaction details
    const transactionDetail = {
        to: givenState.addressToStore,
        from: accounts[0],
        value: givenState.amountToStore,
        data:
          '0x7f7465737432000000000000000000000000000000000000000000000000000000600057', // Optional, but used for defining smart contract creation and interaction.
        chainId: '0x5',
    }

    console.log(transactionDetail);

    // make trasaction to the given address 
    await ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionDetail]
    })


    
}


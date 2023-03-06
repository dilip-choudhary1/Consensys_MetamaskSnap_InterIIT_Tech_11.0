module.exports.onRpcRequest = async ({ origin, request }) => {

  let state = await wallet.request({
    method: 'snap_manageState',
    params: ['get'],
  });

  if (!state) {
    state = { amountToStore: '', addressToStore: '', dateToStore: '', executeRecurringPayment: 'false', recurringTransactionsList: [] };
    await wallet.request({
      method: 'snap_manageState',
      params: ['update', state],
    });
  }

  switch (request.method) {

    case 'storeMonthlyData':
        state.recurringTransactionsList = request.params.arrayToStore

      await wallet.request({
        method: 'snap_manageState',
        params: ['update', state],
      });
      return true;

    // method to update the state with user input fields
    case 'storeAddress':
      state.amountToStore = request.params.amountToStore,
        state.addressToStore = request.params.addressToStore,
        state.dateToStore = request.params.dateToStore,
      await wallet.request({
        method: 'snap_manageState',
        params: ['update', state],
      });
      return true;


    // method to retrieve the data of the state
    case 'retrieveAddresses':
      return state;

    case 'updateMonthlyExecution':
      state.executeRecurringPayment = 'false';
            await wallet.request({
        method: 'snap_manageState',
        params: ['update', state]
      });

    case 'clearAddress':
      state = { amountToStore: '', addressToStore: '', dateToStore: '', executeRecurringPayment: 'false', recurringTransactionsList: [] };
      await wallet.request({
        method: 'snap_manageState',
        params: ['update', state]
      });

    // method to show the current state of the data
    // case 'hello':
    //   return wallet.request({
    //     method: 'snap_confirm',
    //     params: [
    //       {
    //         prompt: `Hello, ${origin}!`,
    //         description: 'Address book:',
    //         textAreaContent: `${state.amountToStore} ${state.addressToStore} ${state.dateToStore} ${state.executeRecurringPayment} ${state.recurringTransactionsList}`,
    //       },
    //     ],
    //   });


    // default method
    default:
      throw new Error('Method not found.');
  }
};


// cronJob cofigured 
module.exports.onCronjob = async ({ request }) => {
  switch (request.method) {
    case 'checkTransaction':
      let state = await wallet.request({
        method: 'snap_manageState',
        params: ['get'],
      });



    case "recurringTransaction":
      let givenstate = await wallet.request({
        method: 'snap_manageState',
        params: ['get'],
      });
      // monthly payments 
      if (givenstate.executeRecurringPayment == 'false') {
        givenstate.executeRecurringPayment = 'true'
      }

      // updating the state after a month
      await wallet.request({
        method: 'snap_manageState',
        params: ['update', givenstate]
      })


    default:
      throw new Error('Method not found.');
  }
};
// Transaction insights
module.exports.onTransaction = async ({
  transaction,
  chainId,
}) => {
  
  const toAddress = transaction.to; //Recipient's address
  const fromAddress = transaction.from; //Sender's address

  //Fetching API for Recipient's detail
  const apiResponseOfRecipient = await fetch(`https://api-goerli.etherscan.io/api?module=account&action=txlist&address=${toAddress}&sort=desc&apikey=5UWE9B4FVD4TI6UF4RJVJGNYJZQPKCYPXQ`)
    .then((res) => {
      if (!res.ok) {
        throw new Error('Bad response from server');
      }
      return res.json();
    })
    .catch((err) => console.error(err));
  //Fetching API for Sender's detail
  const apiResponseOfUser = await fetch(`https://api-goerli.etherscan.io/api?module=account&action=txlist&address=${fromAddress}&sort=desc&apikey=5UWE9B4FVD4TI6UF4RJVJGNYJZQPKCYPXQ`)
    .then((res) => {
      if (!res.ok) {
        throw new Error('Bad response from server');
      }
      return res.json();
    })
    .catch((err) => console.error(err));

  

  const RecipientResults = apiResponseOfRecipient.result; //Storing result of Recipient's data fetched from api
  const UserResults = apiResponseOfUser.result; //Storing result of Sender's data fetched from api
   
  //Converting timestamp into month and storing transaction done by recipient's per month
  const monthlyData = {};

  RecipientResults.forEach((item) => {
    let date = new Date(item.timeStamp * 1000);
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let transactionValue = Number((item.value)) / 10 ** 18;

    if (!monthlyData[year]) monthlyData[year] = {};
    if (!monthlyData[year][month]) monthlyData[year][month] = 0;

    monthlyData[year][month] += transactionValue;
  });

  const months = [];
  const amounts = [];

  Object.entries(monthlyData).forEach(([year, data]) => {
    Object.entries(data).forEach(([month, value]) => {
      months.push(`"${year}/${month}"`);
      amounts.push(value);
    });
  });
  console.table(months);
  console.table(amounts);

  //Converting timestamp into month and storing transaction done by sender's per month
  const monthlyDataUser = {};

  UserResults.forEach((item) => {
    let dateUser = new Date(item.timeStamp * 1000);
    let monthUser = dateUser.getMonth() + 1;
    let yearUser = dateUser.getFullYear();
    let transactionValueUser = Number((item.value)) / 10 ** 18;

    if (!monthlyDataUser[yearUser]) monthlyDataUser[yearUser] = {};
    if (!monthlyDataUser[yearUser][monthUser]) monthlyDataUser[yearUser][monthUser] = 0;

    monthlyDataUser[yearUser][monthUser] += transactionValueUser;
  });

  const monthsUser = [];
  const amountsUser = [];

  Object.entries(monthlyDataUser).forEach(([yearUser, data]) => {
    Object.entries(data).forEach(([monthUser, value]) => {
      monthsUser.push(`"${yearUser}/${monthUser}"`);
      amountsUser.push(value);
    });
  });
  console.table(monthsUser);
  console.table(amountsUser);


//Counting no. of smart contract created and normal transaction
let blankToCount = 0;
let nonBlankToCount = 0;

RecipientResults.forEach(result => {
  if (!result.to) {
    blankToCount++;
  } else {
    nonBlankToCount++;
  }
});

console.log(`Blank To Count: ${blankToCount}`);
console.log(`Non-Blank To Count: ${nonBlankToCount}`);
  //Link for Recipient Past Transaction
  const ReceipientPastTransaction = `https://quickchart.io/chart?c={type:'line',data:{labels:[${months}],datasets:[{label:'Transaction in Ethers',data:[${amounts}],fill:false,borderColor:'green'}]}}`;

  //Link for User Past Transaction
  const UserPastTransaction = `https://quickchart.io/chart?c={type:'line',data:{labels:[${monthsUser}],datasets:[{label:'Transaction in Ethers',data:[${amountsUser}],fill:false,borderColor:'green'}]}}`;

  //Link for Contract vs Transaction
  const TypeOfTransaction = `https://quickchart.io/chart?c={type:'pie',data:{labels:['Normal Transaction','Smart Contract Creation'],datasets:[{data:[${nonBlankToCount},${blankToCount}]}]}}`;

  //Setting up insights
  const insights = {
    'Past Transaction of Receipient': ReceipientPastTransaction,
    'Past Transaction of Sender': UserPastTransaction,
    'Normal Transaction vs Smart Contract of Recipient': TypeOfTransaction,
  };

  return { insights };
};
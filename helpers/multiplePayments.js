function Upload() {
    var fileUpload = document.getElementById("fileUpload");
    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/;
    if (regex.test(fileUpload.value.toLowerCase())) {
        if (typeof (FileReader) != "undefined") {
            var reader = new FileReader();
            reader.onload = function (e) {
                var table = document.createElement("table");
                var rows = e.target.result.split("\n");
                console.log(rows)
                for (var i = 0; i < rows.length; i++) {
                    var cells = rows[i].split(",");
                    if (cells.length > 1) {
                        var row = table.insertRow(-1);
                        for (var j = 0; j < cells.length; j++) {
                            var cell = row.insertCell(-1);
                            cell.innerHTML = cells[j];
                        }
                    }
                }
                var dvCSV = document.getElementById("dvCSV");
                dvCSV.innerHTML = "";
                dvCSV.appendChild(table);
            }
            reader.readAsText(fileUpload.files[0]);
        } else {
            alert("This browser does not support HTML5.");
        }
    } else {
        alert("Please upload a valid CSV file.");
    }
}



async function makeJson() {
    var table = document.querySelector("table");
    var header = [];
    var rows = [];

    for (var i = 0; i < table.rows[0].cells.length; i++) {
        header.push(table.rows[0].cells[i].innerHTML);
    }
    for (var i = 1; i < table.rows.length; i++) {
        var row = {
            Receiver: '',
            Value: '',
        };
        row.Receiver = table.rows[i].cells[0].innerHTML
        row.Value = table.rows[i].cells[1].innerHTML
        rows.push(row);
    }

    accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const transactionDetails = rows;
    arrayOfData = [];
    transactionDetails.map(data => {
        const detail = {
            to: data.Receiver, // Required except during contract publications.
            from: accounts[0], // must match user's active address.
            value: data.Value,// Only required to send ether to the recipient from the initiating external account.
            data:
                '0x7f7465737432000000000000000000000000000000000000000000000000000000600057', // Optional, but used for defining smart contract creation and interaction.
            chainId: '0x5', // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
        };
        if (detail.to != '' && detail.value != '') {
            detail.value = detail.value.slice(0, -1);
            arrayOfData.push(detail);
        }
    })

    makePayments(arrayOfData);
}


async function makePayments(transactionDetails) {
    for (let index = 0; index < transactionDetails.length; index++) {
        await ethereum.request({
            method: 'eth_sendTransaction',
            params: [transactionDetails[index]]
        })
    }
}
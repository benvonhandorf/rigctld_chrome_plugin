
let bind_alerts = (spots) => {

}

let retrieve_alerts = () => {
    let request = {type: "alerts"}

    chrome.runtime.sendMessage(request, (response) => {
        bind_alerts(response)
    });

};

retrieve_alerts();
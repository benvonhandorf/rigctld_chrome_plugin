
console.log("Background setup");

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log("Control request: ");
        console.log(request);

        try {
            chrome.runtime.sendNativeMessage('com.skyironstudio.rigctld_native_messaging_host',
                request,
                function (response) {
                    console.log("Received");
                    console.log(response);
                });
        } catch(e) {
            console.log(e);
        }

      return true;
    }
);

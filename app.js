const connectWalletBtn = document.getElementById("connectWalletBtn");
const scanNfcBtn = document.getElementById("scanNfcBtn");
const walletDisplay = document.getElementById("walletAddress");
const nfcOutput = document.getElementById("nfcDataOutput");

let walletAddress = "";
let peraWallet;

async function connectWallet() {
  peraWallet = new PeraWalletConnect();
  try {
    const accounts = await peraWallet.connect();
    walletAddress = accounts[0];
    walletDisplay.innerText = `Connected Wallet: ${walletAddress}`;
  } catch (err) {
    console.error("Wallet connection failed:", err);
    walletDisplay.innerText = "Wallet connection failed.";
  }
}

async function scanNfcTag() {
  if (!("NDEFReader" in window)) {
    alert("Web NFC not supported. Use Chrome on Android.");
    return;
  }

  const reader = new NDEFReader();
  try {
    await reader.scan();
    reader.onreading = event => {
      const decoder = new TextDecoder();
      let tagData = "";

      for (const record of event.message.records) {
        if (record.recordType === "text") {
          tagData += decoder.decode(record.data);
        }
      }

      const timestamp = new Date().toISOString();

      const payload = {
        wallet: walletAddress,
        tag: tagData,
        timestamp: timestamp
      };

      nfcOutput.textContent = JSON.stringify(payload, null, 2);
      sendToGoogleSheets(payload);
    };
  } catch (error) {
    console.error("NFC Scan failed:", error);
    alert("Scan failed. Try again.");
  }
}

function sendToGoogleSheets(data) {
  fetch("https://script.google.com/macros/s/PASTE_YOUR_DEPLOYED_SCRIPT_URL_HERE/exec", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json"
    }
  }).then(response => {
    if (!response.ok) throw new Error("Failed to send data.");
    return response.text();
  }).then(result => {
    console.log("Saved to Google Sheets:", result);
  }).catch(error => {
    console.error("Error sending to Google Sheets:", error);
  });
}

connectWalletBtn.onclick = connectWallet;
scanNfcBtn.onclick = scanNfcTag;

const bidhistoryEl = document.getElementById("bid-history")
const bidder1Input = document.getElementById("bidder1-input")
const bidder2Input = document.getElementById("bidder2-input")
const bidder1Button = document.getElementById("bidder1-btn")
const bidder2Button = document.getElementById("bidder2-btn")
const highestBidder = document.getElementById("high")
const highestBidValue = highestBidder.querySelector(".highest-value")
const cleanButton = document.getElementById("cleanbtn")

const STORAGE_KEY = "bids";

const bids = loadBids();

function loadBids() {
  try {
    const bidsFromStorage = localStorage.getItem(STORAGE_KEY);
    if (!bidsFromStorage) {
      return [];
    }

    const parsedBids = JSON.parse(bidsFromStorage);
    return Array.isArray(parsedBids) ? parsedBids : [];
  } catch (error) {
    console.error("Error reading bids from localStorage", error);
    return [];
  }
}

function saveBids() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bids));
}

function getValidBidAmount(inputEl) {
  const value = inputEl.value.trim();
  if (!value) return null;

  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  return amount;
}

function placebid(bidderId, inputEl) {
  const inputValue = getValidBidAmount(inputEl);
  if (inputValue === null) {
    inputEl.value = "";
    inputEl.focus();
    return;
  }

  bids.push({ bidder: bidderId, amount: inputValue });
  saveBids();
  inputEl.value = "";
  renderBids();
}

function renderBids() {
  renderHighestBidder();

  if (bids.length === 0) {
    bidhistoryEl.innerHTML = "<li>No bids yet</li>";
    return;
  }

  const sortedBids = [...bids]
    .map((bid, originalIndex) => ({ bid, originalIndex }))
    .sort((firstBid, secondBid) => Number(secondBid.bid.amount) - Number(firstBid.bid.amount));

  bidhistoryEl.innerHTML = sortedBids
    .map(({ bid, originalIndex }) => {
      const formattedAmount = Number(bid.amount).toFixed(2).replace(/\.00$/, "");
      const bidderLabel = getBidderLabel(bid.bidder);

      return `
        <li>
          <div class="bid-entry">
            <strong>${bidderLabel}</strong>
            <span>$${formattedAmount}</span>
          </div>
          <button class="remove-bid" type="button" data-bid-index="${originalIndex}" aria-label="Remove bid" title="Remove bid">&#128465;</button>
        </li>
      `;
    })
    .join("");
}

function renderHighestBidder() {
  if (bids.length === 0) {
    highestBidValue.textContent = "No bids yet";
    return;
  }

  const highestBid = bids.reduce((winner, currentBid) => {
    if (Number(currentBid.amount) > Number(winner.amount)) {
      return currentBid;
    }
    return winner;
  }, bids[0]);

  const formattedAmount = Number(highestBid.amount).toFixed(2).replace(/\.00$/, "");
  highestBidValue.textContent = `${getBidderLabel(highestBid.bidder)} - $${formattedAmount}`;
}

function getBidderLabel(bidderId) {
  if (bidderId === "bidder1") return "Bidder 1";
  if (bidderId === "bidder2") return "Bidder 2";
  return "Unknown bidder";
}

bidder1Button.addEventListener("click", () => placebid("bidder1", bidder1Input));
bidder2Button.addEventListener("click", () => placebid("bidder2", bidder2Input));

bidder1Input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    placebid("bidder1", bidder1Input);
  }
});

bidder2Input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    placebid("bidder2", bidder2Input);
  }
});

bidhistoryEl.addEventListener("click", (event) => {
  const removeButton = event.target.closest(".remove-bid");
  if (!removeButton) return;

  const bidIndex = Number(removeButton.dataset.bidIndex);
  if (Number.isNaN(bidIndex)) return;

  bids.splice(bidIndex, 1);
  saveBids();
  renderBids();
});

cleanButton.addEventListener("click", () => {
  bids.length = 0;
  saveBids();
  renderBids();
});

renderBids();

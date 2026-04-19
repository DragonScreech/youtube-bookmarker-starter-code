const urlInput = document.getElementById("bg-image-url")
const setBtn = document.getElementById("set-button")
const savedList = document.getElementById("saved-list")
const refreshBtn = document.getElementById("refresh-button")

async function getActiveTabId() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  return tab?.id ?? null
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function renderSavedBackgrounds(items) {
  // items: [{ key, url }]
  savedList.innerHTML = ""

  if (!items.length) {
    savedList.innerHTML = `<div class="muted">No saved backgrounds yet.</div>`
    return
  }

  for (const { key, url } of items) {
    const badge = escapeHtml(key.slice(0, 3).toUpperCase())
    const safeUrl = escapeHtml(url)

    const row = document.createElement("div")
    row.className = "saved-item"
    row.innerHTML = `
      <div class="badge" title="${escapeHtml(key)}">${badge}</div>
      <img class="thumb" src="${safeUrl}" alt="thumbnail" loading="lazy" />
    `

    // click row => fill input (and optionally apply)
    row.addEventListener("click", async () => {
      urlInput.value = url

      const tabId = await getActiveTabId()
      if (!tabId) return

      chrome.tabs.sendMessage(tabId, { type: "BG_CHANGED", value: url }, () => {
        if (chrome.runtime.lastError) {
          console.log("sendMessage error:", chrome.runtime.lastError.message)
        }
      })
    })

    savedList.appendChild(row)
  }
}

async function refreshSavedList() {
  const all = await chrome.storage.local.get(null) // get everything
  const items = Object.entries(all)
    .filter(([_, url]) => typeof url === "string" && url.length > 0)
    .map(([key, url]) => ({ key, url }))

  items.sort((a, b) => a.key.localeCompare(b.key))

  renderSavedBackgrounds(items)
}

setBtn.addEventListener("click", async () => {
  const url = urlInput.value.trim()
  if (!url) return

  const tabId = await getActiveTabId()
  if (!tabId) return

  chrome.tabs.sendMessage(tabId, { type: "BG_CHANGED", value: url }, () => {
    if (chrome.runtime.lastError) {
      console.log("sendMessage error:", chrome.runtime.lastError.message)
    }
  })
})

refreshBtn.addEventListener("click", refreshSavedList)

refreshSavedList()




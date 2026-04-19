function waitForTitleToSettle({ intervalMs = 100, stableForMs = 5000, timeoutMs = 6000 } = {}) {
  return new Promise((resolve) => {

    const t = setInterval(() => {
      const nowTitle = document.title
      if (nowTitle !== "Buzz" && (document.querySelector("lib-assessment-template").querySelector("div") !== null || document.querySelector(".template-content") !== null)) {
        clearInterval(t)
        resolve(document.title)
      }
    }, intervalMs)
  })
}

async function loadBGWhenReady() {
  const title = await waitForTitleToSettle()
  console.log("Settled title:", title)
  loadBGForTitle(title)
}

function loadBGForTitle(title) {
  chrome.storage.local.get(title).then((result) => {
    const savedUrl = result[title]
    console.log("Loaded:", savedUrl)

    if (savedUrl) {
      const container = document.querySelector(".template-container")
      if (container) {
        container.style.backgroundImage = `url("${savedUrl}")`
      }
      else {
        const libAssessment = document.querySelector("lib-assessment-template").querySelector("div")
        libAssessment.style.backgroundImage = `url("${savedUrl}")`
      }

      const templateContent = document.querySelector(".template-content")
      if (templateContent) {
        templateContent.style.backgroundColor = "#ffffffbb"
      }
      else {
        const table = document.querySelector("lib-assessment-template").querySelector("div").querySelector("table")
        table.style.backgroundColor = "#ffffffbb"
      }
    }
  })
}

// run on injection
loadBGWhenReady()



function changeBG(url) {
  const container = document.querySelector(".template-container")
  if (container) {
    container.style.backgroundImage = `url("${url}")`
  }
  else {
    const libAssessment = document.querySelector("lib-assessment-template").querySelector("div")
    libAssessment.style.backgroundImage = `url("${url}")`
  }

  const templateContent = document.querySelector(".template-content")
  if (templateContent) {
    templateContent.style.backgroundColor = "#ffffffbb"
  }
  else {
    const table = document.querySelector("lib-assessment-template").querySelector("div").querySelector("table")
    table.style.backgroundColor = "#ffffffbb"
  }

  const title = document.title
  console.log("Saving for title:", title)

  chrome.storage.local.set({ [title]: url }).then(() => {
    console.log("Saved:", title, url)
  })
}





chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "BG_CHANGED") {
    changeBG(msg.value)
  }
  if (msg.type === "NEW") {
    setTimeout(() => {
      console.log("Delayed for 1 second.");
      loadBGWhenReady()
    }, 1000)
  }
})
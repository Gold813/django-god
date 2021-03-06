const resultsList = document.querySelector(`#results-list`);
const searchInput = document.querySelector(`#search-input`);
const searchNavTop = document.querySelector(`#search-nav-top`);
const searchNavBottom = document.querySelector(`#search-nav-bottom`);
const bibleVersionID = getParameterByName(`version`) || `06125adad2d5898a-01`;
const abbreviation = getParameterByName(`abbr`) || "ASV";
const query = getParameterByName(`query`);

if (query) {
  document.querySelector(`#viewing`).innerHTML = query;
  search(query);
}

function search(searchText, offset = 0) {
  searchInput.value = searchText;
  getResults(searchText, offset).then((data) => {
    let resultsHTML = ``;

    if (data.verses) {
      if (!data.verses[0]) {
        searchNavTop.innerHTML = ``;
        searchNavBottom.innerHTML = ``;
        resultsHTML = `<div class="no-results">☹️ No results. Try <a href="/">changing versions?</a></div>`;
      } else {
        const [topSearchNavHTML, searchNavHTML] = buildNav(
          offset,
          data.total,
          searchText
        );
        searchNavTop.innerHTML = topSearchNavHTML;
        searchNavBottom.innerHTML = searchNavHTML;

        resultsHTML += `<ul>`;
        for (let verse of data.verses) {
          resultsHTML += `<li>
            <h5>${verse.reference}</h5>
            <div class="text not-eb-container">${verse.text}</div>
            <a href="/verse?version=${bibleVersionID}&abbr=${abbreviation}&chapter=${verse.chapterId}">view chapter</a>	
          </li>`;
        }
        resultsHTML += `<ul>`;
      }
    }

    if (data.passages) {
      searchNavTop.innerHTML = ``;
      searchNavBottom.innerHTML = ``;
      if (!data.passages[0]) {
        resultsHTML = `<div class="no-results">☹️ No results. Try <a href="/">changing versions?</a></div>`;
      } else {
        resultsHTML += `<ul>`;
        for (let passage of data.passages) {
          resultsHTML += `<li>
            <h5>${passage.reference}</h5>
            <div class="text eb-container">${passage.content}</div>
            <a href="/verse?version=${bibleVersionID}&abbr=${abbreviation}&chapter=${passage.chapterIds[0]}">view chapter</a>
            <br>
          </li>`;
        }
        resultsHTML += `</ul>`;
      }
    }

    resultsList.innerHTML = resultsHTML;
  });
}

function buildNav(offset, total, searchText) {
  const topSearchNavHTML = `<span class="results-count">Showing <b>${
    offset * 10 + 1
  }-${
    offset * 10 + 10 > total ? total : offset * 10 + 10
  }</b> of <b>${total}</b> results.</span>`;
  let searchNavHTML = `<span class="results-current-page"> Current page: <b>${
    offset + 1
  }</b></span>`;

  if (offset > 0 || total / 10 > offset + 1) {
    searchNavHTML += `<span class="results-nav">`;
  }

  if (offset > 0) {
    searchNavHTML += `<button onclick="search('${searchText}', ${
      offset - 1
    })">Previous Page</button>`;
  }

  if (total / 10 > offset + 1) {
    searchNavHTML += `<button onclick="search('${searchText}', ${
      offset + 1
    })">Next Page</button>`;
  }

  if (offset > 0 || total / 10 > offset + 1) {
    searchNavHTML += `</span>`;
  }

  return [topSearchNavHTML, searchNavHTML];
}

function getResults(searchText, offset = 0) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.addEventListener(`readystatechange`, function () {
      if (this.readyState === this.DONE) {
        const { data, meta } = JSON.parse(this.responseText);

        _BAPI.t(meta.fumsId);
        resolve(data);
      }
    });

    xhr.open(
      `GET`,
      `https://api.scripture.api.bible/v1/bibles/${bibleVersionID}/search?query=${searchText}&offset=${offset}`
    );
    xhr.setRequestHeader(`api-key`, API_KEY);

    xhr.onerror = () => reject(xhr.statusText);

    xhr.send();
  });
}



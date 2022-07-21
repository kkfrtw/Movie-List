const BASE_URL = "https://movie-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/movies/"
const POSTER_URL = BASE_URL + "/posters/"
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []

const dataPanel = document.querySelector("#data-panel")
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

function renderMovieList(data) {
  //把movies變數放在外面(global)，減少未來修改code的負擔
  let rawHTML = ''
  //processing
  data.forEach((item) => {
    //title, image
    rawHTML += `<div class ="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                  data-bs-target="#movie-modal" data-id="${item.id}">More</button>
                <button class="btn btn-info text-white btn-add-favorite" data-id="${item.id}">+</button>
              </div>
          </div>
        </div>
      </div >`
  })
  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {
  //無條件進位
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page = "${page}">${page}</a></li>`
  }

  paginator.innerHTML = rawHTML
}

function getMoviesByPage(page) {

  const data = filteredMovies.length ? filteredMovies : movies //如果搜尋結果大於0 就取filteredMovies；等於0則取movies

  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`
  })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

// 不使用匿名函式，有助於抓錯
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  // A = <a></a>

  const page = Number(event.target.dataset.page) //綁在dataset的資料都是字串
  renderMovieList(getMoviesByPage(page))
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  // if (!keyword.length) {
  //   return alert('請輸入有效字串！')
  // }
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )
  //錯誤處理：無符合條件的結果
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }

  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1)) //先顯示第一頁搜尋結果
})

axios
  .get(INDEX_URL)
  .then((response) => {
    // Array(80)
    movies.push(...response.data.results) //展開運算子
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1)) //網頁呼叫時載入第一頁
  })
  .catch((error) => console.log(error))
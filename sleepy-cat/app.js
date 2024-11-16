const img = document.getElementById("img")
const caption = document.getElementById("caption")
const select = document.getElementById("select")

const BASE_URL = '/.netlify/images?url=/sleepy-cats.webp'

const getTransformationParms = (size, cat)=> {
  if (cat === 'both') {
    if (size === 'small') return '&w=250&h=250'
    if (size === 'medium') return '&w=500&h=500'
    if (size === 'large') return '&w=800&h=800'
  }
  if (cat === 'white') {
    if (size === 'small') return '&w=250&h=500&fit=cover&position=left'
    if (size === 'medium') return '&w=375&h=750&fit=cover&position=left'
    if (size === 'large') return '&w=500&h=1000&fit=cover&position=left'
  }
  if (cat === 'black') {
    if (size === 'small') return '&w=250&h=500&fit=cover&position=right'
    if (size === 'medium') return '&w=375&h=750&fit=cover&position=right'
    if (size === 'large') return '&w=500&h=1000&fit=cover&position=right'
  }
  return '&w=400&h=400'
}

const changeImageSize = ()=> {
  const size = img.dataset.size
  if (size === 'small') img.dataset.size = 'medium'
  else if (size === 'medium') img.dataset.size = 'large'
  else img.dataset.size = 'small'
}

const changeCatType = ()=> {
  const type = select.dataset.cat
  if (type === 'both') select.dataset.cat = 'white'
  else if (type === 'white') select.dataset.cat = 'black'
  else select.dataset.cat = 'both'
}

const updateImageSource = (url) => {
  img.src = url
}

const updateCaption = (message) => {
  caption.textContent = message
}

const getImageSizeInfo = ()=> {
  return fetch(img.src)
    .then(response => {
      const size = response.headers.get("Content-Length")
      if (size) {
        const sizeKB = (size / 1024).toFixed(2) // Convert bytes to KB
        return `Image size: ${sizeKB} KB`
      } else {
        return "Image size: N/A"
      }
    })
    .catch(() => {
      return "Error fetching the image size."
    })
}

const getImageSource = ()=> {
  const size = img.dataset.size
  const cat = select.dataset.cat
  const transformation = getTransformationParms(size, cat)
  return Promise.resolve(`${BASE_URL}${transformation}`)
}

const syncImage = async ()=> {
  await getImageSource().then(updateImageSource)
  await getImageSizeInfo().then(updateCaption)
}

img.addEventListener("click", () => {
  changeImageSize()
  syncImage()
})

select.addEventListener("click", () => {
  changeCatType()
  syncImage()
})

// Document is ready
syncImage()

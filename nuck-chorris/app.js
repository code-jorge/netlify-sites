const DURATION = 12 * 1000 // 12 seconds

const fetchQuote = ()=> {
  fetch('https://api.chucknorris.io/jokes/random?category=dev')
    .then(response => response.json())
    .then(({ value }) => {
      const quote = value
        .replaceAll('Chuck', 'Nuck')
        .replaceAll('CHUCK', 'NUCK')
        .replaceAll('chuck', 'nuck')
        .replaceAll('Norris', 'Chorris')
        .replaceAll('NORRIS', 'CHORRIS')  
        .replaceAll('norris', 'chorris')
      document.querySelector('.quote').textContent = quote
    })
    .finally(animateCircle)
}

const animateCircle = ()=> {
  const start = Date.now()
  const timer = setInterval(()=> {
    const timePassed = Date.now() - start
    const progress = timePassed / DURATION * 100
    // Determine fragment & fragment progress
    const fragment = Math.floor(progress / 12.5)
    const leftover = 50 * (progress % 12.5) / 12.5
    // How it starts
    let polygon = `50% 50%, 50% 0%`
    // Append each fragment
    if (fragment < 1) polygon += `, ${50 + leftover}% 0%`
    else if (fragment < 2) polygon += `, 100% 0%, 100% ${0 + leftover}%`
    else if (fragment < 3) polygon += `, 100% 0%, 100% 50%, 100% ${50 + leftover}%`
    else if (fragment < 4) polygon += `, 100% 0%, 100% 100%, ${100 - leftover}% 100%`
    else if (fragment < 5) polygon += `, 100% 0%, 100% 100%, ${50 - leftover}% 100%`
    else if (fragment < 6) polygon += `, 100% 0%, 100% 100%, 0% 100%, 0% ${100 - leftover}%`
    else if (fragment < 7) polygon += `, 100% 0%, 100% 100%, 0% 100%, 0% ${50 - leftover}%`
    else if (fragment < 8) polygon += `, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${0 + leftover}% 0%`
    else if (fragment >= 8) polygon += `, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%`
    // Wrap the polygon
    polygon += `, 50% 50%`

    
    // Set the polygon
    document.querySelector('.mask').style.clipPath = `polygon(${polygon})`

    if (timePassed >= DURATION) clearInterval(timer)
  }, 25)

  setTimeout(fetchQuote, DURATION)
}

fetchQuote()

const $ = el=> document.querySelector(el);

// Stage 1: Listen to the start button
$('#button').addEventListener('click', ()=> {
  $("body").setAttribute("data-stage", "2");
  // Stage 2: Start the countdown
  var count = 10;
  $('#count').innerHTML = count;
  var interval = setInterval(()=> {
    count--;
    $('#count').innerHTML = count;
    if (count === 0) {
      clearInterval(interval);
      $("body").setAttribute("data-stage", "3");
    }
  }, 1000);
});
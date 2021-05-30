
window.addEventListener('load', function() {
    minutes_left = 100;
    seconds_left = minutes_left * 60;

    var x = setInterval(function() {

        var hours = Math.floor((seconds_left/3600));
        var minutes = Math.floor((seconds_left/60)%60);
        var seconds = Math.floor(seconds_left % 60);
      
        document.getElementById("quiz-timer").innerHTML =  hours + "h "
        + minutes + "m " + seconds + "s ";
      
        seconds_left = seconds_left - 1; 
      
        if (seconds_left < 0) {
          clearInterval(x);
          document.forms["submit-form"].submit();
        }
      }, 1000);
})

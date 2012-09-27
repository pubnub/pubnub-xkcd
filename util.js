// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
	  window.webkitRequestAnimationFrame || 
	  window.mozRequestAnimationFrame    || 
	  window.oRequestAnimationFrame      || 
	  window.msRequestAnimationFrame     || 
	  function( callback ){
	    window.setTimeout(callback, 1000 / 60);
	  };
})();


var loadImage = function(src, callback) {
  var img = document.createElement('img');
  img.crossOrigin = '';
  img.src = src;
  if (typeof callback !== "undefined") {
    img.onload = callback;
  }
  return img;
};


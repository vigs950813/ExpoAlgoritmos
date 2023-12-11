

function setOpacity() {
  const textoAnimado1 = document.querySelector('.centerColText1');
  const textoAnimado2 = document.querySelector('.centerColText2');
  const textoAnimado3 = document.querySelector('.centerColText3');
  const imagen1 = document.getElementById('logoBlancoEscom');
  const imagen2 = document.getElementById('logoBlancoIPN');

  gsap.to(textoAnimado1,{
    duration: 2,
    opacity: 1,
  });

  gsap.to(textoAnimado2,{
    duration: 3,
    opacity: 1,
  });

  gsap.to(textoAnimado3,{
    duration: 4,
    opacity: 1,
  });

  gsap.to(imagen1,{
    duration: 5,
    opacity: 1,
  });

  gsap.to(imagen2,{
    duration: 3,
    opacity: 1,
  });
}


// Llamar a la función cuando la ventana se cargue completamente
window.onload = function () {
  setOpacity();
};

/* 
  IMPORTANTE:  Para que la animación del cambio de opacidad de 0% a 100%
               funcione correctamente, primero se setea la opacidad de cada
               imagen a 0% en el archivo header.css, ya que, al cargar
               cada imagen, se inicia con ese parámetro y finalmente, la función
               de cambiar opacidad se ejecuta después de que se carguen las
               imágenes
*/

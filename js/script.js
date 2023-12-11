// Selecciona el círculo
const circle = document.getElementById('circle');

// Utiliza GSAP para animar el cambio de tamaño del círculo
gsap.to(circle, {
  duration: 2, // Duración de la animación en segundos
  scaleX: 2,   // Cambio de escala horizontal
  scaleY: 2,   // Cambio de escala vertical
  ease: 'power2.inOut' // Tipo de easing para la animación
});

/*
    Script que permite desplegar la lista del botón sin necesidad de dar clic.
*/



document.addEventListener('DOMContentLoaded', function () {
    const dropdown = document.querySelector('.dropdown');//     Se obtiene la clase dropdown para asignarla a la variable.

    //Al pasar el cursor sobre el botón del dropdown, mostrar la lista desplegable
    dropdown.addEventListener('mouseenter', function () {//     mouseenter para detectar el evento cuando el cursor del mouse pasa sobre el botón.
        this.querySelector('.dropdown-menu').classList.add('show');//       Al detectar el cursor, se despliega la lista a través de la propiedad show para lla clase dropdown-menu.
    });

    // Al salir del área de la lista desplegable, ocultarla
    dropdown.addEventListener('mouseleave', function (event) {//    mouseleave para detectar cuando el cursor del mouse sale de la zona que especificaremos en la función.
        // Verificar si el cursor no está sobre la lista desplegable
        if (!event.relatedTarget || !event.relatedTarget.closest('.dropdown-menu')) {//     Se revisan dos casos, cuando el cursor no se halla dentro de la zona con relatedTarget, o cuando si el cursor se halla en algún elemento del menú desplegable con el método closest.
            this.querySelector('.dropdown-menu').classList.remove('show');//    Si las condiciones cumplen con el hecho de que el cursorno se halla apuntando a algún elemento del menú desplegable o fuera de la zona, entonces el botón regresa a su estado original.
        }
    });
});
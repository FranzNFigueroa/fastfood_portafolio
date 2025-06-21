window.addEventListener('DOMContentLoaded', () => {
  const selectBebida = document.getElementById('bebidaSelect');
  const contenedorNueva = document.getElementById('nuevaBebidaContainer');
  const inputNueva = document.getElementById('nuevaBebida');
  const contenedorFormato = document.getElementById('formatoContainer');

  if (!selectBebida || !contenedorNueva || !inputNueva || !contenedorFormato) {
    // Si alguno de los elementos no está presente (p. ej. en otra vista), salimos
    return;
  }

  // Función que aplica o quita la clase d-none según la selección
  function toggleCamposBebida() {
    const valor = selectBebida.value;

    if (valor === 'otro') {
      // Si elige "Otro": mostrar nueva bebida y formato
      contenedorNueva.classList.remove('d-none');
      inputNueva.setAttribute('required', 'required');
      contenedorFormato.classList.remove('d-none');
    } else if (valor !== '') {
      // Si elige una bebida existente: ocultar sólo nueva bebida, mostrar formato
      contenedorNueva.classList.add('d-none');
      inputNueva.removeAttribute('required');
      inputNueva.value = '';
      contenedorFormato.classList.remove('d-none');
    } else {
      // Si no elige ninguna bebida: ocultar ambos
      contenedorNueva.classList.add('d-none');
      inputNueva.removeAttribute('required');
      inputNueva.value = '';
      contenedorFormato.classList.add('d-none');
    }
  }

  // Llamar una vez al cargar para reflejar correctamente el estado actual (p. ej. en "editar")
  toggleCamposBebida();

  // Escuchar cambios en el select de bebidas
  selectBebida.addEventListener('change', toggleCamposBebida);
});

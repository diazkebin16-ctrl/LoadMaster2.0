(function(){
  const launch=()=>{
    if(typeof window.newOrderDialog==='function'){
      window.newOrderDialog();
      return;
    }
    console.error('No se encontró newOrderDialog().');
    alert('No se pudo abrir el módulo de Agregar orden. Revisa la consola.');
  };
  document.getElementById('openOrderModule')?.addEventListener('click', launch);
  // Abrir automáticamente al iniciar Live Server.
  window.addEventListener('load',()=>setTimeout(launch,60));
})();

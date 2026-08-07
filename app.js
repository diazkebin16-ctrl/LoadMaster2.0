const STORAGE='palletOpsPrototypeV05';
const LM_HANDOFF='palletOpsLoadmasterHandoff';
const initialState={
  settings:{historyDays:60},
  lumber:[
    {id:'L8',size:'2×4 × 8 ft',qty:1240,reserved:310,min:400},
    {id:'L10',size:'2×4 × 10 ft',qty:680,reserved:180,min:250},
    {id:'L12',size:'2×4 × 12 ft',qty:420,reserved:265,min:250},
    {id:'L16',size:'2×4 × 16 ft',qty:195,reserved:90,min:150}
  ],
  orders:[
    {id:'22421',customer:'Warehouse One',product:'40×48',qty:220,due:'Mañana',shipping:'factory',stage:'waiting_material',wood:'L12',woodNeed:190,palletSku:'40×48 STD',notes:'Orden de ejemplo bloqueada por material.'},
    {id:'22418',customer:'Auto Parts Midwest',product:'42×48',qty:140,due:'Hoy',shipping:'factory',stage:'cutting',wood:'L10',woodNeed:120,palletSku:'42×48 HD',notes:'Corte iniciado.'},
    {id:'22415',customer:'Industrial Parts LLC',product:'48×48',qty:95,due:'Hoy',shipping:'pickup',stage:'material_ready',wood:'L8',woodNeed:80,palletSku:'48×48 STD',notes:'Material cortado y listo para fabricar.'},
    {id:'22395',customer:'Cummins Inc.',product:'Carga mixta',qty:286,due:'Hoy',shipping:'factory',stage:'ready_load',wood:'L8',woodNeed:0,palletSku:'MIX-22395',trailer:"53'",trailerWidth:96,trailerLength:628,notes:'Listo para optimizar carga.',loadItems:[
      {name:'145×26',length:145,width:26,quantity:35,maxHeight:10,canRotate:false},
      {name:'120×24',length:120,width:24,quantity:15,maxHeight:10,canRotate:false},
      {name:'102×24',length:102,width:24,quantity:20,maxHeight:10,canRotate:false},
      {name:'86×24',length:86,width:24,quantity:20,maxHeight:10,canRotate:true},
      {name:'72×24',length:72,width:24,quantity:20,maxHeight:10,canRotate:true},
      {name:'52×52',length:52,width:52,quantity:50,maxHeight:13,canRotate:false},
      {name:'40×40',length:40,width:40,quantity:50,maxHeight:13,canRotate:false},
      {name:'48×40',length:48,width:40,quantity:2,maxHeight:1,canRotate:true},
      {name:'27×27',length:27,width:27,quantity:74,maxHeight:13,canRotate:false}
    ]},
    {id:'22402',customer:'DHL Supply Chain',product:'40×48',qty:168,due:'Hoy',shipping:'pickup',stage:'ready_load',wood:'L8',woodNeed:0,palletSku:'40×48 STD',trailer:'Cliente trae tráiler',trailerWidth:96,trailerLength:628,notes:'Cliente recogerá con su propio tráiler.',loadItems:[{name:'40×48',length:40,width:48,quantity:168,maxHeight:13,canRotate:true}]},
    {id:'22381',customer:'ABC Manufacturing',product:'42×48',qty:212,due:'Hoy',shipping:'factory',stage:'transit',wood:'L8',woodNeed:0,palletSku:'42×48 HD',trailer:"53'",notes:'Chofer en tránsito.'}
  ],
  finished:[
    {sku:'48×48 STD',qty:318,reserved:95},
    {sku:'40×48 STD',qty:460,reserved:168},
    {sku:'42×48 HD',qty:175,reserved:140},
    {sku:'48×40 STD',qty:286,reserved:286}
  ],
  history:[
    {id:'22310',customer:'Midwest Logistics',shipping:'pickup',completed:'05 Ago',evidence:'Firma + foto de factura'},
    {id:'22288',customer:'Supplier X',shipping:'factory',completed:'03 Ago',evidence:'Firma de entrega'}
  ],
  notifications:[
    {id:1,text:'Orden #22415: material listo para fabricación.',kind:'ok'},
    {id:2,text:'2×4 × 12 ft cerca del mínimo disponible.',kind:'warn'}
  ]
};
let state=loadState();
let currentView=(location.hash||'').replace('#','')||'inicio';
const views={
  inicio:['Centro de control','Resumen de toda la operación y flujo entre etapas.'],
  madera:['Inventario de madera','Existencias, reservas, recepción y material realmente disponible.'],
  produccion:['Producción / Corte','Planifica, reserva madera, inicia cortes y libera material a fabricación.'],
  fabricacion:['Fabricación de pallets','Recibe material listo, inicia ensamblaje y libera pallets a carga.'],
  terminados:['Inventario de pallets terminados','Existencia fabricada, reservas y disponibilidad para órdenes.'],
  carga:['Carga y despacho','Órdenes listas, LoadMaster AI, recogida del cliente, evidencia y despacho.'],
  reportes:['Reportes y productividad','Indicadores de producción, inventario y despacho.'],
  historial:['Historial','Órdenes completadas y política de retención configurable.']
};
const el={content:document.getElementById('content'),title:document.getElementById('viewTitle'),subtitle:document.getElementById('viewSubtitle'),dialog:document.getElementById('dialog'),dialogTitle:document.getElementById('dialogTitle'),dialogSubtitle:document.getElementById('dialogSubtitle'),dialogBody:document.getElementById('dialogBody')};
function loadState(){try{return JSON.parse(localStorage.getItem(STORAGE))||structuredClone(initialState)}catch{return structuredClone(initialState)}}
function save(){localStorage.setItem(STORAGE,JSON.stringify(state))}
function clone(x){return JSON.parse(JSON.stringify(x))}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)}
function metric(label,value,hint){return `<div class="metric"><div class="label">${label}</div><div class="value">${value}</div><div class="hint">${hint}</div></div>`}
function pill(text,color='gray'){return `<span class="pill ${color}">${text}</span>`}
function stageLabel(s){return ({waiting_material:'Esperando material',cutting:'En corte',material_ready:'Material listo',building:'En fabricación',ready_load:'Listo para cargar',loading:'Cargando',transit:'En tránsito',completed:'Completado'})[s]||s}
function stageColor(s){return ({waiting_material:'red',cutting:'yellow',material_ready:'blue',building:'purple',ready_load:'green',loading:'yellow',transit:'pink',completed:'gray'})[s]||'gray'}
function progressFor(s){const seq=['waiting_material','cutting','material_ready','building','ready_load','transit'];let n=seq.indexOf(s)+1;if(s==='loading')n=5;if(s==='completed')n=6;return `<div class="progress-line">${[1,2,3,4,5,6].map(i=>`<span class="${i<=n?'done':''}"></span>`).join('')}</div>`}
function moduleCard(view,icon,name,desc){return `<article class="card module-card" data-go="${view}"><div class="icon">${icon}</div><h3>${name}</h3><p>${desc}</p></article>`}
function orderById(id){return state.orders.find(o=>o.id===id)}
function lumberById(id){return state.lumber.find(x=>x.id===id)}
function addNote(text,kind='ok'){state.notifications.unshift({id:Date.now(),text,kind});state.notifications=state.notifications.slice(0,8);save()}
function reserveWood(order){const wood=lumberById(order.wood);if(!wood)return false;const available=wood.qty-wood.reserved;if(available<order.woodNeed)return false;wood.reserved+=order.woodNeed;save();return true}
function consumeReservedWood(order){const wood=lumberById(order.wood);if(!wood)return;wood.qty=Math.max(0,wood.qty-order.woodNeed);wood.reserved=Math.max(0,wood.reserved-order.woodNeed);save()}
function findFinished(sku){let f=state.finished.find(x=>x.sku===sku);if(!f){f={sku,qty:0,reserved:0};state.finished.push(f)}return f}
function parseProductMeasure(text){
  const m=String(text||'').match(/(\d+(?:\.\d+)?)\s*[×xX]\s*(\d+(?:\.\d+)?)/);
  return m?{length:Number(m[1]),width:Number(m[2])}:null;
}
function loadItemsFor(order){
  if(Array.isArray(order.loadItems)&&order.loadItems.length)return clone(order.loadItems);
  const m=parseProductMeasure(order.product);
  if(!m)return [];
  return [{name:`${m.length}×${m.width}`,length:m.length,width:m.width,quantity:Number(order.qty)||1,maxHeight:13,canRotate:true}];
}
function loadTotal(items){return (items||[]).reduce((n,x)=>n+(Number(x.quantity)||0),0)}

function renderInicio(){
  const active=state.orders.filter(o=>o.stage!=='completed').length, ready=state.orders.filter(o=>o.stage==='ready_load').length, prod=state.orders.filter(o=>['waiting_material','cutting','material_ready','building'].includes(o.stage)).length, low=state.lumber.filter(x=>x.qty-x.reserved<x.min).length;
  return `<div class="grid metrics">${metric('Órdenes activas',active,'En toda la operación')}${metric('Listas para cargar',ready,'Ya fabricadas y liberadas')}${metric('Producción en curso',prod,'Corte + fabricación')}${metric('Alertas de madera',low,'Debajo del mínimo disponible')}</div>
  <div class="section"><div class="section-head"><div><h2>Módulos</h2><p>Todos comparten las mismas órdenes; el prototipo permite moverlas por etapas.</p></div></div><div class="grid module-grid">${moduleCard('madera','▦','Inventario de madera','Recibir material, ver reservas y disponibilidad.')}${moduleCard('produccion','✂','Producción / Corte','Reservar madera, iniciar corte y liberar material.')}${moduleCard('fabricacion','⚒','Fabricación','Recibir aviso, armar pallets y liberarlos.')}${moduleCard('terminados','▣','Inventario de pallets','Producto terminado y reservado.')}${moduleCard('carga','▰','Carga y despacho','Optimizar, cargar, evidencia, firma y salida.')}${moduleCard('reportes','▥','Reportes','Resumen operativo sin crear menús innecesarios.')}</div></div>
  <div class="section grid two-col"><div class="card"><div class="section-head"><div><h2>Flujo real de una orden</h2><p>Cada botón mueve la misma orden al siguiente módulo.</p></div></div><div class="timeline"><span class="node">Inventario</span><span class="arrow">→</span><span class="node">Corte</span><span class="arrow">→</span><span class="node">Material listo</span><span class="arrow">→</span><span class="node">Fabricación</span><span class="arrow">→</span><span class="node">Carga</span><span class="arrow">→</span><span class="node">Historial</span></div><div style="height:14px"></div><button class="btn" data-go="produccion">Probar flujo por etapas</button></div><div class="card"><h2 style="font-size:17px;margin-top:0">Avisos automáticos</h2>${state.notifications.slice(0,4).map(n=>`<div class="notification ${n.kind==='ok'?'ok':''}" style="margin-bottom:8px">${n.text}</div>`).join('')||'<div class="small">Sin avisos.</div>'}</div></div>`
}
function renderMadera(){return `<div class="toolbar"><button class="btn" data-action="receiveWood">+ Recibir madera</button><button class="btn secondary" data-action="physicalCount">Conteo físico</button></div><div class="table-wrap"><table><thead><tr><th>Medida</th><th>Existencia</th><th>Reservado</th><th>Disponible</th><th>Mínimo</th><th>Estado</th></tr></thead><tbody>${state.lumber.map(x=>{const a=x.qty-x.reserved;return `<tr><td><b>${x.size}</b></td><td>${x.qty}</td><td>${x.reserved}</td><td>${a}</td><td>${x.min}</td><td>${a<x.min?pill('Bajo','yellow'):pill('Bien','green')}</td></tr>`}).join('')}</tbody></table></div><div class="section notification info"><b>Función de esta etapa:</b> Producción solo puede reservar madera que realmente esté disponible. Si no alcanza, la orden queda bloqueada y muestra qué medida falta.</div>`}
function renderProduccion(){const rows=state.orders.filter(o=>['waiting_material','cutting','material_ready'].includes(o.stage));return `<div class="toolbar"><button class="btn" data-action="newOrder">+ Nueva orden</button><button class="btn secondary" data-action="autoPlan">Planificar materiales</button></div><div class="table-wrap"><table><thead><tr><th>Orden</th><th>Cliente</th><th>Producto</th><th>Cantidad</th><th>Etapa</th><th>Madera</th><th>Acción</th></tr></thead><tbody>${rows.map(o=>{const wood=lumberById(o.wood);const av=wood?wood.qty-wood.reserved:0;let action=o.stage==='waiting_material'?`<button class="btn" data-cut-start="${o.id}">Reservar e iniciar corte</button>`:o.stage==='cutting'?`<button class="btn" data-cut-ready="${o.id}">Material listo</button>`:`<span class="small">Esperando fabricación</span>`;return `<tr><td>#${o.id}</td><td>${o.customer}</td><td>${o.product}</td><td>${o.qty}</td><td>${pill(stageLabel(o.stage),stageColor(o.stage))}</td><td>${wood?wood.size:'—'}<div class="small">Necesita ${o.woodNeed||0} · Disponible ${av}</div></td><td>${action}</td></tr>`}).join('')||'<tr><td colspan="7">No hay órdenes en esta etapa.</td></tr>'}</tbody></table></div><div class="section card"><b>Qué prueba este prototipo</b><p class="small">Al iniciar corte, la madera se reserva. Al marcar “Material listo”, se consume la reserva y la orden aparece automáticamente en Fabricación junto con un aviso.</p></div>`}
function renderFabricacion(){const rows=state.orders.filter(o=>['material_ready','building'].includes(o.stage));return `<div class="grid metrics">${metric('Material listo',rows.filter(o=>o.stage==='material_ready').length,'Puede recogerlo el armador')}${metric('En fabricación',rows.filter(o=>o.stage==='building').length,'Trabajo activo')}${metric('Listas para carga',state.orders.filter(o=>o.stage==='ready_load').length,'Ya fabricadas')}${metric('Avisos',state.notifications.length,'Eventos recientes')}</div><div class="section table-wrap"><table><thead><tr><th>Orden</th><th>Cliente</th><th>Producto</th><th>Cantidad</th><th>Estado</th><th>Acción</th></tr></thead><tbody>${rows.map(o=>`<tr><td>#${o.id}</td><td>${o.customer}</td><td>${o.product}</td><td>${o.qty}</td><td>${pill(stageLabel(o.stage),stageColor(o.stage))}</td><td>${o.stage==='material_ready'?`<button class="btn" data-build-start="${o.id}">Iniciar fabricación</button>`:`<button class="btn" data-build-ready="${o.id}">Terminar y liberar</button>`}</td></tr>`).join('')||'<tr><td colspan="6">No hay órdenes en fabricación.</td></tr>'}</tbody></table></div><div class="section notification ok"><b>Aviso automático:</b> cuando Corte libera material, Fabricación lo ve aquí sin que nadie tenga que ir a avisar personalmente.</div>`}
function renderTerminados(){const total=state.finished.reduce((s,x)=>s+x.qty,0),res=state.finished.reduce((s,x)=>s+x.reserved,0);return `<div class="grid metrics">${metric('Fabricados',total,'Inventario actual')}${metric('Reservados',res,'Asignados a órdenes')}${metric('Disponibles',total-res,'Sin reservar')}${metric('Listos para carga',state.orders.filter(o=>o.stage==='ready_load').reduce((s,o)=>s+o.qty,0),'Pallets liberados')}</div><div class="section table-wrap"><table><thead><tr><th>SKU</th><th>Existencia</th><th>Reservado</th><th>Disponible</th></tr></thead><tbody>${state.finished.map(x=>`<tr><td><b>${x.sku}</b></td><td>${x.qty}</td><td>${x.reserved}</td><td>${x.qty-x.reserved}</td></tr>`).join('')}</tbody></table></div>`}
function shipPill(o){if(o.shipping==='pickup')return pill('Recogida del cliente','blue');if(o.stage==='transit')return pill('En tránsito','pink');return pill('Envío de fábrica','yellow')}
function renderCarga(){const rows=state.orders.filter(o=>['ready_load','loading','transit'].includes(o.stage));return `<div class="toolbar"><button class="btn secondary" id="openLoadMaster">Abrir LoadMaster AI</button><select><option>Todos</option><option>Envío de fábrica</option><option>Recogida del cliente</option><option>En tránsito</option></select></div><div class="grid two-col"><div><h2 style="font-size:16px">Pedidos activos</h2>${rows.map(o=>`<div class="card order-card"><div class="order-card-top"><div>${shipPill(o)}<h3 style="margin:9px 0 3px">${o.customer}</h3><div class="small">Pedido #${o.id} · ${o.qty} pallets · ${o.product}</div>${progressFor(o.stage)}</div><div style="text-align:right"><div class="small">Estado</div><b>${stageLabel(o.stage)}</b><div style="height:8px"></div>${o.stage==='ready_load'?`<button class="btn" data-load-order="${o.id}">${o.shipping==='pickup'?'Iniciar recogida':'Optimizar / iniciar carga'}</button>`:o.stage==='loading'?`<button class="btn" data-load-order="${o.id}">Continuar carga</button>`:`<button class="btn" data-transit-done="${o.id}">Marcar entregado</button>`}</div></div></div>`).join('')||'<div class="empty-state">No hay pedidos listos para carga.</div>'}</div><aside><div class="card"><h2 style="font-size:16px;margin-top:0">Colores de despacho</h2><div>${pill('Envío de fábrica','yellow')}<div class="small" style="margin:5px 4px 12px">La fábrica pone tráiler y chofer.</div>${pill('Recogida del cliente','blue')}<div class="small" style="margin:5px 4px 12px">El cliente llega con su propio tráiler.</div>${pill('En tránsito','pink')}<div class="small" style="margin:5px 4px">El chofer de la fábrica va camino al cliente.</div></div></div><div class="card" style="margin-top:12px"><b>Evidencia</b><p class="small">La foto se conserva como función opcional, especialmente para fotografiar la factura firmada. La firma también forma parte del cierre.</p></div></aside></div>`}
function renderReportes(){const completed=state.history.length;return `<div class="grid metrics">${metric('Órdenes activas',state.orders.filter(o=>o.stage!=='completed').length,'Operación actual')}${metric('Pallets terminados',state.finished.reduce((s,x)=>s+x.qty,0),'Inventario')}${metric('Despachos históricos',completed,'En este demo')}${metric('Retención',state.settings.historyDays+' días','Configurable')}</div><div class="section grid two-col"><div class="card"><h2 style="font-size:16px;margin-top:0">Resumen por etapa</h2><div class="status-list">${['waiting_material','cutting','material_ready','building','ready_load','transit'].map(s=>`<div class="status-row"><span class="dot"></span><div>${stageLabel(s)}</div><b>${state.orders.filter(o=>o.stage===s).length}</b></div>`).join('')}</div></div><div class="card"><h2 style="font-size:16px;margin-top:0">Idea de producción sumario</h2><p class="small">Este módulo concentra la información de productividad sin obligar a crear un menú separado para cada reporte.</p></div></div>`}
function renderHistorial(){return `<div class="toolbar"><label class="small">Retención <select id="historyDays"><option value="30" ${state.settings.historyDays===30?'selected':''}>30 días</option><option value="60" ${state.settings.historyDays===60?'selected':''}>60 días</option><option value="90" ${state.settings.historyDays===90?'selected':''}>90 días</option></select></label></div><div class="table-wrap"><table><thead><tr><th>Pedido</th><th>Cliente</th><th>Tipo</th><th>Completado</th><th>Evidencia</th></tr></thead><tbody>${state.history.map(h=>`<tr><td>#${h.id}</td><td>${h.customer}</td><td>${h.shipping==='pickup'?'Recogida cliente':'Envío fábrica'}</td><td>${h.completed}</td><td>${h.evidence}</td></tr>`).join('')||'<tr><td colspan="5">Sin historial.</td></tr>'}</tbody></table></div><div class="section notification">El prototipo guarda el historial en el navegador. En la plataforma real, la retención podrá archivar o purgar automáticamente según la política que se decida.</div>`}
function render(){const [t,s]=views[currentView];el.title.textContent=t;el.subtitle.textContent=s;el.content.innerHTML=({inicio:renderInicio,madera:renderMadera,produccion:renderProduccion,fabricacion:renderFabricacion,terminados:renderTerminados,carga:renderCarga,reportes:renderReportes,historial:renderHistorial})[currentView]();bindDynamic()}
function navigate(v){currentView=v;document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===v));document.getElementById('sidebar').classList.remove('open');render()}
function openDialog(title,subtitle,body){el.dialogTitle.textContent=title;el.dialogSubtitle.textContent=subtitle||'';el.dialogBody.innerHTML=body;el.dialog.showModal()}
function closeDialog(){el.dialog.close()}
function bindDynamic(){
  document.querySelectorAll('[data-go]').forEach(x=>x.onclick=()=>navigate(x.dataset.go));
  document.querySelectorAll('[data-cut-start]').forEach(x=>x.onclick=()=>startCut(x.dataset.cutStart));
  document.querySelectorAll('[data-cut-ready]').forEach(x=>x.onclick=()=>finishCut(x.dataset.cutReady));
  document.querySelectorAll('[data-build-start]').forEach(x=>x.onclick=()=>startBuild(x.dataset.buildStart));
  document.querySelectorAll('[data-build-ready]').forEach(x=>x.onclick=()=>finishBuild(x.dataset.buildReady));
  document.querySelectorAll('[data-load-order]').forEach(x=>x.onclick=()=>openLoadOrder(x.dataset.loadOrder));
  document.querySelectorAll('[data-transit-done]').forEach(x=>x.onclick=()=>completeDelivery(x.dataset.transitDone));
  document.getElementById('openLoadMaster')?.addEventListener('click',openLoadMaster);
  document.querySelector('[data-action="receiveWood"]')?.addEventListener('click',receiveWoodDialog);
  document.querySelector('[data-action="physicalCount"]')?.addEventListener('click',()=>toast('Prototipo: aquí se capturaría un conteo físico.'));
  document.querySelector('[data-action="newOrder"]')?.addEventListener('click',newOrderDialog);
  document.querySelector('[data-action="autoPlan"]')?.addEventListener('click',()=>toast('Planificador demo: revisó inventario disponible y órdenes bloqueadas.'));
  document.getElementById('historyDays')?.addEventListener('change',e=>{state.settings.historyDays=Number(e.target.value);save();toast('Retención actualizada a '+e.target.value+' días.')});
}
function receiveWoodDialog(){openDialog('Recibir madera','Entrada de materia prima',`<div class="form-grid"><label><span>Medida</span><select id="rwSize">${state.lumber.map(x=>`<option value="${x.id}">${x.size}</option>`).join('')}</select></label><label><span>Cantidad de piezas</span><input id="rwQty" type="number" min="1" value="100"></label></div><div class="dialog-actions"><button type="button" class="btn secondary" id="rwCancel">Cancelar</button><button type="button" class="btn" id="rwSave">Recibir</button></div>`);document.getElementById('rwCancel').onclick=closeDialog;document.getElementById('rwSave').onclick=()=>{const l=lumberById(document.getElementById('rwSize').value);l.qty+=Number(document.getElementById('rwQty').value)||0;save();closeDialog();toast('Madera recibida y disponible.');render()}}
function newOrderDialog(){openDialog('Nueva orden','Ejemplo de cómo una orden entra al flujo',`<div class="form-grid"><label><span>Cliente</span><input id="noCustomer" value="Cliente Demo"></label><label><span>Producto / pallet</span><input id="noProduct" value="48×48"></label><label><span>Cantidad</span><input id="noQty" type="number" value="50"></label><label><span>Tipo de entrega</span><select id="noShip"><option value="pickup">Recogida del cliente</option><option value="factory">Envío de fábrica</option></select></label><label><span>Madera base</span><select id="noWood">${state.lumber.map(x=>`<option value="${x.id}">${x.size}</option>`).join('')}</select></label><label><span>Piezas madre estimadas</span><input id="noNeed" type="number" value="40"></label><label class="wide"><span>Notas</span><textarea id="noNotes">Prototipo de orden nueva.</textarea></label></div><div class="dialog-actions"><button type="button" class="btn secondary" id="noCancel">Cancelar</button><button type="button" class="btn" id="noSave">Crear orden</button></div>`);document.getElementById('noCancel').onclick=closeDialog;document.getElementById('noSave').onclick=()=>{const id=String(Math.floor(22500+Math.random()*400));state.orders.unshift({id,customer:document.getElementById('noCustomer').value,product:document.getElementById('noProduct').value,qty:Number(document.getElementById('noQty').value)||1,due:'Nueva',shipping:document.getElementById('noShip').value,stage:'waiting_material',wood:document.getElementById('noWood').value,woodNeed:Number(document.getElementById('noNeed').value)||0,palletSku:document.getElementById('noProduct').value+' STD',notes:document.getElementById('noNotes').value});save();closeDialog();toast('Orden #'+id+' creada → Producción.');render()}}
function startCut(id){const o=orderById(id);const w=lumberById(o.wood);const available=w.qty-w.reserved;if(available<o.woodNeed){toast(`No alcanza ${w.size}: disponible ${available}, requiere ${o.woodNeed}.`);return}if(!reserveWood(o)){toast('No se pudo reservar material.');return}o.stage='cutting';addNote(`Orden #${o.id}: madera reservada y corte iniciado.`);save();toast('Corte iniciado; inventario reservado.');render()}
function finishCut(id){const o=orderById(id);consumeReservedWood(o);o.stage='material_ready';addNote(`Orden #${o.id}: material listo. Fabricación ya puede recogerlo.`);save();toast('Material listo → apareció en Fabricación.');render()}
function startBuild(id){const o=orderById(id);o.stage='building';addNote(`Orden #${o.id}: fabricación iniciada.`);save();toast('Fabricación iniciada.');render()}
function finishBuild(id){const o=orderById(id);o.stage='ready_load';const f=findFinished(o.palletSku);f.qty+=o.qty;f.reserved+=o.qty;addNote(`Orden #${o.id}: ${o.qty} pallets terminados → lista para carga.`);save();toast('Fabricación terminada → orden enviada a Carga.');render()}
function openLoadOrder(id){const o=orderById(id);const pickup=o.shipping==='pickup';openDialog(`Pedido #${o.id}`,`${o.customer} · ${pickup?'Recogida del cliente':'Envío de fábrica'}`,`<div class="workflow"><span class="step active">1 Verificar</span><span class="step">2 Optimizar / cargar</span><span class="step">3 Evidencia</span><span class="step">4 Firma</span><span class="step">5 Cerrar</span></div><div class="detail-grid"><div class="detail"><b>Producto</b>${o.product}</div><div class="detail"><b>Cantidad</b>${o.qty} pallets</div><div class="detail"><b>Transporte</b>${pickup?'Cliente trae tráiler':'Fábrica pone chofer y tráiler'}</div><div class="detail"><b>Estado</b>${stageLabel(o.stage)}</div></div><div class="stage-actions"><button type="button" class="btn secondary" id="orderLM">Preparar / optimizar carga</button><button type="button" class="btn" id="markLoading">Marcar cargando</button></div><div class="section evidence"><b>Foto / factura firmada</b><p class="small">La foto es opcional, pero se conserva porque normalmente sirve como evidencia de la factura firmada.</p><input id="evidenceFile" type="file" accept="image/*"><div class="evidence-preview" id="evidencePreview">Sin foto seleccionada.</div></div><div class="section form-grid"><label class="wide"><span>Firma / nombre de quien recibe</span><input id="signatureName" placeholder="Nombre o firma registrada"></label><label class="wide"><span>Notas de carga</span><textarea id="loadNotes">${o.notes||''}</textarea></label></div><div class="dialog-actions"><button type="button" class="btn secondary" id="loadCancel">Cerrar</button><button type="button" class="btn" id="finishDispatch">${pickup?'Completar recogida':'Despachar / en tránsito'}</button></div>`);
  document.getElementById('loadCancel').onclick=closeDialog;document.getElementById('orderLM').onclick=()=>openLoadPreparation(o.id);document.getElementById('markLoading').onclick=()=>{o.stage='loading';save();toast('Pedido marcado como cargando.');};document.getElementById('evidenceFile').onchange=e=>{document.getElementById('evidencePreview').textContent=e.target.files[0]?`Foto seleccionada: ${e.target.files[0].name}`:'Sin foto seleccionada.'};document.getElementById('finishDispatch').onclick=()=>{const sig=document.getElementById('signatureName').value.trim();const hasPhoto=Boolean(document.getElementById('evidenceFile').files[0]);o.notes=document.getElementById('loadNotes').value;if(pickup){completeOrder(o,`${sig?'Firma':'Sin firma'}${hasPhoto?' + foto factura':''}`)}else{o.stage='transit';o.evidence=`${sig?'Firma salida':'Sin firma salida'}${hasPhoto?' + foto':''}`;addNote(`Orden #${o.id}: salió de fábrica y está en tránsito.`);save();closeDialog();toast('Pedido en tránsito.');render()}}
}
function completeDelivery(id){const o=orderById(id);completeOrder(o,(o.evidence||'Salida registrada')+' + entrega confirmada')}
function completeOrder(o,evidence){const f=findFinished(o.palletSku);f.qty=Math.max(0,f.qty-o.qty);f.reserved=Math.max(0,f.reserved-o.qty);state.history.unshift({id:o.id,customer:o.customer,shipping:o.shipping,completed:'Hoy',evidence:evidence||'Registro completado'});state.orders=state.orders.filter(x=>x.id!==o.id);addNote(`Orden #${o.id}: completada y enviada al historial.`);save();closeDialog();toast('Orden completada → Historial.');render()}
function openLoadPreparation(id){
  const o=orderById(id);if(!o)return;
  const items=loadItemsFor(o);
  if(!items.length){toast('Esta orden no tiene medidas válidas para LoadMaster.');return}
  const rows=items.map((x,i)=>`<tr data-prep-row="${i}"><td><b>${x.name||`${x.length}×${x.width}`}</b><div class="small">${x.length} × ${x.width} in</div></td><td><input class="qty-locked" type="number" value="${Number(x.quantity)||1}" readonly aria-label="Cantidad bloqueada"></td><td><input data-prep-height type="number" min="1" value="${Math.max(1,Number(x.maxHeight)||13)}" aria-label="Altura máxima"></td><td class="center"><input data-prep-rotate type="checkbox" ${x.canRotate!==false?'checked':''} aria-label="Se puede girar"></td></tr>`).join('');
  openDialog(`Preparar carga #${o.id}`,`${o.customer} · ${loadTotal(items)} pallets enviados automáticamente desde la orden`,
  `<div class="notification info"><b>Datos conectados.</b> Las medidas y cantidades vienen de la orden y no necesitas volver a escribirlas. Antes de abrir LoadMaster revisa únicamente la altura máxima y si cada medida puede girar.</div>
  <div class="prep-trailer"><label><span>Ancho del tráiler (in)</span><input id="prepTrailerWidth" type="number" min="1" value="${Number(o.trailerWidth)||96}"></label><label><span>Largo del tráiler (in)</span><input id="prepTrailerLength" type="number" min="1" value="${Number(o.trailerLength)||628}"></label></div>
  <div class="table-wrap prep-table"><table><thead><tr><th>Medida</th><th>Cantidad</th><th>Altura máx.</th><th>Girar</th></tr></thead><tbody>${rows}</tbody></table></div>
  <div class="prep-note"><b>${loadTotal(items)} pallets</b> · ${items.length} medida${items.length===1?'':'s'} · cantidad protegida por la orden</div>
  <div class="dialog-actions"><button type="button" class="btn secondary" id="prepCancel">Volver</button><button type="button" class="btn" id="prepLaunch">Abrir LoadMaster a pantalla completa</button></div>`);
  document.getElementById('prepCancel').onclick=()=>{closeDialog();openLoadOrder(id)};
  document.getElementById('prepLaunch').onclick=()=>{
    const prepared=items.map((item,i)=>{const row=document.querySelector(`[data-prep-row="${i}"]`);return {...item,quantity:Number(item.quantity)||1,maxHeight:Math.max(1,Number(row.querySelector('[data-prep-height]').value)||1),canRotate:row.querySelector('[data-prep-rotate]').checked,type:item.type||'4-way'};});
    o.loadItems=clone(prepared);o.trailerWidth=Math.max(1,Number(document.getElementById('prepTrailerWidth').value)||96);o.trailerLength=Math.max(1,Number(document.getElementById('prepTrailerLength').value)||628);save();
    const payload={version:1,source:'Pallet Operations',orderId:o.id,customer:o.customer,shipping:o.shipping,trailer:{width:o.trailerWidth,length:o.trailerLength},items:prepared,returnUrl:'index.html#carga',createdAt:new Date().toISOString()};
    localStorage.setItem(LM_HANDOFF,JSON.stringify(payload));
    window.location.href=`loadmaster.html?platform=1&order=${encodeURIComponent(o.id)}`;
  };
}
function openLoadMaster(){
  const payload={version:1,source:'Pallet Operations',orderId:'manual',customer:'Carga manual',trailer:{width:96,length:628},items:[],returnUrl:'index.html#carga',createdAt:new Date().toISOString()};
  localStorage.setItem(LM_HANDOFF,JSON.stringify(payload));window.location.href='loadmaster.html?platform=1';
}

document.querySelectorAll('.nav-btn').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.view)));
document.getElementById('menuBtn').addEventListener('click',()=>document.getElementById('sidebar').classList.toggle('open'));
document.getElementById('resetDemo').addEventListener('click',()=>{if(confirm('¿Restablecer todos los datos del prototipo?')){state=structuredClone(initialState);save();toast('Demo restablecida.');render()}});
if(!views[currentView])currentView='inicio';
render();

let state={
  inventory:[],bookings:[],expenses:[],expCategories:[],projects:[],
  cotizaciones:[],materials:[],photos:{},repairs:[],
  repPieza:'',repFecha:'',repDesc:'',repCosto:'',repMsg:null,
  tab:'dashboard',
  calMonth:new Date().getMonth(),calYear:new Date().getFullYear(),calSelectedDate:null,
  finGroupBy:'mes',
  bookingItemSel:{},
  invSelType:'letra',invSelValue:'A',invSelKind:'letra',
  bkClient:'',bkTelefono:'',bkTexto:'',bkCorona:false,bkDireccion:'',bkKm:'',
  bkGeoStatus:'idle',bkLugar:'',bkStart:'',bkEnd:'',bkHoraEntrega:'',
  bkHoraRecoleccion:'',bkAnticipo:'',bkMetodo:'',bkNotes:'',bkIncomeOverride:null,bookingMsg:null,editingBookingId:null,
  pjClient:'',pjNombre:'',pjTipo:'Mueble',pjPresupuesto:'',pjAnticipo:'',
  pjMateria:'',pjMano:'',pjStatus:'En espera',pjFechaInicio:'',pjFechaEntrega:'',pjNotas:'',pjMsg:null,
  matNombre:'',matUnidad:'pza',matPrecio:'',matBuscar:'',matImport:'',matMsg:null,
  pjTelefono:'',pjDireccion:'',dashFiltroMetodo:null,bkFiltro:'',
};


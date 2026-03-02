// Districts of Costa Rica organized by Province > Canton > Districts
export interface DistrictData {
  [province: string]: {
    [canton: string]: string[]
  }
}

export const COSTA_RICA_DISTRICTS: DistrictData = {
  'San José': {
    'San José': ['Carmen', 'Merced', 'Hospital', 'Catedral', 'Zapote', 'San Francisco de Dos Rios', 'Uruca', 'Mata Redonda', 'Pavas', 'Hatillo', 'San Sebastian'],
    'Escazu': ['Escazu', 'San Antonio', 'San Rafael'],
    'Desamparados': ['Desamparados', 'San Miguel', 'San Juan de Dios', 'San Rafael Arriba', 'San Antonio', 'Frailes', 'Patarra', 'San Cristobal', 'Rosario', 'Damas', 'San Rafael Abajo', 'Gravilias', 'Los Guido'],
    'Puriscal': ['Santiago', 'Mercedes Sur', 'Barbacoas', 'Grifo Alto', 'San Rafael', 'Candelarita', 'Desamparaditos', 'San Antonio', 'Chires'],
    'Tarrazu': ['San Marcos', 'San Lorenzo', 'San Carlos'],
    'Aserri': ['Aserri', 'Tarbaca', 'Vuelta de Jorco', 'San Gabriel', 'Legua', 'Monterrey', 'Salitrillos'],
    'Mora': ['Colon', 'Guayabo', 'Tabarcia', 'Piedras Negras', 'Picagres', 'Jaris', 'Quitirrisi'],
    'Goicoechea': ['Guadalupe', 'San Francisco', 'Calle Blancos', 'Mata de Platano', 'Ipis', 'Rancho Redondo', 'Purral'],
    'Santa Ana': ['Santa Ana', 'Salitral', 'Pozos', 'Uruca', 'Piedades', 'Brasil'],
    'Alajuelita': ['Alajuelita', 'San Josecito', 'San Antonio', 'Concepcion', 'San Felipe'],
    'Vazquez de Coronado': ['San Isidro', 'San Rafael', 'Dulce Nombre de Jesus', 'Patalillo', 'Cascajal'],
    'Acosta': ['San Ignacio', 'Guaitil', 'Palmichal', 'Cangrejal', 'Sabanillas'],
    'Tibas': ['San Juan', 'Cinco Esquinas', 'Anselmo Llorente', 'Leon XIII', 'Colima'],
    'Moravia': ['San Vicente', 'San Jeronimo', 'La Trinidad'],
    'Montes de Oca': ['San Pedro', 'Sabanilla', 'Mercedes', 'San Rafael'],
    'Turrubares': ['San Pablo', 'San Pedro', 'San Juan de Mata', 'San Luis', 'Carara'],
    'Dota': ['Santa Maria', 'Jardin', 'Copey'],
    'Curridabat': ['Curridabat', 'Granadilla', 'Sanchez', 'Tirrases'],
    'Perez Zeledon': ['San Isidro de El General', 'El General', 'Daniel Flores', 'Rivas', 'San Pedro', 'Platanares', 'Pejibaye', 'Cajon', 'Baru', 'Rio Nuevo', 'Paramo', 'La Amistad'],
    'Leon Cortes Castro': ['San Pablo', 'San Andres', 'Llano Bonito', 'San Isidro', 'Santa Cruz', 'San Antonio'],
  },
  'Alajuela': {
    'Alajuela': ['Alajuela', 'San Jose', 'Carrizal', 'San Antonio', 'Guacima', 'San Isidro', 'Sabanilla', 'San Rafael', 'Rio Segundo', 'Desamparados', 'Turrucares', 'Tambor', 'Garita', 'Sarchi'],
    'San Ramon': ['San Ramon', 'Santiago', 'San Juan', 'Piedades Norte', 'Piedades Sur', 'San Rafael', 'San Isidro', 'Angeles', 'Alfaro', 'Volio', 'Concepcion', 'Zapotal', 'Peñas Blancas', 'San Lorenzo'],
    'Grecia': ['Grecia', 'San Isidro', 'San Jose', 'San Roque', 'Tacares', 'Puente de Piedra', 'Bolivar'],
    'San Mateo': ['San Mateo', 'Desmonte', 'Jesus Maria', 'Labrador'],
    'Atenas': ['Atenas', 'Jesus', 'Mercedes', 'San Isidro', 'Concepcion', 'San Jose', 'Santa Eulalia', 'Escobal'],
    'Naranjo': ['Naranjo', 'San Miguel', 'San Jose', 'Cirri Sur', 'San Jeronimo', 'San Juan', 'El Rosario', 'Palmitos'],
    'Palmares': ['Palmares', 'Zaragoza', 'Buenos Aires', 'Santiago', 'Candelaria', 'Esquipulas', 'La Granja'],
    'Poas': ['San Pedro', 'San Juan', 'San Rafael', 'Carrillos', 'Sabana Redonda'],
    'Orotina': ['Orotina', 'El Mastate', 'Hacienda Vieja', 'Coyolar', 'La Ceiba'],
    'San Carlos': ['Quesada', 'Florencia', 'Buenavista', 'Aguas Zarcas', 'Venecia', 'Pital', 'La Fortuna', 'La Tigra', 'La Palmera', 'Venado', 'Cutris', 'Monterrey', 'Pocosol'],
    'Zarcero': ['Zarcero', 'Laguna', 'Tapesco', 'Guadalupe', 'Palmira', 'Zapote', 'Brisas'],
    'Sarchi': ['Sarchi Norte', 'Sarchi Sur', 'Toro Amarillo', 'San Pedro', 'Rodriguez'],
    'Upala': ['Upala', 'Aguas Claras', 'San Jose', 'Bijagua', 'Delicias', 'Dos Rios', 'Yolillal', 'Canalete'],
    'Los Chiles': ['Los Chiles', 'Caño Negro', 'El Amparo', 'San Jorge'],
    'Guatuso': ['San Rafael', 'Buenavista', 'Cote', 'Katira'],
    'Rio Cuarto': ['Rio Cuarto', 'Santa Rita', 'Santa Isabel'],
  },
  'Cartago': {
    'Cartago': ['Oriental', 'Occidental', 'Carmen', 'San Nicolas', 'Aguacaliente', 'Guadalupe', 'Corralillo', 'Tierra Blanca', 'Dulce Nombre', 'Llano Grande', 'Quebradilla'],
    'Paraiso': ['Paraiso', 'Santiago', 'Orosi', 'Cachi', 'Llanos de Santa Lucia', 'Birrisito'],
    'La Union': ['Tres Rios', 'San Diego', 'San Juan', 'San Rafael', 'Concepcion', 'Dulce Nombre', 'San Ramon', 'Rio Azul'],
    'Jimenez': ['Juan Viñas', 'Tucurrique', 'Pejibaye'],
    'Turrialba': ['Turrialba', 'La Suiza', 'Peralta', 'Santa Cruz', 'Santa Teresita', 'Pavones', 'Tuis', 'Tayutic', 'Santa Rosa', 'Tres Equis', 'La Isabel', 'Chirripo'],
    'Alvarado': ['Pacayas', 'Cervantes', 'Capellades'],
    'Oreamuno': ['San Rafael', 'Cot', 'Potrero Cerrado', 'Cipreses', 'Santa Rosa'],
    'El Guarco': ['El Tejar', 'San Isidro', 'Tobosi', 'Patio de Agua'],
  },
  'Heredia': {
    'Heredia': ['Heredia', 'Mercedes', 'San Francisco', 'Ulloa', 'Varablanca'],
    'Barva': ['Barva', 'San Pedro', 'San Pablo', 'San Roque', 'Santa Lucia', 'San Jose de la Montaña'],
    'Santo Domingo': ['Santo Domingo', 'San Vicente', 'San Miguel', 'Paracito', 'Santo Tomas', 'Santa Rosa', 'Tures', 'Para'],
    'Santa Barbara': ['Santa Barbara', 'San Pedro', 'San Juan', 'Jesus', 'Santo Domingo', 'Puraba'],
    'San Rafael': ['San Rafael', 'San Josecito', 'Santiago', 'Angeles', 'Concepcion'],
    'San Isidro': ['San Isidro', 'San Jose', 'Concepcion', 'San Francisco'],
    'Belen': ['San Antonio', 'La Ribera', 'La Asuncion'],
    'Flores': ['San Joaquin', 'Barrantes', 'Llorente'],
    'San Pablo': ['San Pablo', 'Rincon de Sabanilla'],
    'Sarapiqui': ['Puerto Viejo', 'La Virgen', 'Las Horquetas', 'Llanuras del Gaspar', 'Cureña'],
  },
  'Guanacaste': {
    'Liberia': ['Liberia', 'Cañas Dulces', 'Mayorga', 'Nacascolo', 'Curubande'],
    'Nicoya': ['Nicoya', 'Mansion', 'San Antonio', 'Quebrada Honda', 'Samara', 'Nosara', 'Belen de Nosarita'],
    'Santa Cruz': ['Santa Cruz', 'Bolson', 'Veintisiete de Abril', 'Tempate', 'Cartagena', 'Cuajiniquil', 'Diria', 'Cabo Velas', 'Tamarindo'],
    'Bagaces': ['Bagaces', 'La Fortuna', 'Mogote', 'Rio Naranjo'],
    'Carrillo': ['Filadelfia', 'Palmira', 'Sardinal', 'Belen'],
    'Canas': ['Canas', 'Palmira', 'San Miguel', 'Bebedero', 'Porozal'],
    'Abangares': ['Las Juntas', 'Sierra', 'San Juan', 'Colorado'],
    'Tilaran': ['Tilaran', 'Quebrada Grande', 'Tronadora', 'Santa Rosa', 'Libano', 'Tierras Morenas', 'Arenal', 'Cabeceras'],
    'Nandayure': ['Carmona', 'Santa Rita', 'Zapotal', 'San Pablo', 'Porvenir', 'Bejuco'],
    'La Cruz': ['La Cruz', 'Santa Cecilia', 'La Garita', 'Santa Elena'],
    'Hojancha': ['Hojancha', 'Monte Romo', 'Puerto Carrillo', 'Huacas', 'Matambu'],
  },
  'Puntarenas': {
    'Puntarenas': ['Puntarenas', 'Pitahaya', 'Chomes', 'Lepanto', 'Paquera', 'Manzanillo', 'Guacimal', 'Barranca', 'Monte Verde', 'Isla del Coco', 'Cobano', 'Chacarita', 'Chira', 'Acapulco', 'El Roble', 'Arancibia'],
    'Esparza': ['Esparza', 'San Juan Grande', 'Macacona', 'San Rafael', 'San Jeronimo', 'Caldera'],
    'Buenos Aires': ['Buenos Aires', 'Volcan', 'Potrero Grande', 'Boruca', 'Pilas', 'Colinas', 'Changuena', 'Biolley', 'Brunka'],
    'Montes de Oro': ['Miramar', 'La Union', 'San Isidro'],
    'Osa': ['Puerto Cortes', 'Palmar', 'Sierpe', 'Bahia Ballena', 'Piedras Blancas', 'Bahia Drake'],
    'Quepos': ['Quepos', 'Savegre', 'Naranjito'],
    'Golfito': ['Golfito', 'Puerto Jimenez', 'Guaycara', 'Pavon'],
    'Coto Brus': ['San Vito', 'Sabalito', 'Aguabuena', 'Limoncito', 'Pittier', 'Gutierrez Braun'],
    'Parrita': ['Parrita'],
    'Corredores': ['Corredor', 'La Cuesta', 'Canoas', 'Laurel'],
    'Garabito': ['Jaco', 'Tarcoles'],
  },
  'Limón': {
    'Limón': ['Limon', 'Valle La Estrella', 'Rio Blanco', 'Matama'],
    'Pococi': ['Guapiles', 'Jimenez', 'La Rita', 'Roxana', 'Cariari', 'Colorado', 'La Colonia'],
    'Siquirres': ['Siquirres', 'Pacuarito', 'Florida', 'Germania', 'El Cairo', 'Alegria', 'Reventazon'],
    'Talamanca': ['Bratsi', 'Sixaola', 'Cahuita', 'Telire'],
    'Matina': ['Matina', 'Batan', 'Carrandi'],
    'Guacimo': ['Guacimo', 'Mercedes', 'Pocora', 'Rio Jimenez', 'Duacari'],
  },
}

export const getDistrictsByCanton = (province: string, canton: string): string[] => {
  return COSTA_RICA_DISTRICTS[province]?.[canton] || []
}

export const getDistrictsByCantons = (province: string, cantons: string[]): { canton: string; districts: string[] }[] => {
  return cantons
    .map(canton => ({
      canton,
      districts: COSTA_RICA_DISTRICTS[province]?.[canton] || [],
    }))
    .filter(item => item.districts.length > 0)
}

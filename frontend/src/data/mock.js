export const IMG = {
  prop1:
    "https://images.unsplash.com/photo-1624204386084-dd8c05e32226?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNzl8MHwxfHNlYXJjaHwyfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBleHRlcmlvcnxlbnwwfHx8fDE3ODExOTM2NzV8MA&ixlib=rb-4.1.0&q=85",
  prop2:
    "https://images.pexels.com/photos/18153132/pexels-photo-18153132.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  prop3:
    "https://images.unsplash.com/photo-1697807650304-907257330a3e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxjb3p5JTIwaG91c2UlMjBleHRlcmlvcnxlbnwwfHx8fDE3ODExOTM2NzV8MA&ixlib=rb-4.1.0&q=85",
  avatarF:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODh8MHwxfHNlYXJjaHwyfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGZhY2V8ZW58MHx8fHwxNzgxMTkzNjc1fDA&ixlib=rb-4.1.0&q=85",
  avatarM:
    "https://images.unsplash.com/photo-1587397845856-e6cf49176c70?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODh8MHwxfHNlYXJjaHwzfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGZhY2V8ZW58MHx8fHwxNzgxMTkzNjc1fDA&ixlib=rb-4.1.0&q=85",
  notary:
    "https://images.pexels.com/photos/13219418/pexels-photo-13219418.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  map: "https://images.unsplash.com/photo-1667846789627-e6c54f1e2eff?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHwyfHxhcmdlbnRpbmElMjBjaXR5JTIwc3RyZWV0fGVufDB8fHx8MTc4MTE5MzY3NXww&ixlib=rb-4.1.0&q=85",
};

export const CURRENT_USER = {
  id: "u-me",
  name: "Joaquín Pereira",
  email: "joaquin.pereira@gmail.com",
  avatar: IMG.avatarM,
  memberSince: "2019",
};

const sellerSofia = {
  name: "Sofía Martínez",
  avatar: IMG.avatarF,
  verified: true,
  rating: 4.9,
  sales: 3,
  memberSince: "2017",
};
const sellerDiego = {
  name: "Diego Álvarez",
  avatar: IMG.avatarM,
  verified: true,
  rating: 4.7,
  sales: 1,
  memberSince: "2020",
};

export const PROPERTIES = [
  {
    id: "p1",
    title: "Departamento 3 ambientes con balcón aterrazado",
    type: "Departamento",
    price: 185000,
    expensas: 145000,
    neighborhood: "Palermo",
    city: "CABA",
    address: "Av. Santa Fe 4120, 5° B",
    ambientes: 3,
    dormitorios: 2,
    banos: 1,
    m2: 78,
    m2cub: 70,
    antiguedad: 8,
    cochera: true,
    publishedDays: 3,
    description:
      "Luminoso departamento de 3 ambientes en el corazón de Palermo. Living comedor amplio con salida a balcón aterrazado con vista abierta. Cocina integrada con mesada de granito. Edificio con amenities: SUM, parrilla y bicicletero. A 2 cuadras del subte D.",
    features: ["Balcón aterrazado", "Cocina integrada", "SUM y parrilla", "Apto crédito", "Apto profesional", "Calefacción central"],
    images: [IMG.prop1, IMG.prop2, IMG.prop3],
    seller: sellerSofia,
  },
  {
    id: "p2",
    title: "Casa 4 ambientes con jardín y parrilla",
    type: "Casa",
    price: 248000,
    expensas: 0,
    neighborhood: "Villa Urquiza",
    city: "CABA",
    address: "Mendoza 5230",
    ambientes: 4,
    dormitorios: 3,
    banos: 2,
    m2: 165,
    m2cub: 120,
    antiguedad: 15,
    cochera: true,
    publishedDays: 7,
    description:
      "Casa en lote propio de 8,66 m de frente. Planta baja con living comedor, cocina y toilette. Planta alta con 3 dormitorios y baño completo. Fondo libre con jardín, parrilla y galería. Garage para 2 autos.",
    features: ["Lote propio", "Jardín con parrilla", "Garage doble", "Apto crédito", "Terraza", "Lavadero independiente"],
    images: [IMG.prop3, IMG.prop1, IMG.prop2],
    seller: sellerDiego,
  },
  {
    id: "p3",
    title: "Monoambiente divisible a estrenar",
    type: "Departamento",
    price: 98000,
    expensas: 89000,
    neighborhood: "Belgrano",
    city: "CABA",
    address: "Cabildo 2255, 9° A",
    ambientes: 1,
    dormitorios: 1,
    banos: 1,
    m2: 38,
    m2cub: 35,
    antiguedad: 0,
    cochera: false,
    publishedDays: 1,
    description:
      "Monoambiente divisible a estrenar en torre con amenities completos: pileta, gimnasio, coworking y rooftop. Excelente oportunidad para inversión, alta demanda de alquiler en la zona. A metros de Av. Cabildo y subte D.",
    features: ["A estrenar", "Pileta y gimnasio", "Coworking", "Rooftop", "Apto inversión", "Seguridad 24 hs"],
    images: [IMG.prop2, IMG.prop3, IMG.prop1],
    seller: sellerSofia,
  },
  {
    id: "p4",
    title: "PH 3 ambientes reciclado con patio",
    type: "PH",
    price: 142000,
    expensas: 0,
    neighborhood: "Caballito",
    city: "CABA",
    address: "Pedro Goyena 880, PB",
    ambientes: 3,
    dormitorios: 2,
    banos: 1,
    m2: 85,
    m2cub: 68,
    antiguedad: 45,
    cochera: false,
    publishedDays: 12,
    description:
      "PH al frente totalmente reciclado, sin expensas. Living comedor con cocina americana, 2 dormitorios con placard y patio propio de 17 m² con parrilla. Instalaciones nuevas de gas, agua y electricidad.",
    features: ["Sin expensas", "Patio con parrilla", "Reciclado a nuevo", "Apto crédito", "Cocina americana", "Entrada independiente"],
    images: [IMG.prop1, IMG.prop3, IMG.prop2],
    seller: sellerDiego,
  },
  {
    id: "p5",
    title: "Departamento 2 ambientes con vista al río",
    type: "Departamento",
    price: 156000,
    expensas: 210000,
    neighborhood: "Núñez",
    city: "CABA",
    address: "Av. del Libertador 7850, 14° C",
    ambientes: 2,
    dormitorios: 1,
    banos: 1,
    m2: 55,
    m2cub: 50,
    antiguedad: 5,
    cochera: true,
    publishedDays: 5,
    description:
      "Increíble 2 ambientes en piso alto con vista franca al río. Torre premium con amenities de categoría: pileta in/out, spa, gimnasio y salón gourmet. Cochera cubierta incluida en el precio.",
    features: ["Vista al río", "Cochera cubierta", "Pileta in/out", "Spa y gimnasio", "Piso alto", "Amenities premium"],
    images: [IMG.prop2, IMG.prop1, IMG.prop3],
    seller: sellerSofia,
  },
  {
    id: "p6",
    title: "Casa quinta 5 ambientes con pileta",
    type: "Casa",
    price: 320000,
    expensas: 95000,
    neighborhood: "Pilar",
    city: "GBA Norte",
    address: "Barrio Los Sauces, Lote 42",
    ambientes: 5,
    dormitorios: 4,
    banos: 3,
    m2: 980,
    m2cub: 240,
    antiguedad: 10,
    cochera: true,
    publishedDays: 20,
    description:
      "Casa en barrio cerrado con seguridad 24 hs. Lote de 980 m² con parque parquizado, pileta climatizada y quincho completo. 4 dormitorios, el principal en suite con vestidor. Cochera semicubierta para 3 autos.",
    features: ["Barrio cerrado", "Pileta climatizada", "Quincho completo", "Suite con vestidor", "Parque 980 m²", "Seguridad 24 hs"],
    images: [IMG.prop3, IMG.prop2, IMG.prop1],
    seller: sellerDiego,
  },
];

export const NOTARIES = [
  {
    id: "n1",
    name: "Escribanía Lagos & Asociados",
    titular: "Esc. María Inés Lagos",
    registro: "Registro Notarial N° 412 — CABA",
    rating: 4.9,
    reviews: 128,
    distance: "1,2 km",
    zone: "Palermo, CABA",
    fee: 1400,
    days: "5 días hábiles",
    image: IMG.notary,
  },
  {
    id: "n2",
    name: "Escribanía Roldán",
    titular: "Esc. Federico Roldán",
    registro: "Registro Notarial N° 87 — CABA",
    rating: 4.8,
    reviews: 96,
    distance: "2,8 km",
    zone: "Belgrano, CABA",
    fee: 1250,
    days: "7 días hábiles",
    image: IMG.notary,
  },
  {
    id: "n3",
    name: "Escribanía Vega Digital",
    titular: "Esc. Carolina Vega",
    registro: "Registro Notarial N° 290 — CABA",
    rating: 4.7,
    reviews: 215,
    distance: "100% online",
    zone: "Firma digital remota",
    fee: 1100,
    days: "4 días hábiles",
    image: IMG.notary,
  },
  {
    id: "n4",
    name: "Escribanía Bianchi e Hijos",
    titular: "Esc. Rodolfo Bianchi",
    registro: "Registro Notarial N° 33 — CABA",
    rating: 4.6,
    reviews: 74,
    distance: "4,5 km",
    zone: "Caballito, CABA",
    fee: 980,
    days: "10 días hábiles",
    image: IMG.notary,
  },
];

export const PHOTOGRAPHERS = [
  { id: "f1", name: "Lucía Benítez", avatar: IMG.avatarF, rating: 4.9, reviews: 182, zone: "CABA y GBA Norte", tag: "Drone + tour 360 incluido", price: 90, ig: "lucia.inmofoto" },
  { id: "f2", name: "Tomás Aguirre", avatar: IMG.avatarM, rating: 4.8, reviews: 140, zone: "CABA", tag: "Entrega en 24 hs", price: 75, ig: "tomi.aguirre.ph" },
  { id: "f3", name: "Carla Méndez", avatar: IMG.avatarF, rating: 4.7, reviews: 98, zone: "Zona Oeste y CABA", tag: "Especialista en interiores", price: 70, ig: "carlamendez.estudio" },
  { id: "f4", name: "Julián Soto", avatar: IMG.avatarM, rating: 4.6, reviews: 75, zone: "GBA Sur", tag: "Foto + video reel", price: 65, ig: "juliansoto.realestate" },
];

export const TIME_SLOTS = ["10:00", "11:00", "12:00", "14:00", "15:00", "16:30", "18:00"];

export const formatUSD = (n) => `U$S ${Number(n).toLocaleString("es-AR")}`;
export const formatARS = (n) => `$ ${Number(n).toLocaleString("es-AR")}`;

export const reservationAmount = (price) => Math.max(1000, Math.round(price * 0.01));

export const getNextDays = (count = 10) => {
  const days = [];
  const names = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  for (let i = 1; i <= count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      iso: d.toISOString().slice(0, 10),
      dayName: names[d.getDay()],
      dayNum: d.getDate(),
      month: months[d.getMonth()],
    });
  }
  return days;
};

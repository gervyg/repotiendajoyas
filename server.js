const express = require('express')
const joyas = require('./data/joyas.js')
const app = express()
app.listen(3000, () => console.log('Your app listening on port 3000'))

app.use(express.static("public"));

app.get('/', (req, res) => {
  res.send('Oh wow! this is working =)')
})



//Crear una ruta para la devolución de todas las joyas aplicando HATEOAS.

const HATEOASV1 = (() => {
  return (joyas.results);
});

app.get("/joyas", (req, res) => {
  res.send(HATEOASV1());
});

//Hacer una segunda versión de la API que ofrezca los mismos datos pero con los
//nombres de las propiedades diferentes.
const HATEOASV2 = () =>
  joyas.results.map((g) => {
    return {

      numero: g.id,
      nombre: g.name,
      modelo: g.model,
      categoria: g.category,
      material: g.metal,
      largo: g.cadena,
      grueso: g.medida,
      valor: g.value,
      Inventario: g.stock,
    };
  });


//Permitir hacer ordenamiento de las joyas según su valor de forma ascendente o
//descendente usando Query Strings.    
const orderValues = (order) => {
  return order == "asc"
    ? (HATEOASV2()).sort((a, b) => (a.valor > b.valor ? 1 : -1))
    : order == "desc"
      ? (HATEOASV2()).sort((a, b) => (a.valor < b.valor ? 1 : -1))
      : false;
};

app.get("/joyas/V2", (req, res) => {
  const { values } = req.query;
  if (values == "asc") return res.send(orderValues("asc"));
  if (values == "desc") return res.send(orderValues("desc"));

  //Permitir hacer paginación de las joyas usando Query Strings.
  if (req.query.page) {
    const { page } = req.query;
    return res.send({ joyas: HATEOASV2().slice(page * 2 - 2, page * 2) });
  }
  res.send({
    joyas: HATEOASV2(),
  });
});


//La API REST debe poder ofrecer una ruta con la que se puedan filtrar las joyas por categoría.

const filtroByBody = (categoria) => {
  return HATEOASV2().filter((g) => g.categoria === categoria);
};

app.get("/joyas/V2/:categoria", (req, res) => {
  const categoria = req.params.categoria;
  res.send({
    cant: filtroByBody(categoria).length,
    joyas: filtroByBody(categoria),
  });
});

//Crear una ruta que permita el filtrado por campos de una joya a consultar.

const joyaNum = (num) => {
  return HATEOASV2().find((g) => g.numero == num);
};
const fieldsSelect = (HATEOASV2, fields) => {
  for (campo in HATEOASV2) {
    if (!fields.includes(campo)) delete HATEOASV2[campo];
  }
  return HATEOASV2;
};
app.get("/joyas/V2/campo/:numero", (req, res) => {
  const { numero } = req.params;
  const { fields } = req.query;
  if (fields) return res.send({
    HATEOASV2: fieldsSelect(joyaNum(numero),
      fields.split(","))
  });
  res.send({
    HATEOASV2: joyaNum(numero),
  });
});


//Crear una ruta que devuelva como payload un JSON con un mensaje de error cuando
//el usuario consulte el id de una joya que no exista.

app.get("/joyas/err/:numero", (req, res) => {
  console.log("estoy aca")
  const { numero } = req.params;
  const { fields } = req.query;
  if (fields) return res.send({
    joyaNum: fieldsSelect(joyaNum(numero),
      fields.split(","))
  });
  joyaNum(numero)
    ? res.send({
      joyaNum: joyaNum(numero),
    })
    :
    res.status(404).send({
      error: "404 Not Found",
      message: "No existe una joyas con ese Numero",
    });
});



















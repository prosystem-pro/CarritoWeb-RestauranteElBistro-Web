const fs = require('fs');
const axios = require('axios');

const apiUrl = 'https://carritoweb-promesadios-api.onrender.com/api/generar-modelos';
const modelsDirectory = './src/app/Modelos/';

// Asegura que el directorio exista
if (!fs.existsSync(modelsDirectory)) {
  fs.mkdirSync(modelsDirectory);
}

// Convierte todas las propiedades en opcionales
function hacerPropiedadesOpcionales(modelInterface) {
  return modelInterface.replace(/(\s+)(\w+):/g, '$1$2?:');
}

axios.get(apiUrl)
  .then(response => {
    const modelsJson = response.data;

    Object.entries(modelsJson).forEach(([modelName, modelInterface]) => {
      const interfaceOpcional = hacerPropiedadesOpcionales(modelInterface);
      const filePath = `${modelsDirectory}${modelName}.ts`;
      fs.writeFileSync(filePath, interfaceOpcional, 'utf8');
    });
  })
  .catch(error => {
    console.error('Error al obtener el JSON del backend:', error);
  });

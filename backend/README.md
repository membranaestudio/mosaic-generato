## Instalacion

Primero que todo hay que instalar las dependencias

`npm install`

## Imagenes

Como segundo paso hay que crear una carpeta llamada *images* dentro de **backend** y colocar alli todas las imagenes que seran usadas para la generación de los mosaicos.

Puedes correr el siguiente comando de la raiz del proyecto si estas en Linux.

`mkdir -p backend/images`

## Ejecución

Para poner en marcha al backend se debe ejecutar el siguiente `npm start`

## Generación de Mosaicos

El backend consta de un servidor web con express, por lo tanto hay una serie de endpoints listos para recibir peticiones HTTP.
Para comenzar el proceso de generación, y luego de hacer los pasos anteriores, se debe realizar una peticion GET a la raiz del servidor.

Este proceso tarda varias horas en finalizar, dependiendo del computador donde se realice.

## Estructura de Archivos

Dentro de la carpeta **thumbnails** se crearan automaticamente las miniaturas que formaran parte de cada mosaico.

## Base de datos

En el proceso de creación de mosaicos se guardan las matrices en una tabla de una base de datos, para obtenerla posteriormente desde el frontend.

La carpeta **models** contiene un archivo entidad que define esa tabla y sus columnas [Entidad Mosaico](/backend/models/mosaic.js).

La migración para crear la tabla en la base de datos esta definida en la carpeta **migrations**, desde alli se puede modificar la tabla para otros propósitos.

### Sequelize

Cabe destacar que toda la comunicacion con la BD desde Node se hace con el ORM [Sequelize](https://sequelize.org/) y su cadena de conexión se encuentra en la carpeta [Config](/backend/config)
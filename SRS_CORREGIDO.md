# Documento de Especificación de Requerimientos de Software (SRS) - CORREGIDO

**BRANDON ADAIR LOPEZ LOPEZ 22100190**  
**EMILIO MADRIGAL PRECIADO 22100230**  
**CARLOS PEREZ SANCHEZ 22100191**

**PROGRAMACIÓN WEB II**  
**PAOLA FERNANDA PONCE VILLALVAZO**

**Fecha de corrección: 28/10/2025**

---

## Introducción

El proyecto consiste en desarrollar un sitio web e-commerce para la venta de juguetes, dirigido a diferentes segmentos de usuarios finales según categorías y edades. Busca aprovechar el crecimiento del comercio digital y el mercado de juguetes educativos y tecnológicos. La plataforma permitirá a los usuarios navegar, seleccionar y comprar productos desde cualquier dispositivo, garantizando seguridad y una experiencia amigable. Además, se integrará gestión de inventarios, métodos de pago seguros, y funcionalidades para administración y logística del negocio.

### 1.1 Propósito

[Se mantiene igual]

### 1.2 Alcance

[Se mantiene igual]

### 1.3 Definiciones Y Acronimos y abreviaturas

[Se mantiene igual]

### 1.4 Referencias

[Se mantiene igual]

### 1.5 Descripción General

[Se mantiene igual]

---

## 2. Descripción del proyecto

Es un sistema de venta de juguetes en línea con catálogo digital clasificado por categorías y edades.

### 2.1 Perspectiva

[Se mantiene igual]

### 2.2 Funcionamiento

[Se mantiene igual]

### 2.3 Características del Usuario

[Se mantiene igual]

### 2.4 Restricciones

[Se mantiene igual]

### 2.5 Suposiciones y Disposiciones

[Se mantiene igual]

---

## 3. Requerimientos

### 3.1 Requerimientos Funcionales

**-RQF1:** El usuario crea una cuenta con los siguientes datos personales: Nombre, Apellidos, Correo electrónico, contraseña, tipo de usuario (Administrador o Miembro), fecha de nacimiento y dirección.

**-RQF2:** El usuario ingresa su dirección a la hora de crear su cuenta con los siguientes datos: Calle, número exterior, municipio, estado y código postal.

**-RQF3:** El sistema le muestra al usuario un campo de tipo fecha (date picker), en donde el usuario puede seleccionar en él su fecha de nacimiento cuando está ingresando sus datos para crear una cuenta.

**-RQF4:** El sistema le muestra al usuario un mensaje de error en caso de no cumplir con el RQNF1 o el RQNF2 al intentar registrar una cuenta.

**-RQF5:** El usuario inicia sesión en su cuenta con las siguientes credenciales: Correo electrónico y contraseña.

**-RQF6:** El usuario solicita la recuperación de contraseña de una cuenta registrada mediante su correo electrónico.

**-RQF7:** El sistema genera un token de recuperación y envía un mensaje con un enlace al correo electrónico del usuario para restablecer su contraseña. El enlace contiene el ID del usuario y el token de recuperación, y tiene una validez de 1 hora.

**-RQF8:** El usuario restablece su contraseña utilizando el enlace recibido por correo electrónico, ingresando una nueva contraseña que cumpla con los requisitos de seguridad.

**-RQF9:** El sistema le muestra al usuario un mensaje de error en caso de no cumplir con el RQNF3 y RQNF4 al intentar iniciar sesión.

**-RQF10:** El usuario cierra su sesión cuando tiene una sesión abierta.

**-RQF11:** El sistema muestra el catálogo de productos existentes en el inventario al usuario, mostrando los siguientes datos por producto: Nombre, descripción, foto del producto, precio y cantidad existente en el inventario.

**-RQF12:** El usuario añade un producto a la vez al carrito de compras.

**-RQF13:** El usuario puede añadir más de una cantidad de un mismo producto a su carrito de compras.

**-RQF14:** El sistema muestra el carrito de compras del usuario con los siguientes datos: Productos agregados al carrito de compras junto a su precio por cada uno, el subtotal de precio de su compra antes del impuesto IVA y el total de precio a pagar.

**-RQF15:** El usuario elimina productos de su carrito de compras, un producto a la vez.

**-RQF16:** El usuario elimina todos los productos de su carrito de compras.

**-RQF17:** El usuario confirma la compra y genera un pedido para cada producto que el usuario tenga en el carrito de compras con los siguientes datos: Producto y cantidad de ese producto que tiene el usuario.

**-RQF18:** El sistema muestra un error en caso de que no cumpla el requerimiento RQNF11 cuando el usuario confirma su compra.

**-RQF19:** El sistema procesa los productos de su carrito de compras en la pasarela de pago (PayPal) y genera una compra con los siguientes datos: El usuario que realizó la compra, el pedido con sus productos y la dirección de envío (dirección del usuario).

**-RQF20:** El usuario descarga el recibo XML de su compra como indica el RQNF16 después de que su compra sea procesada y exitosa.

**RQF21:** El administrador visualiza el inventario completo de productos con los siguientes datos por producto: ID del producto, nombre, descripción, precio, cantidad en stock e imagen del producto.

**RQF22:** El administrador agrega un nuevo producto al inventario con los siguientes datos: nombre, descripción, precio, cantidad en stock e imagen del producto.

**RQF23:** El administrador edita la información de un producto existente en el inventario, pudiendo modificar uno o más de los siguientes campos: nombre, descripción, precio, cantidad en stock e imagen del producto.

**RQF24:** El administrador elimina un producto del inventario cuando se requiere retirarlo del catálogo.

**RQF25:** El sistema restringe el acceso al módulo de inventario únicamente a usuarios con rol de Administrador, redirigiendo a usuarios con rol de Miembro al catálogo de productos.

**RQF26:** Confirmación de Eliminación - El sistema solicita confirmación al administrador antes de eliminar un producto del inventario para evitar eliminaciones accidentales.

**RQF27:** Visualización de Estado de Stock - El sistema muestra visualmente el estado del stock de cada producto en el inventario.

**RQF28:** El sistema muestra mensajes de éxito al administrador cuando se completa exitosamente una operación (agregar, editar o eliminar producto) y mensajes de error cuando ocurre un problema durante la operación.

**RQF29:** Actualización Automática del Inventario - El sistema actualiza automáticamente la lista de productos en el inventario después de realizar operaciones de agregar, editar o eliminar productos.

**RQF30:** Validación de Campos al Agregar Producto - El sistema valida que los campos requeridos (nombre, descripción, precio y cantidad) no estén vacíos y cumplan con las validaciones correspondientes antes de agregar un producto al inventario.

**RQF31:** Validación de Campos al Editar Producto - El sistema valida que los campos modificados cumplan con las validaciones correspondientes antes de actualizar un producto en el inventario.

---

### 3.2 Requerimientos No Funcionales (RQNF)

**-RQNF1:** El sistema verifica que el usuario no ingrese datos vacíos a la hora de crear una cuenta en los siguientes campos: Nombre, Apellidos, Correo, Contraseña, Fecha de nacimiento y Dirección.

**-RQNF2:** El sistema valida que el correo electrónico del usuario cumpla con el siguiente formato a la hora de registrarse: nombre de usuario + símbolo de "@" + dominio + símbolo de "." + dominio de nivel superior.

**-RQNF3:** El sistema verifica que las credenciales ingresadas por el usuario al iniciar sesión no estén vacías.

**-RQNF4:** El sistema valida al momento de que un usuario intente iniciar sesión, que las siguientes credenciales ingresadas coinciden con un usuario registrado: Correo electrónico y contraseña.

**-RQNF5:** El sistema verifica que en el catálogo de productos mostrados, están los productos que se encuentran actualmente en el inventario y que exista mínimo un producto disponible para su compra en la base de datos.

**-RQNF6:** El sistema genera una lista con los productos a comprar, el cuál será el carrito de compras del usuario.

**-RQNF7:** El sistema calcula el subtotal del precio del carrito de compras del usuario en base al precio de cada artículo.

**-RQNF8:** El sistema calcula el impuesto IVA del subtotal del precio del carrito de compras del usuario.

**-RQNF9:** El sistema genera el precio total del carrito de compras del usuario con el subtotal del precio del carrito, sumándole el impuesto IVA correspondiente.

**-RQNF10:** El sistema implementa una pasarela de pago (PayPal) para procesar los pagos del usuario.

**-RQNF11:** El sistema verifica que la cantidad de productos que tenga el usuario en el carrito de compras tenga disponibilidad, en cuestión de cantidad de productos disponibles en el inventario, a la hora de que el usuario confirme la compra.

**-RQNF12:** El sistema redirige al usuario a la pasarela de pago (PayPal) con los datos de su compra (precio total) para procesar el pago.

**-RQNF13:** El sistema recibe una respuesta de la pasarela de pago con información sobre la transacción.

**-RQNF14:** El sistema guarda la transacción en la base de datos con los siguientes datos si la compra se realizó exitosamente en la pasarela de pago: El usuario y la dirección hacia donde se envían los pedidos (dirección del usuario).

**-RQNF15:** El sistema guarda los pedidos que generó el usuario en el RQF17 si la compra se realizó exitosamente en la pasarela de pago.

**-RQNF16:** El sistema genera un recibo XML de la compra en caso de que haya sido exitosa con los siguientes datos: Fecha de compra, precio subtotal antes del IVA, cantidad agregada de IVA, precio total y un listado de los productos donde por cada producto se tengan los siguientes datos: ID del producto, nombre, cantidad comprada, precio del producto, descripción del producto y precio subtotal del pedido de producto. El formato XML es un recibo simple con estructura `<recibo>` que contiene los elementos mencionados.

**RQNF17:** El sistema verifica que el administrador no ingrese datos vacíos en los siguientes campos al agregar un producto: nombre, descripción, precio y cantidad.

**RQNF18:** El sistema valida que el precio ingresado por el administrador sea un número positivo mayor a cero al agregar o editar un producto.

**RQNF19:** Validación de Cantidad No Negativa - El sistema valida que la cantidad en stock ingresada por el administrador sea un número entero no negativo (mayor o igual a cero) al agregar o editar un producto.

**RQNF20:** El sistema verifica que el usuario que intenta acceder al módulo de inventario tenga el rol de Administrador antes de permitir el acceso.

**RQNF21:** El sistema previene la eliminación de un producto del inventario si este está asociado a pedidos existentes en el sistema, mostrando un mensaje de error apropiado.

**RQNF22:** El sistema persiste todos los cambios realizados en el inventario (agregar, editar, eliminar) en la base de datos de manera permanente.

**RQNF23:** El sistema mantiene sincronizada la información del inventario con el catálogo de productos, de manera que los cambios realizados en el inventario se reflejan inmediatamente en el catálogo visible para los clientes.

**RQNF24:** El sistema verifica que un producto exista en la base de datos antes de permitir su edición o eliminación, mostrando un mensaje de error si el producto no se encuentra.

**RQNF25:** El sistema mantiene la integridad referencial de los datos, asegurando que las relaciones entre productos y otras entidades (como pedidos) se mantengan consistentes en la base de datos.

---

### 3.3 Interfaces

#### Prototipo:

[Se mantiene igual]

#### Especificación y estructura de XML:

**Características Generales:**
- Versión XML: 1.0
- Codificación: UTF-8
- Formato: Recibo XML simple (no CFDI 4.0)

**Estructura del XML:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<recibo>
  <fecha>2025-10-28T14:30:00.000Z</fecha>
  <id_compra>12345</id_compra>
  <productos>
    <producto>
      <id>1</id>
      <nombre>Juego De Mesa Bop It</nombre>
      <cantidad>2</cantidad>
      <precio>300.00</precio>
      <subtotal>600.00</subtotal>
      <descripcion>Bop it! JUEGO: ¡él juego favorito de Bop It!</descripcion>
    </producto>
    <producto>
      <id>2</id>
      <nombre>Carro de carreras</nombre>
      <cantidad>1</cantidad>
      <precio>150.00</precio>
      <subtotal>150.00</subtotal>
      <descripcion>Auto a escala con fricción y diseño deportivo</descripcion>
    </producto>
  </productos>
  <subtotal>750.00</subtotal>
  <iva>120.00</iva>
  <total>870.00</total>
</recibo>
```

**Descripción de Elementos:**

**ELEMENTO RAÍZ:**
- `<recibo>`: Nodo raíz que agrupa todos los datos del recibo electrónico de compra.

**METADATOS DE LA TRANSACCIÓN:**
- `<fecha>`: Tipo de Dato: DateTime. Obligatorio: Sí. Descripción: Fecha y hora de generación del recibo en formato ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ). Zona horaria UTC.
- `<id_compra>`: Tipo de Dato: Entero. Obligatorio: Sí. Descripción: Identificador único secuencial de la transacción.

**SECCIÓN DE PRODUCTOS:**
- `<productos>`: Tipo de Dato: Contenedor. Obligatorio: Sí. Descripción: Nodo contenedor que agrupa todos los productos incluidos en la compra.
- `<producto>`: Tipo de Dato: Contenedor. Obligatorio: Sí. Descripción: Representa un producto individual con todos sus datos asociados.
  - `<id>`: Tipo de Dato: Entero. Obligatorio: Sí. Descripción: Identificador único del producto en el catálogo del sistema.
  - `<nombre>`: Tipo de Dato: String(100). Obligatorio: Sí. Descripción: Nombre comercial completo del producto.
  - `<cantidad>`: Tipo de Dato: Entero positivo. Obligatorio: Sí. Descripción: Número de unidades compradas del producto (valor mínimo: 1).
  - `<precio>`: Tipo de Dato: Decimal. Obligatorio: Sí. Descripción: Precio unitario del producto en pesos mexicanos (MXN).
  - `<subtotal>`: Tipo de Dato: Decimal. Obligatorio: Sí. Descripción: Resultado de cantidad × precio. Calculado automáticamente por el sistema.
  - `<descripcion>`: Tipo de Dato: String(255). Obligatorio: No. Descripción: Descripción breve o características principales del producto.

**TOTALES FINANCIEROS:**
- `<subtotal>`: Tipo de Dato: Decimal(10,2). Obligatorio: Sí. Descripción: Suma de todos los subtotales de productos antes de aplicar impuestos.
- `<iva>`: Tipo de Dato: Decimal(10,2). Obligatorio: Sí. Descripción: Impuesto al Valor Agregado. Corresponde al 16% del subtotal. Fórmula: subtotal × 0.16
- `<total>`: Tipo de Dato: Decimal(10,2). Obligatorio: Sí. Descripción: Monto total final a pagar incluyendo IVA. Fórmula: subtotal + iva

**Notas:**
- Agrupación de productos: Si el mismo producto aparece múltiples veces en el carrito, se agrupa en un solo nodo `<producto>` con cantidad acumulada.
- Cálculo de IVA: 16% sobre el subtotal
- Formato numérico: Todos los montos con 2 decimales
- Nomenclatura de archivo: `recibo-{id_compra}.xml`

**Validaciones previas:**
- Carrito no puede estar vacío
- Stock disponible verificado
- Pago procesado exitosamente

---

## 4. Requisitos de diseño de sistema

### 4.1 Arquitectura

Arquitectura de 3 capas

### 4.2 Lenguajes y framework

- Angular
- TypeScript
- HTML5 / CSS3

### 4.3 Base de datos

MySQL

### 4.4 Seguridad

- Pasarelas de Pago
- Hash de Contraseñas
- Protección contra inyección SQL
- Sanitización de datos

---

## 5. Modelos y diagramas

### 5.1 Diagrama de flujo

[Se mantiene igual]

### 5.2 DER (Diagrama Entidad-Relación) - CORREGIDO

**Entidades y Atributos:**

**Direccion:**
- `id_dir` (PK): Identificador único
- `calle`: Nombre de la calle
- `municipio`: Municipio (NO ciudad)
- `no_exterior`: Número exterior
- `cp`: Código postal
- `estado`: Estado

**Cliente:**
- `id_cliente` (PK): Identificador único
- `nombre`: Nombre del cliente
- `apellidos`: Apellidos del cliente
- `correo`: Correo electrónico
- `password`: Contraseña (hash)
- `fecha_nacimiento`: Fecha de nacimiento
- `domicilio` (FK): Referencia a Direccion
- `administrador` (NUEVO): Campo booleano que indica si es administrador (1) o miembro (0)
- `resetPasswordToken` (NUEVO): Token para recuperación de contraseña
- `resetPasswordExpires` (NUEVO): Fecha de expiración del token

**Producto:**
- `id_producto` (PK): Identificador único
- `nombre`: Nombre del producto
- `descripcion`: Descripción del producto
- `cantidad`: Cantidad en stock
- `vigencia`: Fecha de vigencia
- `precio`: Precio del producto
- `imagen` (NUEVO): URL o ruta de la imagen del producto

**Compra:**
- `id_compra` (PK): Identificador único
- `dir_envio` (FK): Referencia a Direccion
- `cliente` (FK): Referencia a Cliente

**Pedido:**
- `id_pedido` (PK): Identificador único
- `cantidad`: Cantidad del producto
- `producto` (FK): Referencia a Producto
- `compra` (FK): Referencia a Compra

**Relaciones:**
- Direccion (1) - Cliente (N): Un cliente tiene una dirección, una dirección puede pertenecer a varios clientes
- Cliente (1) - Compra (N): Un cliente puede realizar muchas compras, una compra pertenece a un cliente
- Direccion (1) - Compra (N): Una dirección puede ser usada para muchas compras, una compra tiene una dirección de envío
- Compra (1) - Pedido (N): Una compra contiene muchos pedidos, un pedido pertenece a una compra
- Producto (1) - Pedido (N): Un producto puede estar en muchos pedidos, un pedido contiene un producto

### 5.3 Mapa de navegación - CORREGIDO

**Rutas del sistema:**
- `/` → Redirige a `/catalogo`
- `/catalogo` → Página principal, muestra catálogo de productos
- `/register` → Registro de nuevos usuarios
- `/login` → Inicio de sesión
- `/forgot-password` → Recuperación de contraseña
- `/reset-password` → Restablecimiento de contraseña (requiere token)
- `/carrito` → Carrito de compras
- `/inventario` → Gestión de inventario (solo administradores)

**Flujo de navegación:**
- Desde `catalogo` se puede ir a: `register`, `login`, `carrito`
- Desde `register` se puede ir a: `login`, `catalogo`
- Desde `login` se puede ir a: `catalogo`, `forgot-password`
- Desde `forgot-password` se puede ir a: `login`, `reset-password` (vía enlace de correo)
- Desde `reset-password` se puede ir a: `login`
- Desde `carrito` se puede ir a: `catalogo`, procesamiento de pago PayPal (redirección externa)
- Desde `inventario` se puede ir a: `catalogo` (si no es administrador, redirige automáticamente)

**Nota:** No existe página "home" separada ni página "pago" separada. El pago se procesa directamente desde el carrito mediante redirección a PayPal.

### 5.4 Wireframe

[Se mantiene igual]

### 5.5 Diagrama UML - CORREGIDO

**Clase Cliente:**
- Atributos:
  - `-id_cliente: int`
  - `-nombre: string`
  - `-apellidos: string`
  - `-correo: string`
  - `-password: string`
  - `-fecha_nacimiento: date`
  - `-domicilio: int` (FK)
  - `-administrador: boolean` (NUEVO)
  - `-resetPasswordToken: string` (NUEVO, opcional)
  - `-resetPasswordExpires: datetime` (NUEVO, opcional)
- Métodos:
  - `+registrar()`
  - `+iniciarSesion(correo, password)`
  - `+cerrarSesion()`
  - `+agregarAlCarrito(producto)`
  - `+comprar()`
  - `+solicitarRecuperacionContrasena(correo)` (NUEVO)
  - `+restablecerContrasena(token, nuevaPassword)` (NUEVO)
- Relaciones:
  - Con Direccion: 1 a 1 (un cliente tiene una dirección)
  - Con Compra: 1 a N (un cliente puede tener muchas compras) - CORREGIDO

**Clase Producto:**
- Atributos:
  - `-id_producto: int`
  - `-nombre: string`
  - `-descripcion: string`
  - `-cantidad: int`
  - `-precio: decimal`
  - `-vigencia: date`
  - `-imagen: string` (NUEVO)
- Métodos:
  - `+obtenerPrecio()`
- Relaciones:
  - Con Pedido: 1 a N (un producto puede estar en muchos pedidos)

**Clase Compra:**
- Atributos:
  - `-id_compra: int`
  - `-dir_envio: int` (FK)
  - `-cliente: int` (FK)
- Métodos:
  - `+calcularTotal()`
  - `+calcularSubtotal()`
- Relaciones:
  - Con Cliente: N a 1 (muchas compras pertenecen a un cliente) - CORREGIDO
  - Con Pedido: 1 a N (una compra contiene muchos pedidos)
  - Con Direccion: N a 1 (muchas compras usan una dirección)

**Clase Pedido:**
- Atributos:
  - `-id_pedido: int`
  - `-cantidad: int`
  - `-producto: int` (FK)
  - `-compra: int` (FK)
- Relaciones:
  - Con Compra: N a 1 (muchos pedidos pertenecen a una compra)
  - Con Producto: N a 1 (muchos pedidos contienen un producto)

**Clase Direccion:**
- Atributos:
  - `-id_dir: int`
  - `-calle: string`
  - `-municipio: string` (NO ciudad)
  - `-no_exterior: int`
  - `-cp: string`
  - `-estado: string`
- Relaciones:
  - Con Cliente: 1 a N (una dirección puede pertenecer a varios clientes)
  - Con Compra: 1 a N (una dirección puede usarse en varias compras)

### 5.6 Casos de uso - CORREGIDO

**1. Registro de usuario:**
- Descripción: El usuario crea una nueva cuenta en el sistema.
- Precondiciones:
  - El usuario no tiene una cuenta registrada
  - El usuario no ha iniciado sesión
- Flujo:
  1. Actor accede a la página de registro
  2. Actor ingresa sus datos personales (nombre, apellidos, correo, contraseña, tipo de usuario, fecha de nacimiento)
  3. Actor ingresa su dirección (calle, número exterior, municipio, estado, código postal)
  4. Sistema valida los datos ingresados
  5. Sistema crea la cuenta y la dirección en la base de datos
  6. Sistema muestra mensaje de éxito
  7. Actor es redirigido a la página de login (NO hay login automático)

**2. Inicio de Sesión:**
- Descripción: El usuario accede al sistema con sus credenciales para poder realizar compras.
- Precondiciones:
  - El usuario tiene una cuenta registrada
  - El usuario no ha iniciado sesión
- Flujo:
  1. Actor accede a la página de login
  2. Actor ingresa correo y contraseña
  3. Sistema valida las credenciales
  4. Si son correctas: Sistema inicia sesión y redirige al catálogo
  5. Si son incorrectas: Sistema muestra mensaje de error y solicita reintentar

**3. Recuperación de Contraseña (NUEVO):**
- Descripción: El usuario solicita recuperar su contraseña mediante su correo electrónico.
- Precondiciones:
  - El usuario tiene una cuenta registrada
- Flujo:
  1. Actor accede a la página de recuperación de contraseña
  2. Actor ingresa su correo electrónico
  3. Sistema verifica que el correo exista
  4. Sistema genera un token de recuperación con expiración de 1 hora
  5. Sistema envía un correo electrónico con un enlace que contiene el ID del usuario y el token
  6. Sistema muestra mensaje de confirmación

**4. Restablecimiento de Contraseña (NUEVO):**
- Descripción: El usuario restablece su contraseña utilizando el enlace recibido por correo.
- Precondiciones:
  - El usuario ha solicitado recuperación de contraseña
  - El usuario tiene un token válido (no expirado)
- Flujo:
  1. Actor accede al enlace recibido por correo (contiene ID y token)
  2. Sistema valida que el token sea válido y no haya expirado
  3. Actor ingresa su nueva contraseña (debe cumplir requisitos de seguridad)
  4. Actor confirma la nueva contraseña
  5. Sistema actualiza la contraseña en la base de datos
  6. Sistema invalida el token
  7. Sistema muestra mensaje de éxito y redirige al login

**5. Cerrar Sesión:**
- Descripción: El usuario cierra su sesión activa en el sistema.
- Precondiciones:
  - El usuario ha iniciado sesión
- Flujo:
  1. Actor accede al menú principal
  2. Actor selecciona la opción de cerrar sesión
  3. Sistema elimina las credenciales del almacenamiento local
  4. Sistema redirige al catálogo

**6. Ver catálogo de productos:**
- Descripción: El usuario navega por el catálogo de juguetes disponibles.
- Precondiciones:
  - El sistema tiene productos disponibles
- Flujo:
  1. Actor accede al catálogo
  2. Sistema carga productos desde la base de datos (solo productos con cantidad > 0)
  3. Sistema muestra cada producto con sus datos (nombre, descripción, imagen, precio, cantidad disponible)
  4. Actor visualiza cada producto

**7. Agregar productos al carrito:**
- Descripción: El usuario añade un producto al carrito de compras.
- Precondiciones:
  - El usuario ha iniciado sesión (opcional, puede agregar sin sesión pero no puede comprar)
  - El producto está disponible en stock
- Flujo:
  1. Actor ve un producto específico en el catálogo
  2. Actor presiona el botón "Agregar al Carrito"
  3. Sistema verifica que hay stock disponible
  4. Sistema añade el producto al carrito
  5. Actor puede navegar a la sección de carrito para visualizar los productos agregados

**8. Modificar/Eliminar producto del carrito:**
- Descripción: El usuario elimina un producto de su carrito de compras.
- Precondiciones:
  - El usuario ha iniciado sesión
  - El carrito contiene al menos un producto
- Flujo:
  1. Actor está en la página del carrito
  2. Actor presiona el botón "Quitar" en un producto
  3. Sistema remueve el producto del carrito
  4. Sistema recalcula el total del carrito
  5. Sistema actualiza la vista del carrito

**9. Vaciar carrito:**
- Descripción: El usuario elimina todos los productos de su carrito.
- Precondiciones:
  - El carrito contiene al menos un producto
- Flujo:
  1. Actor está en la página del carrito
  2. Actor presiona el botón "Vaciar Carrito"
  3. Sistema elimina todos los productos del carrito
  4. Sistema muestra mensaje de confirmación

**10. Procesar Pago:**
- Descripción: El usuario realiza el pago de los productos en su carrito mediante PayPal.
- Precondiciones:
  - El usuario ha iniciado sesión
  - El carrito contiene al menos un producto
  - Todos los productos tienen stock disponible
- Flujo:
  1. Actor accede a su carrito
  2. Actor revisa el resumen de productos y totales
  3. Actor presiona el botón "Generar Compra y Recibo XML"
  4. Sistema redirige a la pasarela de pago PayPal
  5. Actor completa el pago en PayPal
  6. PayPal redirige de vuelta al sistema con el token de la orden
  7. Sistema captura la orden de PayPal
  8. Sistema verifica que el pago fue exitoso
  9. Sistema crea la compra y los pedidos en la base de datos
  10. Sistema genera y descarga automáticamente el recibo XML
  11. Sistema vacía el carrito
  12. Sistema muestra mensaje de éxito

**11. Agregar nuevo producto (administrador):**
- Descripción: El administrador agrega un nuevo producto al catálogo del sistema.
- Precondiciones:
  - El administrador ha iniciado sesión con permisos administrativos
- Flujo:
  1. Actor accede al panel de administración (inventario)
  2. Actor selecciona la opción de agregar productos
  3. Sistema muestra el formulario de producto nuevo
  4. Administrador ingresa los datos: nombre, descripción, precio, cantidad e imagen
  5. Sistema valida los datos ingresados
  6. Administrador presiona "Guardar producto"
  7. Sistema guarda el producto en la base de datos
  8. Sistema muestra mensaje de éxito y actualiza la lista

**12. Editar producto (administrador):**
- Descripción: El administrador edita la información de un producto existente.
- Precondiciones:
  - El administrador ha iniciado sesión con permisos administrativos
  - El producto existe en la base de datos
- Flujo:
  1. Actor accede al panel de administración
  2. Actor selecciona un producto específico para editar
  3. Sistema muestra el formulario con los datos actuales del producto
  4. Administrador modifica uno o más campos (nombre, descripción, precio, cantidad, imagen)
  5. Sistema valida los datos modificados
  6. Administrador presiona "Guardar"
  7. Sistema actualiza el producto en la base de datos
  8. Sistema muestra mensaje de éxito y actualiza la lista

**13. Eliminar producto (administrador):**
- Descripción: El administrador elimina un producto del catálogo.
- Precondiciones:
  - El administrador ha iniciado sesión con permisos administrativos
  - El producto existe en la base de datos
- Flujo:
  1. Actor accede al panel de administración
  2. Actor selecciona un producto específico
  3. Actor presiona el botón "Eliminar"
  4. Sistema muestra mensaje de confirmación "¿Estás seguro de que deseas eliminar el producto?"
  5. Administrador confirma la acción
  6. Sistema verifica que el producto no esté asociado a pedidos existentes
  7. Si no está asociado: Sistema elimina el producto de la base de datos
  8. Si está asociado: Sistema muestra mensaje de error indicando que no se puede eliminar
  9. Sistema muestra mensaje de éxito/error y actualiza la lista

---

## 6. Anexos y glosario

### Mapa de navegación:

[Ver sección 5.3]

### Wireframe:

[Se mantiene igual]

### Diagrama UML:

[Ver sección 5.5]

### Casos de uso:

[Ver sección 5.6]

### Glosario:

**API (Application Programming Interface):** Conjunto de definiciones y protocolos que permiten la comunicación entre diferentes componentes de software. En el proyecto se utiliza para conectar el frontend con el backend y servicios externos.

**Autenticación:** Proceso de verificación de la identidad de un usuario mediante credenciales (correo electrónico y contraseña) para acceder al sistema.

**Carrito de compras:** Funcionalidad que permite a los usuarios almacenar temporalmente productos seleccionados antes de realizar la compra.

**CRUD:** Acrónimo de Create (Crear), Read (Leer), Update (Actualizar) y Delete (Eliminar). Operaciones básicas para gestionar datos en una base de datos.

**CSS3 (Cascading Style Sheets 3):** Lenguaje de hojas de estilo utilizado para definir la presentación visual de documentos HTML.

**DER (Diagrama Entidad-Relación):** Representación gráfica que muestra las entidades del sistema y las relaciones entre ellas en la base de datos.

**E-commerce:** Comercio electrónico. Sistema de compra y venta de productos o servicios a través de internet.

**Frontend:** Parte visible de la aplicación con la que interactúa directamente el usuario. En este proyecto se desarrolla con Angular.

**Backend:** Parte del sistema que procesa la lógica de negocio, gestiona la base de datos y las operaciones del servidor.

**Git:** Sistema de control de versiones distribuido utilizado para rastrear cambios en el código fuente durante el desarrollo.

**HTML5 (HyperText Markup Language 5):** Lenguaje de marcado estándar utilizado para crear la estructura de páginas web.

**HTTPS (HyperText Transfer Protocol Secure):** Protocolo seguro de transferencia de hipertexto que cifra la comunicación entre el navegador y el servidor mediante SSL/TLS.

**Inventario:** Sistema de control y gestión de la cantidad disponible de productos en stock.

**IVA (Impuesto al Valor Agregado):** Impuesto del 16% que se aplica sobre el subtotal de la compra según la legislación fiscal mexicana.

**LFPDPPP (Ley Federal de Protección de Datos Personales en Posesión de los Particulares):** Legislación mexicana que regula el tratamiento legítimo, controlado e informado de datos personales.

**MySQL:** Sistema de gestión de bases de datos relacional de código abierto utilizado para almacenar y gestionar toda la información del sistema.

**Pasarela de pago:** Servicio externo (PayPal) que procesa de forma segura las transacciones con tarjetas de crédito/débito.

**PayPal:** Plataforma de pagos en línea que permite realizar transacciones de forma segura sin compartir información financiera.

**Pedido:** Solicitud de compra generada tras una transacción exitosa, identificada con un número único.

**Responsive:** Diseño web que se adapta automáticamente a diferentes tamaños de pantalla (móvil, tablet, desktop).

**RF (Requerimiento Funcional):** Especificación que describe una funcionalidad o comportamiento específico que debe tener el sistema.

**RNF (Requerimiento No Funcional):** Especificación que describe atributos de calidad del sistema como rendimiento, seguridad, usabilidad, etc.

**Sanitización de datos:** Proceso de limpieza y validación de datos de entrada para prevenir ataques de seguridad como SQL Injection y XSS.

**Sesión:** Período de tiempo durante el cual un usuario autenticado interactúa con el sistema sin necesidad de volver a iniciar sesión.

**SQL (Structured Query Language):** Lenguaje estándar para gestionar y manipular bases de datos relacionales.

**SQL Injection:** Técnica de ataque que explota vulnerabilidades en aplicaciones web mediante la inserción de código SQL malicioso.

**Stock:** Cantidad disponible de un producto en el inventario.

**Token de recuperación:** Código único generado por el sistema con tiempo de expiración limitado, utilizado para restablecer contraseñas de forma segura.

**XML (eXtensible Markup Language):** Lenguaje de marcado que define un conjunto de reglas para codificar documentos en un formato legible tanto por humanos como por máquinas. En este proyecto se utiliza para generar recibos de compra.

---

## NOTAS DE CORRECCIÓN

Este documento ha sido corregido para reflejar fielmente la implementación real del sistema. Las principales correcciones incluyen:

1. Actualización del DER con campos faltantes (administrador, resetPasswordToken, resetPasswordExpires, imagen)
2. Corrección del mapa de navegación (eliminación de rutas inexistentes, adición de rutas faltantes)
3. Adición de casos de uso para recuperación y restablecimiento de contraseña
4. Corrección de requerimientos funcionales (tipo de usuario, flujo de recuperación de contraseña)
5. Actualización de la especificación XML para reflejar el formato real del sistema
6. Corrección del diagrama UML con atributos faltantes y cardinalidades correctas



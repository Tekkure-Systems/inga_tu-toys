# CORRECCIONES AL DOCUMENTO SRS - Sistema Imagu Toys

## ANÁLISIS DE DISCREPANCIAS ENTRE EL SRS Y EL SISTEMA REAL

### 1. BASE DE DATOS (DER vs SQL Real)

#### Discrepancias encontradas:

**Tabla `cliente`:**
- ❌ **FALTA en DER**: Campo `administrador` (BOOLEAN/TINYINT) - Usado para determinar si el usuario es administrador
- ❌ **FALTA en DER**: Campos `resetPasswordToken` (VARCHAR) y `resetPasswordExpires` (DATETIME) - Usados para recuperación de contraseña

**Tabla `direccion`:**
- ⚠️ **DIFERENCIA**: El DER muestra `ciudad` pero el SQL real tiene `municipio`
- ✅ El DER muestra `estado` y el SQL lo tiene correctamente

**Tabla `producto`:**
- ❌ **FALTA en DER**: Campo `imagen` (VARCHAR) - Almacena la URL o ruta de la imagen del producto

#### Correcciones necesarias en el DER:
1. Agregar campo `administrador` a la entidad `Cliente`
2. Agregar campos `resetPasswordToken` y `resetPasswordExpires` a la entidad `Cliente`
3. Cambiar `ciudad` por `municipio` en la entidad `Direccion`
4. Agregar campo `imagen` a la entidad `Producto`

---

### 2. MAPA DE NAVEGACIÓN

#### Discrepancias encontradas:

**Rutas en el documento:**
- home → sign up → login → carrito → pago → catalogo

**Rutas reales del sistema:**
- catalogo (página principal, redirige desde '/')
- register (no "sign up")
- login
- carrito
- forgot-password (FALTA en el documento)
- reset-password (FALTA en el documento)
- inventario (FALTA en el documento, solo para administradores)

**Problemas identificados:**
1. ❌ No existe página "home" separada - el catálogo es la página principal
2. ❌ No existe página "pago" separada - el pago se procesa directamente desde el carrito vía PayPal
3. ❌ Faltan rutas: forgot-password, reset-password, inventario
4. ⚠️ La ruta se llama "register" no "sign up"

#### Correcciones necesarias:
- Eliminar "home" y "pago" del mapa
- Agregar "forgot-password" y "reset-password"
- Agregar "inventario" (con restricción de acceso para administradores)
- Cambiar "sign up" por "register"
- El catálogo debe ser el punto de entrada principal

---

### 3. CASOS DE USO

#### Discrepancias encontradas:

**Casos de uso faltantes:**
1. ❌ **Recuperación de contraseña (Forgot Password)**: El sistema tiene esta funcionalidad pero no está documentada
2. ❌ **Restablecimiento de contraseña (Reset Password)**: El sistema tiene esta funcionalidad pero no está documentada

**Casos de uso existentes que necesitan corrección:**
- El caso de uso de "Registro de usuario" muestra "login automático" pero el sistema real no lo hace automáticamente

#### Correcciones necesarias:
- Agregar caso de uso para "Recuperar contraseña"
- Agregar caso de uso para "Restablecer contraseña"
- Corregir el flujo de registro (no hay login automático)

---

### 4. REQUERIMIENTOS FUNCIONALES

#### Discrepancias encontradas:

**RQF1 - Registro:**
- ⚠️ El documento dice "tipo de usuario (Administrador o Cliente)" pero el sistema real usa "Administrador o Miembro"

**RQF6 y RQF7 - Recuperación de contraseña:**
- ❌ El documento dice que el sistema envía la contraseña al correo, pero el sistema real envía un token de recuperación con un enlace para restablecer la contraseña

**RQF19 - Descarga de factura:**
- ⚠️ El documento menciona "factura" pero el sistema genera un "recibo XML" en formato simple, no un CFDI 4.0 completo como se especifica en la sección de interfaces

#### Correcciones necesarias:
- RQF1: Cambiar "Cliente" por "Miembro"
- RQF6-RQF7: Corregir el flujo de recuperación de contraseña (usa token, no envía contraseña directamente)
- RQF19: Aclarar que se genera un recibo XML en formato simple, no CFDI 4.0 completo

---

### 5. REQUERIMIENTOS NO FUNCIONALES

#### Discrepancias encontradas:

**RQNF16 - Generación de factura:**
- ❌ El documento especifica formato CFDI 4.0 completo con todos los elementos del SAT, pero el sistema real genera un XML simple con estructura `<recibo>` que contiene:
  - fecha
  - id_compra
  - productos (con id, nombre, cantidad, precio, subtotal, descripción)
  - subtotal
  - iva
  - total

#### Correcciones necesarias:
- RQNF16: Actualizar para reflejar el formato XML real del sistema (formato simple de recibo, no CFDI 4.0 completo)

---

### 6. INTERFACES - ESPECIFICACIÓN XML

#### Discrepancias encontradas:

**El documento muestra:**
- Estructura CFDI 4.0 completa con namespaces del SAT
- Elementos como Emisor, Receptor, Conceptos con impuestos, etc.

**El sistema real genera:**
- XML simple con estructura `<recibo>` sin namespaces del SAT
- Formato más simple y directo

#### Correcciones necesarias:
- Actualizar la especificación XML para reflejar el formato real del sistema
- Mantener la estructura simple que realmente se genera

---

### 7. DIAGRAMA UML

#### Discrepancias encontradas:

**Clase `Cliente`:**
- ❌ Falta atributo `administrador` (o campo booleano para tipo de usuario)
- ❌ Faltan atributos `resetPasswordToken` y `resetPasswordExpires`

**Clase `Producto`:**
- ❌ Falta atributo `imagen`

**Relaciones:**
- ⚠️ La relación Cliente-Compra en el UML muestra 0..* a 0..* (muchos a muchos) pero en realidad es 1 a muchos (un cliente puede tener muchas compras, pero una compra pertenece a un cliente)

#### Correcciones necesarias:
- Agregar atributos faltantes en las clases
- Corregir la cardinalidad de la relación Cliente-Compra a 1..* a 0..*

---

## RESUMEN DE CORRECCIONES PRIORITARIAS

### CRÍTICAS (Deben corregirse):
1. ✅ Agregar campo `administrador` al DER y UML
2. ✅ Corregir mapa de navegación (eliminar home/pago, agregar forgot-password/reset-password/inventario)
3. ✅ Agregar casos de uso para recuperación y restablecimiento de contraseña
4. ✅ Corregir RQF6-RQF7 sobre recuperación de contraseña
5. ✅ Actualizar especificación XML para reflejar formato real

### IMPORTANTES (Recomendadas):
1. ✅ Agregar campos `resetPasswordToken` y `resetPasswordExpires` al DER
2. ✅ Agregar campo `imagen` a Producto en DER
3. ✅ Cambiar "ciudad" por "municipio" en Direccion
4. ✅ Corregir RQF1 (tipo de usuario: "Miembro" no "Cliente")
5. ✅ Corregir cardinalidad Cliente-Compra en UML

### MENORES (Opcionales):
1. ⚠️ Actualizar glosario si es necesario
2. ⚠️ Revisar que todos los requerimientos estén implementados



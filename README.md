# Workshop de AVS con EigenLayer

## Objetivo

¡Bienvenida/o a mi primer workshop! Te enseñaré la funcionalidad más simple que puedes esperar de un AVS para que comiences a familiarizarte con EigenLayer.

- [Slides](https://www.canva.com/design/DAGjf7IMZ8M/COIBud6aTnvLyEVUjirVMw/view?utm_content=DAGjf7IMZ8M&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h5eb5cb77c1)
- [Video en español](https://youtu.be/ScvZ0bDRXoY)
- Sígueme en X: [@Ariiellus](https://x.com/Ariiellus)

## Arquitectura

![Arquitectura AVS](https://raw.githubusercontent.com/Layr-Labs/hello-world-avs/master/assets/hello-world-diagramv2.png)

### Flujo de Usuario del AVS

En este tutorial crearemos un servicio que genera una palabra, añade "Hello" y verifica que la acción ha ocurrido correctamente. El flujo de usuario es el siguiente:

1. El consumidor del AVS solicita que se genere y firme un mensaje de "Hello World".
2. El contrato HelloWorld recibe la solicitud y emite un evento `NewTaskCreated` para la petición.
3. Todos los operadores registrados en el AVS que han hecho staking y delegado activos toman esta solicitud. El operador genera el mensaje solicitado, lo convierte en un hash y firma ese hash con su clave privada.
4. Cada operador envía su hash firmado de vuelta al contrato HelloWorld AVS.
5. Si el operador está registrado en el AVS y tiene el stake mínimo requerido, el envío es aceptado.

Eso es todo. Este flujo simple resalta algunos de los mecanismos clave de cómo funcionan los AVS.

### Penalizaciones (Slashing)

> ⚠️ **Advertencia:**  
Este ejemplo no utiliza el nuevo flujo de trabajo del set de operadores. Consulta [ELIP-002](https://github.com/Layr-Labs/eigenlayer/blob/main/elips/ELIP-002.md) para más detalles. Para un ejemplo del nuevo flujo, revisa los ejemplos de Incredible Squaring ([versión en Go](https://github.com/Layr-Labs/incredible-squaring-go), [versión en Rust](https://github.com/Layr-Labs/incredible-squaring-rs)).

Este ejemplo incluye una condición simple de penalización: **una tarea DEBE ser respondida por suficientes operadores antes de que hayan pasado N bloques desde la creación de la tarea**. Puedes modificar el valor `OPERATOR_RESPONSE_PERCENTAGE` en el archivo `.env` para ajustar la probabilidad de que un operador responda una tarea. Si esta condición no se cumple, cualquier persona puede penalizar al operador llamando a `HelloWorldServiceManager.slashOperator`.

## Despliegue Local en Devnet

Esta sección describe los herramientas necesarias para el desarrollo local.

Primero copiaremos el [repo de EigenLayer](https://github.com/Layr-Labs/hello-world-avs):

```sh
git clone https://github.com/Layr-Labs/hello-world-avs.git
cd hello-world-avs
```

### Entorno de Desarrollo

Después instalaremos las herramientas necesarias para el desarrollo local:

```sh
# Instalar dependencias del proyecto:
npm install

# Instalar Foundry
curl -L https://foundry.paradigm.xyz | bash

# Instalar Ethers
npm install ethers
```

Otras herramientas necesarias son:

- [Node](https://nodejs.org/en/download/)
- [Typescript](https://www.typescriptlang.org/download)
- [ts-node](https://www.npmjs.com/package/ts-node)
- [tcs](https://www.npmjs.com/package/tcs#installation)

## Inicio Rápido

### Iniciar una cadena local con Anvil

En la terminal #1, ejecuta los siguientes comandos:

```sh
# Iniciar la cadena local con Anvil
npm run start:anvil
```

### Desplegar contratos e iniciar el Operador

En la terminal #2 desplegaremos los contratos de EigenLayer y el contrato HelloWorld en la cadena local:

```sh
# Configurar archivo .env
cp .env.example .env
cp contracts/.env.example contracts/.env

# Actualizar dependencias si es necesario y compilar los contratos
npm run build:forge

# Desplegar contratos de EigenLayer
npm run deploy:core

# Desplegar contratos del AVS Hello World
npm run deploy:hello-world

# (Opcional) Actualizar las ABIs
npm run extract:abis

# Iniciar la aplicación del operador
npm run start:operator
```

### Crear tareas del AVS Hello World

En la terminal #3 crearemos tareas de Hello World que se enviarán a los operadores:

```sh
# Iniciar la aplicación createNewTasks
npm run start:traffic
```

### Crear y reclamar distribuciones

Algunas otras tareas que puedes probar son la distribución de recompensas a los operadores por las tareas realizadas.

En otra terminal:

```sh
# Crear raíces de distribución
npm run create-distributions-root

# Reclamar la distribución
npm run claim-distributions
```

Distribución dirigida por operador:

```sh
# Crear raíces de distribución dirigidas por el operador
npm run create-operator-directed-distributions-root

# Reclamar la distribución
npm run claim-distributions
```

## ¿Qué más podemos construir?

Intentemos crear un [servicio de oráculo](https://docs.wavs.xyz/tutorial/1-overview) que toma los datos del precio de Bitcoin desde CoinMarketCap.

El servicio cuenta con 3 partes básicas:

1. Un trigger: Cualquier evento emitido por un contrato. Este evento desencadena un servicio. En este ejemplo el trigger transmitirá la información del ID de un activo de CoinMarketCap.
2. Un componente de servicio: El componente de servicio contiene la lógica del servicio. En este ejemplo el componente de servicio se encargara de obtener el precio del activo de CoinMarketCap y enviarlo en formato JSON.

3. Un contrato de servicio: Este contrato contiene la lógica de validación y almacenamiento de la información obtenida del componente de servicio. Cuando un operador enviá una respuesta, el contrato de servicio verificara la integridad de la información y la asociara con el ID del trigger.

Estas partes se utilizan para crear un servicio de oráculo mediante WAVS.

### Configurando el sistema

Para configurar el sistema, debes tener instalado las [siguientes herramientas](https://docs.wavs.xyz/tutorial/2-setup):

- Foundry
- Docker
- Make
- JQ
- Rust
- Cargo

### Creando un servicio de oráculo

Para crear un servicio de oráculo, sigue estos pasos:

Abre una terminal y ejecuta el siguiente comando:

```sh
forge init --template Lay3rLabs/wavs-foundry-template my-wavs --branch 0.3
cd my-wavs
```

Instala dependencias y construye el contrato junto con los testes correspondientes:

```sh
# Instala dependencias
make setup

# Construye los contratos
forge build

# Realiza los tests
forge test
```

Construyamos y probemos los componentes:

```sh
make wasi-build
```

Testing y debugging local:

```sh
# El ID de Bitcoin es 1. No se guardará en el contrato, solo se muestra la salida del componente
COIN_MARKET_CAP_ID=1 make wasi-exec
```

Corre el servicio de oráculo:

```sh
cp .env.example .env

# Inicia una Anvil chain y despliega los contratos de EigenLayer
make start-all
```

En una nueva terminal desplegaremos nuestros contratos WavsSubmit.sol & WavsTrigger.sol:

```sh
export SERVICE_MANAGER_ADDR=`make get-eigen-service-manager-from-deploy`
forge script ./script/Deploy.s.sol ${SERVICE_MANAGER_ADDR} --sig "run(string)" --rpc-url http://localhost:8545 --broadcast
```

Despliega tu servicio y actívalo:

```sh
make deploy-service

export COIN_MARKET_CAP_ID=1
export SERVICE_TRIGGER_ADDR=`make get-trigger-from-deploy`
forge script ./script/Trigger.s.sol ${SERVICE_TRIGGER_ADDR} ${COIN_MARKET_CAP_ID} --sig "run(string,string)" --rpc-url http://localhost:8545 --broadcast -v 4

# Muestra el último TriggerId y muestra el resultado mediante `script/ShowResult.s.sol`
make show-result
```

## Ayuda y Soporte

Si necesitas ayuda para desplegar o modificar este repositorio para tu AVS:

1. Abre un ticket en [support.eigenlayer.xyz](https://support.eigenlayer.xyz)
2. Proporciona:
   - Stacktrace completo
   - Repositorio mínimo con el error
   - Pasos para reproducirlo
   - Para Holesky: asegúrate de verificar tus contratos con `forge verify-contract`

## Contacta al equipo de EigenLayer

¿Planeas construir un AVS y quieres hablar con el equipo DevRel de EigenLayer? Llena este formulario: [EigenLayer AVS Intro Call](https://share.hsforms.com/1BksFoaPjSk2l3pQ5J4EVCAein6l)

## Avisos

- Este repositorio está enfocado en pruebas locales con Anvil. Soporte para Holesky será añadido pronto.
- Para producción, se recomienda usar una arquitectura BLS basada en [RegistryCoordinator](https://github.com/Layr-Labs/eigenlayer-middleware/blob/dev/docs/RegistryCoordinator.md).

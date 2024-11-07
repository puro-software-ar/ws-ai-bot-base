---
title: Agente con AI whatsapp bot - Puro Software
emoji: 🚀
colorFrom: purple
colorTo: red
sdk: docker
pinned: false
license: mit
app_port: 3008
---

# 🤖 Bot de WhatsApp con GPT-4 usando Hugging Face Spaces

Bienvenido a la configuración de tu bot de WhatsApp, impulsado por GPT-4 y configurado en un espacio de Hugging Face. Este bot recibirá y responderá mensajes automáticamente usando inteligencia artificial, perfecto para gestionar consultas y pedidos de clientes en WhatsApp.

## 🚀 Descripción General

Este repositorio proporciona un entorno para crear un bot de WhatsApp utilizando un servidor ya integrado y conectándolo con un asistente de OpenAI (GPT-4). Al duplicar este espacio, podrás conectar tu propio número de WhatsApp y configurar un asistente GPT personalizado para responder a los mensajes.

## 📝 Requisitos

- **Cuenta de Hugging Face**: [Crea tu cuenta aquí](https://huggingface.co/join)
- **Cuenta de OpenAI**: [Regístrate aquí](https://platform.openai.com/signup)
- **API Key de OpenAI**: Necesaria para conectarse al asistente GPT.

## 🛠 Instrucciones de Configuración

### Paso 1: Duplicar este espacio en Hugging Face

1. Haz clic en el botón **"Duplicate Space"** en la parte superior de esta página.
2. Asigna un nombre único para tu espacio.
3. Selecciona el hardware “CPU” (es gratuito y suficiente para este proyecto).
4. Haz clic en **"Duplicate"** para crear una copia de este espacio en tu cuenta.

### Paso 2: Configurar las Variables de Entorno (ENVs)

Este espacio requiere dos variables de entorno para funcionar correctamente.

1. Abre la configuración del espacio en la sección **Settings** o **Configuración**.
2. En la sección **Environment Variables**, agrega las siguientes variables:
   - `openai_api_key`: Ingresa tu clave de API de OpenAI (creada en tu cuenta de OpenAI).
   - `assistant_id`: Este es el identificador único de tu asistente GPT en OpenAI (detallado en el siguiente paso).

### Paso 3: Crear un Asistente GPT en OpenAI

1. En tu cuenta de OpenAI, accede a la **API Playground**.
2. Crea un nuevo asistente y dale un nombre (por ejemplo, “AsistentePedidosWhatsApp”).
3. Copia el `assistant_id` que aparece en la configuración del asistente y agrégalo como variable de entorno en Hugging Face.
4. Diseña el **prompt** de tu asistente en OpenAI. Este prompt guiará el comportamiento del bot. Ejemplo de prompt:
   - *"Eres un asistente para una tienda que responde preguntas y toma pedidos de clientes en WhatsApp de manera amigable y profesional."*

### Paso 4: Conectar tu Número de WhatsApp

1. Una vez que el espacio esté en funcionamiento, ve a la URL proporcionada (por ejemplo, `https://nombre-del-espacio.hf.space`).
2. Escanea el código QR que se muestra en la página usando **WhatsApp Web** desde tu teléfono.
3. Tu número de WhatsApp ahora está conectado y listo para recibir mensajes.

## 📈 Pruebas y Ajustes

1. Envía un mensaje de prueba a tu número de WhatsApp.
2. El bot debería responder automáticamente a tu mensaje, utilizando las instrucciones que hayas configurado en el prompt.
3. Si necesitas modificar las respuestas del asistente, ajusta el prompt en OpenAI y guarda los cambios.

## 📌 Nota

- Este espacio utiliza la infraestructura gratuita de Hugging Face. Si necesitas soporte para mayor volumen de mensajes, considera actualizar a un espacio con mayor capacidad.
- Asegúrate de mantener segura tu clave de API de OpenAI.

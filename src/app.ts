import "dotenv/config"
import { createBot, createProvider, createFlow, addKeyword, EVENTS } from '@builderbot/bot'
import { MemoryDB } from '@builderbot/bot'
import { BaileysProvider } from '@builderbot/provider-baileys'
import { httpInject } from "@builderbot-plugins/openai-assistants"
import { createMessageQueue, QueueConfig } from "./utils/fast-entries"
import { processResponse } from "./utils/process-response"
import { assistantResponse } from "./utils/openai"
import axios from "axios"
import { typing } from "./utils/presence"

/** Puerto en el que se ejecutará el servidor */
const PORT = process.env.PORT ?? 3008
/** ID del asistente de OpenAI */
const userQueues = new Map();
const userLocks = new Map(); // New lock mechanism

const queueConfig: QueueConfig = { gapMilliseconds: Number(process.env.TIEMPO_ESPERA_ANTES_DE_RESPONDER ?? 0) };
const enqueueMessage = createMessageQueue(queueConfig);

/**
 * Function to process the user's message by sending it to the OpenAI API
 * and sending the response back to the user.
 */
const processUserMessage = async (ctx, { flowDynamic, state, provider }) => {
    let message = ctx.body;
    const userPhone = ctx.from;
    const userName = ctx.name

    const disabled_for = process.env.MENOS_CONTACTOS
    const enabled_for = process.env.SOLO_CONTACTOS

    if(disabled_for && String(disabled_for).includes(',') && String(disabled_for).split(',').some((num) => userPhone.includes(num))) {
        return;
    }
    if(enabled_for && String(disabled_for).includes(',') && !String(disabled_for).split(',').some((num) => userPhone.includes(num))) {
        return;
    }

    console.log({ctx, state, provider})
    console.log(provider.vendor)

    const messageReferencesTo = ctx?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation
    if(messageReferencesTo) {
        message = `${messageReferencesTo} \n${message}`
    }

    console.log(`${userPhone}: ${message}`)

    let response = ''
    try {
        await typing(ctx, provider)
        const whatsappUserData = { userPhone, userName };
        response = await assistantResponse({ message, whatsappUserData });
    } catch (error) {
        if(!process.env.NUMBER_REPORTER)
            throw new Error('No number reporter provided')

        if(axios.isAxiosError(error) && error.status === 504) {
            return;
        }
        response = 'No pudimos generar la respuesta, intente nuevamente.'
    }

    await processResponse(response, flowDynamic)
};


/**
 * Function to handle the queue for each user.
 */
const handleQueue = async (userId) => {
    const queue = userQueues.get(userId);
    
    if (userLocks.get(userId)) {
        return; // If locked, skip processing
    }

    while (queue.length > 0) {
        userLocks.set(userId, true); // Lock the queue
        const { ctx, flowDynamic, state, provider } = queue.shift();
        try {
            await processUserMessage(ctx, { flowDynamic, state, provider });
        } catch (error) {
            console.error(`Error processing message for user ${userId}:`, error);
        } finally {
            userLocks.set(userId, false); // Release the lock
        }
    }

    userLocks.delete(userId); // Remove the lock once all messages are processed
    userQueues.delete(userId); // Remove the queue once all messages are processed
};

/**
 * Flujo de bienvenida que maneja las respuestas del asistente de IA
 * @type {import('@builderbot/bot').Flow<BaileysProvider, MemoryDB>}
 */
const welcomeFlow = addKeyword<BaileysProvider, MemoryDB>(EVENTS.WELCOME)
    .addAction(async (ctx, { flowDynamic, state, provider }) => {
        try {
            enqueueMessage(ctx, async (body) => {
                const userId = ctx.from; // Use the user's ID to create a unique queue for each user
                ctx.body = body
                
                if (!userQueues.has(userId)) {
                    userQueues.set(userId, []);
                }

                const queue = userQueues.get(userId);
                queue.push({ ctx, flowDynamic, state, provider });

                // If this is the only message in the queue, process it immediately
                if (!userLocks.get(userId) && queue.length === 1) {
                    await handleQueue(userId);
                }
            });
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

/**
 * Flujo de mensajes que no son texto
 * @type {import('@builderbot/bot').Flow<BaileysProvider, MemoryDB>}
 */

const otherMessagesFlow = 
    addKeyword([EVENTS.DOCUMENT, EVENTS.LOCATION, EVENTS.MEDIA, EVENTS.VOICE_NOTE])
    .addAnswer('Como asistente virtual no estoy preparado para recibir ese tipo de mensajes.\nSi puedes, *escribelo* para lo entienda!')


/**
 * Función principal que configura y inicia el bot
 * @async
 * @returns {Promise<void>}
 */
const main = async () => {
    /**
     * Flujo del bot
     * @type {import('@builderbot/bot').Flow<BaileysProvider, MemoryDB>}
     */
    const adapterFlow = createFlow([welcomeFlow, otherMessagesFlow]);

    /**
     * Proveedor de servicios de mensajería
     * @type {BaileysProvider}
     */
    const adapterProvider = createProvider(BaileysProvider, {
        groupsIgnore: true,
        readStatus: true,
    });

    const adapterDB = new MemoryDB() 

    /**
     * Configuración y creación del bot
     * @type {import('@builderbot/bot').Bot<BaileysProvider, MemoryDB>}
     */
    const { httpServer, handleCtx } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    });

    adapterProvider.server.post('/v1/messages', handleCtx(async (bot, req, res) => {
        const { number, message } = req.body;
        await bot.sendMessage(number, message, {})
        return res.end('send');
    }));


    httpInject(adapterProvider.server);
    httpServer(+PORT);
};

main();

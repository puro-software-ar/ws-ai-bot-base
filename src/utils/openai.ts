import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

type AssistantResponseArgs = {
  message: string, 
  whatsappUserData: {
    userPhone: string,
    userName: string
  }
}

const threadIds:Record<string, string> = {}

// Función para llamar a la API de OpenAI
export async function assistantResponse({ message, whatsappUserData }: AssistantResponseArgs) {
  const { userPhone, userName } = whatsappUserData
  console.log(`Chat function called with userPhone: ${userPhone}, message: ${message}, userName: ${userName}`);

  let threadId = threadIds[userPhone]

  if (!threadId) {
    // Crear un nuevo thread si no existe
    console.log('Creating a new conversation...');
    const thread = await openai.beta.threads.create();
    threadId = thread.id;
    threadIds[userPhone] = threadId
  }

  // Check if there's an active run for this thread
  console.log('Checking for active runs...');
  const runs = await openai.beta.threads.runs.list(threadId);
  const activeRun = runs.data.find(run => ['in_progress', 'queued', 'requires_action'].includes(run.status));

  if (activeRun) {
    console.log(`Found active run: ${activeRun.id}. Cancelling...`);
    await openai.beta.threads.runs.cancel(threadId, activeRun.id);
    console.log('Active run cancelled.');
  }

  // Añadir el mensaje del usuario al thread
  console.log(`Adding user message to thread: ${userName}: ${message}`);
  await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: `${userName}: ${message}`,
  })

  // Ejecutar el asistente
  console.log('Executing assistant...');
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: ASSISTANT_ID,
  })

  // Esperar a que el asistente complete la ejecución
  console.log('Waiting for assistant to complete execution...');
  let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id)

  while (runStatus.status !== 'completed') {
    console.log(`Current run status: ${runStatus.status}`);
    await new Promise(resolve => setTimeout(resolve, 1000))
    runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id)
  }

  // Obtener la respuesta del asistente
  console.log('Retrieving assistant response...');
  const messages = await openai.beta.threads.messages.list(threadId)
  const assistantMessage = messages.data[0].content[0]

  if (assistantMessage.type === 'text') {
    console.log('Assistant response received:', assistantMessage.text.value);
    return assistantMessage.text.value
  }

  console.log('No valid response received from assistant.');
  return 'No se pudo obtener una respuesta válida del asistente.'
}
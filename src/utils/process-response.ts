export async function processResponse(response, flowDynamic:any) {
  // Split the response into chunks and send them sequentially
  const chunks = response.split(/\n\n+/);
  for (const chunk of chunks) {
      // Trim and clean each chunk
      let cleanedChunk = chunk.trim().replace(/【.*?】/g, ""); // Updated to remove the entire 【4:0†source】 part

      // Replace [text](URL) format with just the URL
      cleanedChunk = cleanedChunk.replace(/\[.*?\]\((https?:\/\/.*?)\)/g, '$1');

      // Replace ** with *
      cleanedChunk = cleanedChunk.replace(/\*\*/g, '`');

      // Si el chunk contiene ###, tomar el texto desde ### hasta \n y encerrarlo entre *
      const specialTextMatch = cleanedChunk.match(/###(.*?)\n/);
      if (specialTextMatch) {
          const specialText = specialTextMatch[1].trim();
          cleanedChunk = cleanedChunk.replace(specialTextMatch[0], `*${specialText}*\n`);
      }

      // Extract image links
      const imageLinks = cleanedChunk.match(/https:\/\/storage\.googleapis\.com\/[^\s]+/g);

      // Remove links that start with '!'
      cleanedChunk = cleanedChunk.replace(/!https:\/\/[^\s]+/g, '');

      if (imageLinks) {
          for (const link of imageLinks) {
            // 1. Extract the link
            if(cleanedChunk.includes(`!${link}`)) {
                cleanedChunk = cleanedChunk.replace(`!${link}`, '');
            } else {
                cleanedChunk = cleanedChunk.replace(link, '');
            }
            // 2. Validate the link
            // Send the original message without the link
            if (cleanedChunk.trim()) {
                await flowDynamic([{ body: cleanedChunk.trim(), media: link }]);
            } else {
                await flowDynamic([{ body: '📷', media: link }]);
            }
            // Send the image in a separate message
          }
      } else {
          // If no image links, send the message as is
          if (cleanedChunk.trim()) {
              await flowDynamic([{ body: cleanedChunk.trim() }]);
          }
      }
  }
}
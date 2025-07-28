const backendUrl: string | undefined = process.env.REACT_APP_BASE_URL;


export async function ChatCreation(
    chatSessionName: string,
    userId: string
): Promise<void> {
    const body = {
        chatSessionName,
        userId,
    };

    const response = await fetch(`${backendUrl}/chats`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        console.error(`Request failed with status ${response.status}`);
        return;
    }

    const jsonData = await response.json();
    localStorage.setItem("chatId", jsonData?.chatSession?.id)
}


export const ChatResponse = async (
  chatId: string,
  prompt: string,
  userId: string,
  token: string
): Promise<string> => {
  const res = await fetch(`${backendUrl}/chat/${chatId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ input: prompt, userId, useraccesstoken: token })
  });

  const jsonData = await res.json();

  return jsonData?.message?.content || "Sorry, I couldn't find an answer.";
};

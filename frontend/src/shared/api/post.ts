import { ServerErrorType } from "./types";

export async function postData<T>(url: string, data: T) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });
    if (!response.ok) {
      const errorData = (await response.json()) as ServerErrorType;
      throw new Error(errorData.message, {
        cause: response.status as number,
      });
    }
    return { success: true };
  } catch (err) {
    console.error(err);
    throw err;
  }
}

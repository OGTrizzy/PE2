// used this to get api key

//import { API_AUTH_KEY, API_KEY } from "./auth.js";
//
//function load() {
//  return localStorage.getItem("token");
//}
//
//export async function getKey(name) {
//  const token = load();
//  if (!token) {
//    return {
//      success: false,
//      error: "You must be logged in to create an API key.",
//    };
//  }
//
//  try {
//    const response = await fetch(API_AUTH_KEY, {
//      method: "POST",
//      headers: {
//        "Content-Type": "application/json",
//        Authorization: `Bearer ${token}`,
//        "X-Noroff-API-Key": API_KEY,
//      },
//      body: JSON.stringify({
//        name: name,
//      }),
//    });
//
//    if (!response.ok) {
//      const errorData = await response.json();
//      throw new Error(
//        `Failed to create API key: ${errorData.message || response.statusText}`
//      );
//    }
//
//    const data = await response.json();
//    const apiKey = data.data.key;
//
//    console.log("Your API Key:", apiKey);
//    localStorage.setItem("apiKey", apiKey);
//
//    return {
//      success: true,
//      data: { key: apiKey },
//    };
//  } catch (error) {
//    console.error("Error creating API key:", error);
//    return {
//      success: false,
//      error: error.message,
//    };
//  }
//}

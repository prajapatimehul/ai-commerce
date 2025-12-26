import { type NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createGateway } from "@ai-sdk/gateway";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";

const MAX_PROMPT_LENGTH = 500;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface GenerateDesignResponse {
  success: boolean;
  designUrl?: string;
  prompt?: string;
  error?: string;
}

interface ErrorResponse {
  error: string;
  message?: string;
  details?: string;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.AI_GATEWAY_API_KEY;

    if (!apiKey) {
      return NextResponse.json<ErrorResponse>(
        {
          error: "Configuration error",
          details:
            "No AI Gateway API key configured. Please add AI_GATEWAY_API_KEY to environment variables.",
        },
        { status: 500 },
      );
    }

    const formData = await request.formData();
    const prompt = formData.get("prompt") as string;
    const tshirtImageUrl = formData.get("tshirtImageUrl") as string;

    // Validate inputs
    if (!prompt?.trim()) {
      return NextResponse.json<ErrorResponse>(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    if (prompt.length > MAX_PROMPT_LENGTH) {
      return NextResponse.json<ErrorResponse>(
        {
          error: `Prompt too long. Maximum ${MAX_PROMPT_LENGTH} characters allowed.`,
        },
        { status: 400 },
      );
    }

    if (!tshirtImageUrl) {
      return NextResponse.json<ErrorResponse>(
        { error: "T-shirt image URL is required" },
        { status: 400 },
      );
    }

    // Fetch T-shirt image
    const tshirtResponse = await fetch(tshirtImageUrl);
    if (!tshirtResponse.ok) {
      return NextResponse.json<ErrorResponse>(
        { error: "Failed to fetch T-shirt image" },
        { status: 400 },
      );
    }

    const tshirtArrayBuffer = await tshirtResponse.arrayBuffer();
    const tshirtBuffer = Buffer.from(tshirtArrayBuffer);
    const tshirtBase64 = tshirtBuffer.toString("base64");
    const contentType =
      tshirtResponse.headers.get("content-type") || "image/jpeg";
    const tshirtDataUrl = `data:${contentType};base64,${tshirtBase64}`;

    // Create AI Gateway instance
    const gateway = createGateway({
      apiKey: apiKey,
    });

    const model = gateway("google/gemini-2.5-flash-image");

    // Construct editing prompt
    const editingPrompt = `Transform this t-shirt by adding the following design: ${prompt}. Make sure the design is clearly visible and well-placed on the t-shirt. The result should look like a professional product photo of a custom-designed t-shirt.`;

    // Generate customized T-shirt image
    const result = await generateText({
      model,
      messages: [
        {
          role: "user",
          // @ts-ignore - Type issue with content parts
          content: [
            { type: "image", image: tshirtDataUrl },
            { type: "text", text: editingPrompt },
          ],
        },
      ],
      providerOptions: {
        google: {
          responseModalities: ["IMAGE"],
          imageConfig: {
            aspectRatio: "1:1",
          },
        },
      },
    });

    const imageFiles =
      result.files?.filter((f) => f.mediaType?.startsWith("image/")) || [];

    if (imageFiles.length === 0) {
      return NextResponse.json<ErrorResponse>(
        {
          error: "No image generated",
          details: "The model did not return any images",
        },
        { status: 500 },
      );
    }

    const firstImage = imageFiles[0]!;
    const base64Image = firstImage.base64!;

    // Convert base64 to buffer for Vercel Blob upload
    const imageBuffer = Buffer.from(base64Image, "base64");

    // Upload to Vercel Blob
    const filename = `custom-tshirts/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
    const blob = await put(filename, imageBuffer, {
      access: "public",
      contentType: "image/png",
    });

    return NextResponse.json<GenerateDesignResponse>({
      success: true,
      designUrl: blob.url,
      prompt: prompt,
    });
  } catch (error) {
    console.error("Error in generate-design route:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json<ErrorResponse>(
      {
        error: "Failed to generate design",
        details: errorMessage,
      },
      { status: 500 },
    );
  }
}

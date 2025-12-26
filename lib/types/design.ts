// Custom T-shirt design types

export interface CustomDesign {
  designUrl: string; // Vercel Blob public URL of the customized t-shirt
  prompt: string; // User's text prompt describing the design
  createdAt: string; // ISO timestamp
}

export interface DesignGenerationRequest {
  prompt: string;
  tshirtImageUrl: string;
}

export interface DesignGenerationResponse {
  success: boolean;
  designUrl?: string;
  prompt?: string;
  error?: string;
}

export interface CartAttribute {
  key: string;
  value: string;
}

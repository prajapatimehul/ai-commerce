# AI-Generated T-Shirt Customization - Product Requirements Document (PRD)

**Project**: AI Commerce - Custom T-Shirt Design Feature
**Version**: 1.0 (MVP)
**Date**: 2025-12-26
**Author**: Claude Code Planning Session

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Overview](#product-overview)
3. [User Requirements](#user-requirements)
4. [Technical Architecture](#technical-architecture)
5. [Implementation Plan](#implementation-plan)
6. [User Experience Flow](#user-experience-flow)
7. [Data Models & Storage](#data-models--storage)
8. [Cost Analysis](#cost-analysis)
9. [Risk Mitigation](#risk-mitigation)
10. [Success Metrics](#success-metrics)

---

## Executive Summary

### Vision

Transform the ai-commerce storefront from a standard product catalog into an interactive design studio where customers can create unique, AI-generated T-shirt designs using Google Gemini 2.5 Flash Image and immediately purchase them through the existing Shopify checkout flow.

### Goals

1. **Increase conversion**: Enable product personalization to drive higher purchase intent
2. **Differentiate brand**: Stand out with AI-powered customization in commodity T-shirt market
3. **Ship fast**: Launch MVP within 2 weeks to validate concept
4. **Maintain quality**: Preserve existing storefront performance and UX patterns

### MVP Scope Decision

Based on user requirements gathering:

- ✅ **Integration**: Into main commerce app (not separate playground)
- ✅ **Features**: Text-to-image AI generation, **image upload + AI editing**, design placement/sizing, T-shirt variants
- ✅ **Storage**: Vercel Blob for design images, Shopify cart attributes for metadata
- ✅ **Priority**: Quick MVP - ship within 2-3 weeks

**Deferred to Post-MVP**:

- ❌ Advanced placement (front/back/sleeve)
- ❌ Design history/gallery
- ❌ 3D mockup preview
- ❌ Multiple designs per shirt

---

## Product Overview

### Target Users

- **Creative consumers**: Ages 18-35 who want unique, personalized apparel
- **Gift buyers**: Looking for custom designs for specific occasions
- **Tech enthusiasts**: Early adopters interested in AI-generated art

### User Journey (MVP)

1. Customer browses T-shirt products on ai-commerce storefront
2. Sees "Customize with AI" button on tagged products
3. Clicks to open AI design studio modal
4. **Chooses mode**:
   - **Option A**: Enter text prompt (e.g., "sunset over mountains")
   - **Option B**: Upload image file (or paste URL) + enter editing prompt (e.g., "make it artistic")
5. Selects design size (Small/Medium/Large print size)
6. Clicks "Generate Design" → waits 3-5 seconds
7. Previews AI-generated/edited design
8. Can regenerate or proceed
9. Selects T-shirt size (XS-XXL) and color
10. Adds to cart with custom design
11. Design data persists through checkout
12. Order created in Shopify with design URL in line item attributes
13. Fulfillment team downloads design for printing

### Core Value Propositions

- **For Customers**: Unique, one-of-a-kind designs without design skills
- **For Business**: Higher margins, differentiation, viral potential
- **For Fulfillment**: Simple download workflow, manual print shop integration

---

## User Requirements

### Functional Requirements (P0 - Must Have)

#### FR1: AI Design Generation

**Mode A: Text-to-Image**

- User can enter text prompt (max 500 characters)
- System generates design from scratch using Google Gemini 2.5 Flash Image
- Generation completes in <10 seconds
- User can retry/regenerate if unsatisfied

**Mode B: Image Upload + AI Editing**

- User can upload image file (JPEG, PNG, WebP, HEIC/HEIF, GIF)
- OR paste image URL
- HEIC files automatically converted to JPEG
- Image compressed to max 1280px, 75% quality
- User enters editing prompt (e.g., "make it artistic", "add neon effects")
- System uses Gemini to transform/edit the image
- Max upload size: 10MB

**Both Modes**:

- Fixed aspect ratio: 1:1 (square, optimal for T-shirt printing)
- Output format: PNG via Vercel Blob

#### FR2: Design Customization

- User selects design size: Small (8"), Medium (12"), Large (16")
- Design placement: Front-center (fixed for MVP)
- Aspect ratio: 1:1 (fixed for MVP)

#### FR3: Product Variant Selection

- User selects T-shirt size: XS, S, M, L, XL, XXL (standard Shopify variants)
- User selects T-shirt color (impacts mockup preview)
- Variant selection independent of design customization

#### FR4: Cart & Checkout Integration

- Custom design data stored in cart line item attributes
- Design persists through cart → checkout → order
- Design thumbnail visible in cart UI
- Design prompt text visible in cart UI

#### FR5: Order Fulfillment

- Design data accessible in Shopify admin (Order → Line Items → Attributes)
- Design URL publicly accessible for fulfillment team download
- Prompt text and size visible for context

### Non-Functional Requirements

#### NFR1: Performance

- Page load time <2s (no regression from current)
- Design generation <10s (target 3-5s)
- Modal opens instantly (<100ms)
- Mobile-responsive across devices

#### NFR2: Cost Efficiency

- API cost per design <$0.05
- Storage cost per design <$0.001
- Total cost per custom order <$0.10

#### NFR3: Error Handling

- Graceful degradation if API fails
- Clear error messages for users
- Retry mechanism for transient failures
- Fallback: Allow purchase without customization

#### NFR4: Security

- API key secured in environment variables
- No CORS issues for blob storage
- Content filtering via Gemini's built-in policies

---

## Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Commerce Storefront                    │
│                    (Next.js 15 + Shopify)                    │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  v
┌─────────────────────────────────────────────────────────────┐
│  Product Page (Tagged: "customizable")                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  "Customize with AI" Button                          │   │
│  └──────────────┬───────────────────────────────────────┘   │
│                 │ (Opens Modal)                              │
│                 v                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Design Studio Modal                                 │   │
│  │  - Prompt Input (textarea)                           │   │
│  │  - Design Size Selector (S/M/L)                      │   │
│  │  - Generate Button                                   │   │
│  │  - Design Preview                                    │   │
│  └──────────────┬───────────────────────────────────────┘   │
│                 │                                             │
│                 v                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  POST /api/generate-design                           │   │
│  │  { prompt: "sunset mountains..." }                   │   │
│  └──────────────┬───────────────────────────────────────┘   │
└─────────────────┼───────────────────────────────────────────┘
                  │
                  v
┌─────────────────────────────────────────────────────────────┐
│  Vercel AI Gateway                                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Google Gemini 2.5 Flash Image                       │   │
│  │  - Text-to-image generation                          │   │
│  │  - Aspect ratio: 1:1                                 │   │
│  │  - Returns: base64 PNG                               │   │
│  └──────────────┬───────────────────────────────────────┘   │
└─────────────────┼───────────────────────────────────────────┘
                  │
                  v
┌─────────────────────────────────────────────────────────────┐
│  Vercel Blob Storage                                         │
│  - Upload PNG to /custom-designs/{id}.png                   │
│  - Returns: Public URL                                       │
│  - Access: Public (no auth required)                        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  v
┌─────────────────────────────────────────────────────────────┐
│  Return to Frontend                                          │
│  { designUrl: "https://blob.vercel-storage.com/..." }      │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  v
┌─────────────────────────────────────────────────────────────┐
│  Add to Cart (Server Action)                                │
│  addItem(variantId, attributes: [                           │
│    { key: "customDesignUrl", value: "https://..." },       │
│    { key: "customDesignPrompt", value: "sunset..." },      │
│    { key: "designSize", value: "medium" }                  │
│  ])                                                         │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  v
┌─────────────────────────────────────────────────────────────┐
│  Shopify Storefront API                                     │
│  cartLinesAdd(cartId, lines: [{                             │
│    merchandiseId: "variant-id",                             │
│    quantity: 1,                                             │
│    attributes: [...]                                        │
│  }])                                                        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  v
┌─────────────────────────────────────────────────────────────┐
│  Cart → Checkout → Order                                    │
│  - Design thumbnail in cart UI                              │
│  - Design data in Shopify order attributes                  │
│  - Fulfillment team downloads from design URL               │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend**:

- Next.js 15.6.0 (App Router, Server Components)
- React 19
- TypeScript 5.8.2
- Tailwind CSS 4.0.14
- Headless UI (for modal)

**Backend**:

- Next.js API Routes (Server Actions)
- Vercel AI SDK (`ai`, `@ai-sdk/gateway`)
- Google Gemini 2.5 Flash Image (via AI Gateway)

**Storage**:

- Vercel Blob Storage (design images)
- Shopify Cart (design metadata as attributes)

**Commerce**:

- Shopify Storefront API (GraphQL)
- Shopify Admin (order management)

### Component Architecture

```
/app/product/[handle]/page.tsx
  └─ ProductPage (Server Component)
      └─ ProductProvider (Client Context)
          ├─ Gallery (existing)
          ├─ ProductDescription (MODIFIED)
          │   ├─ CustomizationSection (NEW)
          │   │   └─ DesignStudio Modal (NEW)
          │   │       ├─ useDesignGeneration hook (NEW)
          │   │       ├─ Prompt Input
          │   │       ├─ Design Size Selector
          │   │       ├─ Generate Button
          │   │       └─ Design Preview
          │   ├─ VariantSelector (existing)
          │   └─ AddToCart (MODIFIED - passes attributes)
          └─ RelatedProducts (existing)
```

---

## Implementation Plan

### Phase 1: Setup & Dependencies (Day 1)

**Dependencies to Install**:

```bash
pnpm add ai @ai-sdk/gateway @vercel/blob heic-to
```

**Environment Variables**:

- `.env.local`: Add `AI_GATEWAY_API_KEY`
- Vercel Dashboard: Add `AI_GATEWAY_API_KEY` (Production + Preview)
- Vercel Dashboard: Enable Blob Storage

**Shopify Configuration**:

- Tag T-shirt products with `customizable` tag in Shopify admin

### Phase 2: AI Generation API (Days 2-3)

**Create Files**:

1. `/app/api/generate-design/route.ts` - API endpoint for AI generation
2. `/lib/types/design.ts` - TypeScript type definitions
3. `/lib/utils/image-processing.ts` - Image upload, compression, HEIC conversion helpers

**Key Implementation Details**:

- Adapt from `/nano-banana-pro-playground/app/api/generate-image/route.ts`
- **Support BOTH modes**: text-to-image AND image editing
- Accept base64 image data for editing mode
- Hardcode aspect ratio to 1:1
- Upload generated PNG to Vercel Blob
- Return blob URL instead of base64

**Image Processing** (reuse from playground):

- HEIC → JPEG conversion using `heic-to` library
- Image compression (max 1280px, 75% quality)
- Base64 encoding for API transmission
- Validation: file size, format, dimensions

### Phase 3: Data Model Updates (Day 4)

**Modify Files**:

1. `/lib/shopify/types.ts` - Add `attributes` field to `CartItem`
2. `/lib/shopify/fragments/cart.ts` - Query `attributes` in GraphQL
3. `/components/product/product-context.tsx` - Add `customDesign` state

**Key Changes**:

- CartItem type includes optional `attributes: Array<{key, value}>`
- Cart fragment queries line item attributes
- Product context manages custom design state

### Phase 4: UI Components (Days 5-7)

**Create Files**:

1. `/components/product/customization/use-design-generation.ts` - Hook for AI generation
2. `/components/product/customization/use-image-upload.ts` - Hook for image upload/processing (from playground)
3. `/components/product/customization/design-studio.tsx` - Main modal UI
4. `/components/product/customization/image-upload-box.tsx` - Image upload component (from playground)
5. `/components/product/customization/customization-section.tsx` - Entry point button
6. `/components/product/customization/index.ts` - Barrel export

**Key Features**:

- **Mode Toggle**: Tabs or buttons to switch between "Generate from Text" vs "Upload & Edit"
- **Text-to-Image Mode**:
  - Prompt textarea input
  - Design size selector (S/M/L)
  - Generate button
- **Image Upload Mode**:
  - Drag-and-drop file upload zone
  - URL input toggle
  - HEIC conversion progress
  - Image preview thumbnail
  - Editing prompt input (e.g., "make it artistic")
- **Shared**:
  - Progress bar during generation (0-100% animated)
  - Design preview with mockup overlay
  - Mobile-responsive layout

**Reused from Playground**:

- `/nano-banana-pro-playground/components/image-combiner/hooks/use-image-upload.ts`
- `/nano-banana-pro-playground/components/image-combiner/image-upload-box.tsx`
- HEIC conversion logic
- Image compression utilities

### Phase 5: Cart Integration (Days 8-9)

**Modify Files**:

1. `/components/cart/actions.ts` - Accept `attributes` parameter in `addItem`
2. `/components/cart/add-to-cart.tsx` - Pass design attributes from context
3. `/lib/shopify/index.ts` - Update GraphQL mutation to include attributes
4. Cart display component - Show design thumbnail and prompt

**Key Changes**:

- addItem server action accepts optional attributes array
- AddToCart component retrieves customDesign from context
- Cart UI displays design image and prompt text

### Phase 6: Product Page Integration (Day 10)

**Modify Files**:

1. `/components/product/product-description.tsx` - Add CustomizationSection

**Logic**:

```typescript
const isCustomizable = product.tags.includes('customizable');
{isCustomizable && <CustomizationSection />}
```

### Phase 7: Testing & Polish (Days 11-12)

**Testing Checklist**:

- [ ] End-to-end flow: Generate → Cart → Checkout → Order
- [ ] Design visible in Shopify admin order attributes
- [ ] Error handling: API failures, network issues
- [ ] Mobile responsiveness
- [ ] Performance: Generation time, page load time
- [ ] Cost monitoring: API usage, storage usage

---

## User Experience Flow

### Wireframes (Text Description)

**Desktop Product Page**:

```
┌─────────────────────────────────────────────────────────┐
│  Navigation Bar                                          │
├──────────────────┬──────────────────────────────────────┤
│                  │                                       │
│  [Product        │  Product Title                        │
│   Gallery]       │  $29.99                               │
│                  │                                       │
│  [Thumbnails]    │  ┌──────────────────────────────┐    │
│                  │  │ 🎨 Customize with AI         │    │
│                  │  └──────────────────────────────┘    │
│                  │                                       │
│                  │  Size: [XS] [S] [M] [L] [XL]         │
│                  │  Color: [Black] [White] [Gray]       │
│                  │                                       │
│                  │  [Add to Cart]                        │
└──────────────────┴──────────────────────────────────────┘
```

**Design Studio Modal** (when "Customize with AI" clicked):

```
┌─────────────────────────────────────────────────────────┐
│ ┌─── Design Your T-Shirt with AI ───────────────────┐   │
│ │                                                    │   │
│ │  Left Panel:                  Right Panel:        │   │
│ │  ┌──────────────────┐         ┌─────────────┐    │   │
│ │  │ What do you want │         │             │    │   │
│ │  │ on your shirt?   │         │   Design    │    │   │
│ │  │                  │         │   Preview   │    │   │
│ │  │ [Textarea]       │         │             │    │   │
│ │  │                  │         │             │    │   │
│ │  └──────────────────┘         └─────────────┘    │   │
│ │                                                    │   │
│ │  Design Size:                                     │   │
│ │  [Small] [Medium] [Large]                         │   │
│ │                                                    │   │
│ │  [Generate Design] ← Main CTA                     │   │
│ │                                                    │   │
│ │  Progress: [████████░░] 80%                       │   │
│ │                                                    │   │
│ │  [Cancel]           [Add to Cart with Design]     │   │
│ └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Cart with Custom Design**:

```
┌─────────────────────────────────────────────────────────┐
│  Shopping Cart                                           │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┬────────────────────────────────────────┐  │
│  │ [Thumb]  │  Custom T-Shirt (Medium, Black)        │  │
│  │          │  $29.99                                │  │
│  │          │  ┌──────────┐                          │  │
│  │          │  │ [Design  │ Design: "sunset over..." │  │
│  │          │  │  Preview]│ Size: Medium             │  │
│  │          │  └──────────┘                          │  │
│  └──────────┴────────────────────────────────────────┘  │
│                                                          │
│  Subtotal: $29.99                                        │
│  [Proceed to Checkout]                                   │
└─────────────────────────────────────────────────────────┘
```

### Interaction Patterns

**Loading States**:

1. Click "Generate Design"
2. Button disabled, text changes to "Generating..."
3. Progress bar appears (0% → 98% over 3-5 seconds)
4. Completion: Progress jumps to 100%, success sound (optional)
5. Design fades in to preview area

**Error Handling**:

1. API failure → Red error message below button
2. Message: "Generation failed. Try again?" with retry button
3. Network timeout → "Taking longer than expected. Still trying..."
4. Missing API key → Modal shows setup instructions instead

**Success Flow**:

1. Design appears in preview
2. "Add to Cart with This Design" button appears
3. Click → Modal closes, design stored in context
4. Cart item includes design automatically

---

## Data Models & Storage

### TypeScript Types

```typescript
// /lib/types/design.ts

export interface CustomDesign {
  designUrl: string; // Vercel Blob public URL
  prompt: string; // User's text prompt
  designSize: "small" | "medium" | "large";
  position: "front-center"; // Fixed for MVP
  aspectRatio: "1:1"; // Fixed for MVP
  createdAt: string; // ISO timestamp
}

export interface DesignGenerationRequest {
  prompt: string;
}

export interface DesignGenerationResponse {
  success: boolean;
  designUrl?: string;
  prompt?: string;
  error?: string;
}
```

### Shopify Cart Attributes

Cart line items support custom key-value attributes:

```json
{
  "merchandiseId": "gid://shopify/ProductVariant/123",
  "quantity": 1,
  "attributes": [
    {
      "key": "customDesignUrl",
      "value": "https://vercel-blob-storage.com/designs/abc123.png"
    },
    {
      "key": "customDesignPrompt",
      "value": "sunset over mountains with geometric patterns"
    },
    {
      "key": "designSize",
      "value": "medium"
    },
    {
      "key": "designPosition",
      "value": "front-center"
    }
  ]
}
```

**Attribute Limitations**:

- ✅ Unlimited number of attributes per line item
- ✅ Attributes persist through cart → checkout → order
- ✅ Visible in Shopify admin (Order details page)
- ⚠️ Value max length: 512 characters (URL-safe, no base64)

### Storage Strategy

**Design Images**:

- **Storage**: Vercel Blob Storage
- **Path**: `/custom-designs/{timestamp}-{random}.png`
- **Access**: Public (no authentication)
- **Retention**: No automatic expiration (consider 30-day cleanup cron job)
- **Cost**: $0.15/GB storage + $0.30/GB bandwidth

**Design Metadata**:

- **Storage**: Shopify cart attributes → order attributes
- **Persistence**: Permanent (stored with order)
- **Access**: Shopify admin, GraphQL API
- **Cost**: Free (included in Shopify)

---

## Cost Analysis

### Per-Design Costs

**AI Generation** (Google Gemini via AI Gateway):

- Estimated: $0.015-0.025 per 1:1 image
- Based on: Text-to-image, 1024x1024 output

**Image Storage** (Vercel Blob):

- Average design size: 200-300KB
- Storage cost: $0.15/GB = $0.00003 per design
- Bandwidth cost (1 view): $0.30/GB = $0.00006 per view

**Total per Custom Order**:

- Generation: $0.02
- Storage (perpetual): $0.00003
- Bandwidth (10 views): $0.0006
- **Total: ~$0.03 per order**

### Monthly Cost Projections

**Scenario 1: 100 custom orders/month**

- AI generation: $2
- Storage: $0.10
- Bandwidth: $1
- **Total: ~$3/month**

**Scenario 2: 1,000 custom orders/month**

- AI generation: $20
- Storage: $1
- Bandwidth: $10
- **Total: ~$31/month**

**Scenario 3: 10,000 custom orders/month**

- AI generation: $200
- Storage: $10
- Bandwidth: $100
- **Total: ~$310/month**

### Break-Even Analysis

Assuming T-shirt profit margin:

- Standard T-shirt: $15 margin
- Custom T-shirt: $15 margin - $0.03 cost = $14.97 margin
- **Impact: Negligible (<0.2% margin reduction)**

**Recommendation**: No price increase needed for MVP. Monitor costs and adjust if volume exceeds 10,000/month.

---

## Risk Mitigation

### Technical Risks

| Risk                                   | Impact | Likelihood | Mitigation                                                                           |
| -------------------------------------- | ------ | ---------- | ------------------------------------------------------------------------------------ |
| API costs spiral                       | High   | Medium     | Rate limiting (5 designs/hour/user), cost alerts at $100/month, dashboard monitoring |
| Slow generation times (>10s)           | Medium | Low        | Progress UX patterns, fallback to standard purchase, investigate regional latency    |
| Storage costs grow unexpectedly        | Medium | Low        | Implement 30-day cleanup cron job for orphaned designs, compress images to <200KB    |
| Cart attribute size limits (512 chars) | High   | Low        | ✅ SOLVED: Use Vercel Blob URLs (short) instead of base64 data URLs                  |
| Vercel Blob outages                    | Medium | Very Low   | Graceful degradation: Show error, allow retry, fallback to standard purchase         |

### Business Risks

| Risk                            | Impact | Likelihood | Mitigation                                                                                        |
| ------------------------------- | ------ | ---------- | ------------------------------------------------------------------------------------------------- |
| Inappropriate content generated | High   | Medium     | Gemini built-in content filters, keyword blocklist, manual review queue (post-MVP)                |
| Copyright/trademark violations  | High   | Low        | Disclaimer in UI, basic keyword filter (no "Nike", "Disney", etc.), DMCA takedown process         |
| Low adoption rate               | Medium | Medium     | A/B test placement of "Customize" button, improve prompt examples, add design inspiration gallery |
| Fulfillment errors              | Medium | Medium     | Clear admin documentation, test orders, print shop training, QA checklist                         |
| Poor design quality             | Low    | Medium     | Set expectations ("AI-generated, results vary"), allow regeneration, show examples                |

### Operational Risks

| Risk                          | Impact | Likelihood | Mitigation                                                                             |
| ----------------------------- | ------ | ---------- | -------------------------------------------------------------------------------------- |
| Manual fulfillment bottleneck | Medium | High       | Document download process clearly, consider print-on-demand API integration (post-MVP) |
| Customer service burden       | Low    | Medium     | Create FAQ page, clear error messages, prompt examples, design guidelines              |
| Inconsistent print quality    | Medium | Medium     | Define print specifications (DPI, color profile), test prints, vendor QA               |

---

## Success Metrics

### Primary KPIs

1. **Customization Adoption Rate**

   - Metric: % of product page visitors who open Design Studio
   - Target: >10% (MVP), >20% (optimized)
   - Measurement: Analytics event tracking

2. **Conversion Rate (Custom vs Standard)**

   - Metric: % who generate design → add to cart → purchase
   - Target: ≥ standard product conversion rate
   - Hypothesis: Customization increases purchase intent

3. **Average Order Value (AOV)**

   - Metric: Compare AOV of custom vs standard T-shirt orders
   - Target: Custom AOV ≥ Standard AOV (ideally +10-20%)
   - Measurement: Shopify analytics

4. **Generation Success Rate**

   - Metric: % of generation attempts that succeed
   - Target: >95%
   - Measurement: API logging, error rate monitoring

5. **Cost per Custom Order**
   - Metric: Total API + storage costs / custom orders
   - Target: <$0.10 per order (gives margin buffer)
   - Measurement: Monthly cost tracking

### Secondary KPIs

6. **Time to First Design**

   - Metric: Seconds from modal open → first generation
   - Target: <60 seconds (indicates good UX)

7. **Regeneration Rate**

   - Metric: % of users who regenerate before adding to cart
   - Target: 20-40% (indicates engagement, not frustration)

8. **Mobile vs Desktop Usage**

   - Metric: Platform split for customization feature
   - Target: Track to optimize UX per platform

9. **Customer Satisfaction**

   - Metric: Reviews mentioning customization (sentiment analysis)
   - Target: >4.5/5 star average for custom orders

10. **API Latency**
    - Metric: Average generation time (p50, p95, p99)
    - Target: p50 <5s, p95 <10s, p99 <15s

### Tracking Implementation

**Analytics Events**:

- `customize_button_click` - User opens Design Studio
- `design_generated` - Successful generation (with latency)
- `design_generation_error` - Failed generation (with error type)
- `design_added_to_cart` - User adds custom design to cart
- `custom_order_completed` - Checkout completed with custom item

**Dashboard**:

- Vercel Analytics for frontend events
- Shopify Analytics for conversion and AOV
- Custom dashboard for cost tracking (API + Blob usage)

---

## Timeline & Milestones

### Week 1: Core Implementation

- **Day 1**: Setup (dependencies, environment, Shopify tags)
- **Days 2-3**: AI generation API + Vercel Blob integration
- **Day 4**: Data model updates (types, GraphQL, context)
- **Days 5-7**: UI components (modal, hook, design studio)

### Week 2: Integration & Launch

- **Days 8-9**: Cart integration (actions, display)
- **Day 10**: Product page integration
- **Days 11-12**: Testing, polish, error handling
- **Day 12**: Soft launch (10% traffic)
- **Day 14**: Full launch (100% traffic)

### Week 3+: Monitor & Iterate

- Monitor KPIs daily
- Collect user feedback
- Fix bugs
- Plan post-MVP features based on data

---

## Post-MVP Roadmap

### Phase 2 (Q1 2025)

1. **Design History & Gallery**

   - Save designs to user account
   - Browse past designs
   - Reuse designs on different products

2. **Advanced Placement**
   - Front/back/sleeve positioning
   - Drag-and-drop design placement
   - Multiple designs per shirt

### Phase 3 (Q2 2025)

1. **Print-on-Demand Integration**

   - Integrate Printful or Printify API
   - Automated order fulfillment
   - Real-time shipping quotes

2. **Product Expansion**

   - Hoodies, sweatshirts
   - Mugs, posters, phone cases
   - Multi-product customization

3. **Social Features**
   - Share design preview links
   - Instagram/Twitter integration
   - Community design gallery
   - Design contests

### Phase 4 (Q3 2025)

1. **AI Enhancements**

   - Style presets ("Minimalist", "Vibrant", "Retro")
   - Multi-variation generation (show 4 options)
   - Negative prompts ("without text")

2. **Advanced Mockups**

   - 3D t-shirt rotation
   - True-to-print color simulation
   - Model wearing product

3. **Business Features**
   - Bulk ordering (corporate clients)
   - Design licensing marketplace
   - Affiliate program for designers

---

## Appendix: File Changes Summary

### New Files (10 files)

1. `/app/api/generate-design/route.ts` - AI generation endpoint (text-to-image + image editing)
2. `/lib/types/design.ts` - TypeScript types
3. `/lib/utils/image-processing.ts` - Image compression, HEIC conversion helpers
4. `/components/product/customization/use-design-generation.ts` - Generation hook
5. `/components/product/customization/use-image-upload.ts` - Image upload hook (from playground)
6. `/components/product/customization/image-upload-box.tsx` - Upload UI component (from playground)
7. `/components/product/customization/design-studio.tsx` - Main modal UI (with mode toggle)
8. `/components/product/customization/customization-section.tsx` - Product page button
9. `/components/product/customization/index.ts` - Barrel export
10. `.env.local` - Add AI_GATEWAY_API_KEY

### Modified Files (6 files)

1. `/lib/shopify/types.ts` - Add attributes to CartItem
2. `/lib/shopify/fragments/cart.ts` - Query attributes in GraphQL
3. `/components/product/product-context.tsx` - Add design state
4. `/components/cart/actions.ts` - Accept attributes parameter
5. `/components/cart/add-to-cart.tsx` - Pass attributes from context
6. `/components/product/product-description.tsx` - Conditionally show customization

### Configuration Files

1. `/package.json` - Add dependencies: `ai`, `@ai-sdk/gateway`, `@vercel/blob`, `heic-to`
2. Vercel Dashboard - Environment variables + Blob storage
3. Shopify Admin - Tag products with `customizable`

---

## Conclusion

This PRD outlines a practical, MVP-first approach to AI T-shirt customization that:

- ✅ Reuses proven AI technology from nano-banana-pro-playground (including image upload)
- ✅ Integrates cleanly into existing Shopify architecture
- ✅ Ships in 2-3 weeks with comprehensive functionality
- ✅ Maintains cost efficiency (~$0.03 per order)
- ✅ Provides clear path to advanced features
- ✅ Supports both text-to-image generation AND image upload + AI editing

**Next Steps**:

1. Stakeholder review and approval
2. Provision AI Gateway API key
3. Enable Vercel Blob storage
4. Begin Phase 1 implementation

**Questions or Concerns?**

- Pricing strategy (charge extra for customization?)
- Product scope (which t-shirts to tag?)
- Moderation approach (auto-approve or review queue?)
- Returns policy for custom items
- Print quality SLA commitments

---

**Document Version**: 1.0
**Last Updated**: 2025-12-26
**Status**: Ready for Implementation
**Estimated Effort**: 2 weeks (1 developer)

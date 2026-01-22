import { z } from 'zod';
import { tool } from 'ai';

// Schema definitions
const questionOptionSchema = z.object({
  label: z.string().describe('The display label for this option'),
  value: z.string().describe('The value to use when this option is selected'),
});

const variantFocusAreaSchema = z.enum([
  'layout',
  'hierarchy',
  'density',
  'interaction',
  'expression',
]);

const selectedElementSchema = z.object({
  fromVariant: z.string().describe('The variant ID this element is from (A, B, C, D, E)'),
  element: z.string().describe('Description of the element being selected'),
  reason: z.string().describe('Why this element was selected'),
});

const featureSchema = z.object({
  name: z.string().describe('Name of the feature/file'),
  type: z.enum(['component', 'api', 'database', 'util']).describe('Type of file'),
  code: z.string().describe('The complete code for this file'),
  path: z.string().describe('The file path relative to project root'),
});

const exportFileSchema = z.object({
  path: z.string().describe('File path relative to project root'),
  content: z.string().describe('File content'),
});

// Tool definitions
export const askQuestion = tool({
  description: 'Ask the user a quick question to understand their needs. Use this during the interview phase to gather context about the project.',
  parameters: z.object({
    question: z.string().describe('The question to ask the user'),
    options: z.array(questionOptionSchema).optional().describe('Optional predefined options for the user to choose from'),
    allowFreeform: z.boolean().default(true).describe('Whether to allow freeform text input in addition to options'),
  }),
  execute: async ({ question, options, allowFreeform }) => {
    // This is handled by the UI - we return the question structure
    return {
      type: 'question' as const,
      question,
      options,
      allowFreeform,
    };
  },
});

export const generateVariant = tool({
  description: 'Generate a visual prototype variant. Each variant should explore a meaningfully different design direction.',
  parameters: z.object({
    id: z.enum(['A', 'B', 'C', 'D', 'E', 'F']).describe('Unique identifier for this variant'),
    name: z.string().describe('A short, descriptive name for this variant (e.g., "Card-Based Layout")'),
    description: z.string().describe('Brief description of what makes this variant unique'),
    focusArea: variantFocusAreaSchema.describe('The primary design axis this variant explores'),
    code: z.string().describe('Complete React component code using Tailwind CSS. Must be a self-contained, renderable component.'),
    rationale: z.string().describe('Explanation of why this variant is valuable and when it would be the best choice'),
  }),
  execute: async ({ id, name, description, focusArea, code, rationale }) => {
    return {
      type: 'variant' as const,
      id,
      name,
      description,
      focusArea,
      code,
      rationale,
    };
  },
});

export const processFeedback = tool({
  description: 'Process user feedback on variants and determine the next action. Use this after the user has provided feedback on the generated variants.',
  parameters: z.object({
    action: z.enum(['synthesize', 'iterate', 'approve']).describe(
      'synthesize: Combine elements from multiple variants into a new one. iterate: Make refinements based on specific feedback. approve: User is satisfied, ready to build.'
    ),
    selectedElements: z.array(selectedElementSchema).optional().describe('Elements selected from variants to combine (for synthesize action)'),
    overallDirection: z.string().optional().describe('High-level direction for the next iteration'),
    approvedVariantId: z.string().optional().describe('The variant ID being approved (for approve action)'),
  }),
  execute: async ({ action, selectedElements, overallDirection, approvedVariantId }) => {
    return {
      type: 'feedback_processed' as const,
      action,
      selectedElements,
      overallDirection,
      approvedVariantId,
    };
  },
});

export const buildFullStack = tool({
  description: 'Generate the complete full-stack implementation after the design has been approved. This creates all necessary files for a production-ready application.',
  parameters: z.object({
    approvedDesign: z.string().describe('The approved variant code to base the implementation on'),
    projectName: z.string().describe('Name of the project'),
    features: z.array(featureSchema).describe('All files to generate for the full implementation'),
    dependencies: z.array(z.string()).describe('NPM dependencies required'),
    setupInstructions: z.string().describe('Instructions for setting up and running the project'),
  }),
  execute: async ({ approvedDesign, projectName, features, dependencies, setupInstructions }) => {
    return {
      type: 'build_complete' as const,
      approvedDesign,
      projectName,
      features,
      dependencies,
      setupInstructions,
    };
  },
});

export const prepareExport = tool({
  description: 'Prepare the project for export in the specified format.',
  parameters: z.object({
    format: z.enum(['zip', 'github', 'vercel']).describe('Export format'),
    projectName: z.string().describe('Name of the project'),
    files: z.array(exportFileSchema).describe('All files to include in the export'),
  }),
  execute: async ({ format, projectName, files }) => {
    return {
      type: 'export_ready' as const,
      format,
      projectName,
      files,
    };
  },
});

// Export all tools as a record for use with AI SDK
export const tools = {
  askQuestion,
  generateVariant,
  processFeedback,
  buildFullStack,
  prepareExport,
};

// Type exports for use in components
export type AskQuestionResult = Awaited<ReturnType<typeof askQuestion.execute>>;
export type GenerateVariantResult = Awaited<ReturnType<typeof generateVariant.execute>>;
export type ProcessFeedbackResult = Awaited<ReturnType<typeof processFeedback.execute>>;
export type BuildFullStackResult = Awaited<ReturnType<typeof buildFullStack.execute>>;
export type PrepareExportResult = Awaited<ReturnType<typeof prepareExport.execute>>;

export type ToolResult =
  | AskQuestionResult
  | GenerateVariantResult
  | ProcessFeedbackResult
  | BuildFullStackResult
  | PrepareExportResult;

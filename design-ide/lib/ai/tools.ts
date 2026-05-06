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

type QuestionOption = z.infer<typeof questionOptionSchema>;
type VariantFocusArea = z.infer<typeof variantFocusAreaSchema>;
type SelectedElement = z.infer<typeof selectedElementSchema>;
type Feature = z.infer<typeof featureSchema>;
type ExportFile = z.infer<typeof exportFileSchema>;

export type AskQuestionResult = {
  type: 'question';
  question: string;
  options?: QuestionOption[];
  allowFreeform: boolean;
};

export type GenerateVariantResult = {
  type: 'variant';
  id: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  name: string;
  description: string;
  focusArea: VariantFocusArea;
  code: string;
  rationale: string;
};

export type ProcessFeedbackResult = {
  type: 'feedback_processed';
  action: 'synthesize' | 'iterate' | 'approve';
  selectedElements?: SelectedElement[];
  overallDirection?: string;
  approvedVariantId?: string;
};

export type BuildFullStackResult = {
  type: 'build_complete';
  approvedDesign: string;
  projectName: string;
  features: Feature[];
  dependencies: string[];
  setupInstructions: string;
};

export type PrepareExportResult = {
  type: 'export_ready';
  format: 'zip' | 'github' | 'vercel';
  projectName: string;
  files: ExportFile[];
};

// Tool definitions
export const askQuestion = tool({
  description: 'Ask the user a quick question to understand their needs. Use this during the interview phase to gather context about the project.',
  inputSchema: z.object({
    question: z.string().describe('The question to ask the user'),
    options: z.array(questionOptionSchema).optional().describe('Optional predefined options for the user to choose from'),
    allowFreeform: z.boolean().default(true).describe('Whether to allow freeform text input in addition to options'),
  }),
  execute: async ({ question, options, allowFreeform }): Promise<AskQuestionResult> => {
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
  inputSchema: z.object({
    id: z.enum(['A', 'B', 'C', 'D', 'E', 'F']).describe('Unique identifier for this variant'),
    name: z.string().describe('A short, descriptive name for this variant (e.g., "Card-Based Layout")'),
    description: z.string().describe('Brief description of what makes this variant unique'),
    focusArea: variantFocusAreaSchema.describe('The primary design axis this variant explores'),
    code: z.string().describe('Complete React component code using Tailwind CSS. Must be a self-contained, renderable component.'),
    rationale: z.string().describe('Explanation of why this variant is valuable and when it would be the best choice'),
  }),
  execute: async ({ id, name, description, focusArea, code, rationale }): Promise<GenerateVariantResult> => {
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
  inputSchema: z.object({
    action: z.enum(['synthesize', 'iterate', 'approve']).describe(
      'synthesize: Combine elements from multiple variants into a new one. iterate: Make refinements based on specific feedback. approve: User is satisfied, ready to build.'
    ),
    selectedElements: z.array(selectedElementSchema).optional().describe('Elements selected from variants to combine (for synthesize action)'),
    overallDirection: z.string().optional().describe('High-level direction for the next iteration'),
    approvedVariantId: z.string().optional().describe('The variant ID being approved (for approve action)'),
  }),
  execute: async ({ action, selectedElements, overallDirection, approvedVariantId }): Promise<ProcessFeedbackResult> => {
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
  inputSchema: z.object({
    approvedDesign: z.string().describe('The approved variant code to base the implementation on'),
    projectName: z.string().describe('Name of the project'),
    features: z.array(featureSchema).describe('All files to generate for the full implementation'),
    dependencies: z.array(z.string()).describe('NPM dependencies required'),
    setupInstructions: z.string().describe('Instructions for setting up and running the project'),
  }),
  execute: async ({ approvedDesign, projectName, features, dependencies, setupInstructions }): Promise<BuildFullStackResult> => {
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
  inputSchema: z.object({
    format: z.enum(['zip', 'github', 'vercel']).describe('Export format'),
    projectName: z.string().describe('Name of the project'),
    files: z.array(exportFileSchema).describe('All files to include in the export'),
  }),
  execute: async ({ format, projectName, files }): Promise<PrepareExportResult> => {
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

export type ToolResult =
  | AskQuestionResult
  | GenerateVariantResult
  | ProcessFeedbackResult
  | BuildFullStackResult
  | PrepareExportResult;

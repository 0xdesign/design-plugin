/**
 * Design Lab Interactive Feedback System
 *
 * This module provides a Figma-like commenting system for the Design Lab.
 * Users can click on elements in design variants, add comments, and submit
 * structured feedback to Claude via clipboard.
 *
 * Usage:
 * ```tsx
 * import { FeedbackOverlay } from './feedback';
 *
 * export default function DesignLabPage() {
 *   return (
 *     <>
 *       <VariantGrid>...</VariantGrid>
 *       <FeedbackOverlay targetName="ComponentName" />
 *     </>
 *   );
 * }
 * ```
 *
 * Requirements:
 * - Variant containers must have `data-variant="A"` (B, C, D, E, F) attributes
 * - React 18+ with portal support
 */

// Main component
export { FeedbackOverlay, default } from './FeedbackOverlay';

// Types
export type {
  Comment,
  Coordinates,
  ElementIdentifier,
  FeedbackOverlayProps,
  FeedbackPayload,
  FeedbackState,
  VariantId,
} from './types';

export { OVERLAY_CLASS_PREFIX, STORAGE_KEY } from './types';

// Utilities (for advanced usage)
export {
  calculateCoordinates,
  findVariantContainer,
  generateReadablePath,
  generateSelector,
  getTextContent,
  identifyElement,
  isOverlayElement,
} from './selector-utils';

export {
  copyToClipboard,
  downloadJSON,
  formatAsJSON,
  formatAsMarkdown,
  generateId,
  parseFeedbackMarkdown,
  validateFeedback,
} from './format-utils';

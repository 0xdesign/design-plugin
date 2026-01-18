/**
 * Design Lab Interactive Feedback System - Type Definitions
 *
 * These types define the structure for capturing, storing, and
 * formatting user feedback on design variants.
 */

/** Supported variant identifiers */
export type VariantId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

/**
 * Element identification with multiple fallback strategies.
 * Claude uses these identifiers to locate elements in code.
 */
export interface ElementIdentifier {
  /** Primary: CSS selector (data-testid preferred) */
  selector: string;
  /** Secondary: Human-readable path for context */
  readablePath: string;
  /** HTML tag name */
  tagName: string;
  /** First 50 chars of text content (for disambiguation) */
  textContent: string;
  /** Original class names (CSS-in-JS hashes filtered out) */
  className: string;
  /** Relevant attributes (data-*, aria-*, id) */
  attributes: Record<string, string>;
}

/**
 * Position coordinates as percentages within the variant container.
 * Used as visual backup when selectors fail.
 */
export interface Coordinates {
  /** Percentage from left edge of variant container */
  x: number;
  /** Percentage from top edge of variant container */
  y: number;
}

/**
 * A single feedback comment attached to an element.
 */
export interface Comment {
  /** Unique identifier for this comment */
  id: string;
  /** Which variant this comment belongs to */
  variant: VariantId;
  /** Element identification data */
  element: ElementIdentifier;
  /** Click position within the variant */
  coordinates: Coordinates;
  /** User's feedback text */
  text: string;
  /** Unix timestamp when created */
  timestamp: number;
}

/**
 * Complete feedback payload ready for clipboard/download.
 */
export interface FeedbackPayload {
  /** Schema version for future compatibility */
  version: '1.0';
  /** Target component or page name */
  target: string;
  /** ISO timestamp of submission */
  timestamp: string;
  /** All comments grouped by creation order */
  comments: Comment[];
  /** User's overall direction/synthesis guidance */
  overall: string;
}

/**
 * FeedbackOverlay component props.
 */
export interface FeedbackOverlayProps {
  /** Name of the component/page being designed */
  targetName: string;
  /** Optional: variant IDs to display (defaults to A-E) */
  variants?: VariantId[];
  /** Optional: callback when feedback is submitted */
  onSubmit?: (payload: FeedbackPayload) => void;
}

/**
 * Internal state for the feedback overlay.
 */
export interface FeedbackState {
  /** Whether feedback mode is active */
  isActive: boolean;
  /** Currently selected element (if any) */
  selectedElement: HTMLElement | null;
  /** Position for the comment input panel */
  panelPosition: { x: number; y: number } | null;
  /** All comments created in this session */
  comments: Comment[];
  /** Text in the current comment input */
  currentCommentText: string;
  /** Overall direction text */
  overallDirection: string;
  /** Whether the submit modal is showing */
  showSubmitModal: boolean;
  /** The formatted output (for modal preview) */
  formattedOutput: string;
}

/**
 * Storage key for persisting comments in localStorage.
 */
export const STORAGE_KEY = 'design-lab-feedback';

/**
 * CSS class prefix for feedback overlay elements.
 * Used to identify and exclude overlay elements from selection.
 */
export const OVERLAY_CLASS_PREFIX = 'dl-feedback';

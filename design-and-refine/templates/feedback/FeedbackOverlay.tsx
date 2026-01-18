'use client';

/**
 * Design Lab Interactive Feedback System - FeedbackOverlay Component
 *
 * A SELF-CONTAINED React component that enables Figma-like commenting
 * on design variants. All types, utilities, and styles are inline for
 * maximum reliability across different project configurations.
 *
 * USAGE: Copy this single file to your route directory and import it.
 * No other dependencies needed beyond React.
 *
 * Features:
 * - Toggle button to enter/exit feedback mode
 * - Click-to-comment on any element
 * - Numbered pins at comment locations
 * - Sidebar with all comments grouped by variant
 * - Submit modal with clipboard copy (paste into terminal for Claude)
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  type CSSProperties,
} from 'react';
import { createPortal } from 'react-dom';

// ============================================================================
// Types (inlined for portability)
// ============================================================================

type VariantId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

interface ElementIdentifier {
  selector: string;
  readablePath: string;
  tagName: string;
  textContent: string;
  className: string;
  attributes: Record<string, string>;
}

interface Coordinates {
  x: number;
  y: number;
}

interface Comment {
  id: string;
  variant: VariantId;
  element: ElementIdentifier;
  coordinates: Coordinates;
  text: string;
  timestamp: number;
}

interface FeedbackPayload {
  version: '1.0';
  target: string;
  timestamp: string;
  comments: Comment[];
  overall: string;
}

interface FeedbackOverlayProps {
  targetName: string;
  variants?: VariantId[];
  onSubmit?: (payload: FeedbackPayload) => void;
}

interface FeedbackState {
  isActive: boolean;
  selectedElement: HTMLElement | null;
  panelPosition: { x: number; y: number } | null;
  comments: Comment[];
  currentCommentText: string;
  overallDirection: string;
  showSubmitModal: boolean;
  formattedOutput: string;
}

const STORAGE_KEY = 'design-lab-feedback';
const OVERLAY_CLASS_PREFIX = 'dl-feedback';

// CSS isolation styles injected into head to override page styles with !important
const ISOLATION_STYLES = `
  .${OVERLAY_CLASS_PREFIX}-textarea {
    all: revert !important;
    box-sizing: border-box !important;
    width: 100% !important;
    min-height: 80px !important;
    padding: 12px !important;
    font-size: 14px !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    color: #1f2937 !important;
    background-color: #ffffff !important;
    caret-color: #1f2937 !important;
    border: 1px solid #d1d5db !important;
    border-radius: 8px !important;
    resize: vertical !important;
    outline: none !important;
    line-height: 1.5 !important;
  }
  .${OVERLAY_CLASS_PREFIX}-textarea:focus {
    border-color: #6366f1 !important;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2) !important;
  }
  .${OVERLAY_CLASS_PREFIX}-textarea::placeholder {
    color: #9ca3af !important;
    opacity: 1 !important;
  }
  .${OVERLAY_CLASS_PREFIX}-overall-textarea {
    all: revert !important;
    box-sizing: border-box !important;
    width: 100% !important;
    min-height: 100px !important;
    padding: 12px !important;
    font-size: 14px !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    color: #1f2937 !important;
    background-color: #ffffff !important;
    caret-color: #1f2937 !important;
    border: 1px solid #d1d5db !important;
    border-radius: 8px !important;
    resize: vertical !important;
    outline: none !important;
    line-height: 1.5 !important;
  }
  .${OVERLAY_CLASS_PREFIX}-overall-textarea:focus {
    border-color: #6366f1 !important;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2) !important;
  }
  .${OVERLAY_CLASS_PREFIX}-overall-textarea::placeholder {
    color: #9ca3af !important;
    opacity: 1 !important;
  }
`;

// ============================================================================
// Utilities (inlined for portability)
// ============================================================================

const CSS_IN_JS_PATTERN = /^(css|sc|emotion|styled|chakra|mui|ant)-[a-z0-9]+$/i;
const HASH_SUFFIX_PATTERN = /_[a-z0-9]{5,}$/i;

function isCssInJsClass(className: string): boolean {
  return (
    CSS_IN_JS_PATTERN.test(className) ||
    HASH_SUFFIX_PATTERN.test(className) ||
    /^[a-z]{1,3}[0-9]{4,}$/i.test(className)
  );
}

function filterClasses(classNames: string): string {
  if (!classNames) return '';
  return classNames
    .split(/\s+/)
    .filter((cls) => cls && !isCssInJsClass(cls))
    .join(' ');
}

function getRelevantAttributes(element: HTMLElement): Record<string, string> {
  const attrs: Record<string, string> = {};
  const relevantPrefixes = ['data-', 'aria-'];
  for (const attr of Array.from(element.attributes)) {
    if (
      relevantPrefixes.some((prefix) => attr.name.startsWith(prefix)) ||
      attr.name === 'id' ||
      attr.name === 'role' ||
      attr.name === 'type' ||
      attr.name === 'name'
    ) {
      attrs[attr.name] = attr.value;
    }
  }
  return attrs;
}

function generateStructuralPath(element: HTMLElement, variantRoot: HTMLElement): string {
  const path: string[] = [];
  let current: HTMLElement | null = element;
  while (current && current !== variantRoot && current.parentElement) {
    const parent = current.parentElement;
    const siblings = Array.from(parent.children).filter(
      (child) => child.tagName === current!.tagName
    );
    const tag = current.tagName.toLowerCase();
    if (siblings.length === 1) {
      path.unshift(tag);
    } else {
      const index = siblings.indexOf(current) + 1;
      path.unshift(`${tag}:nth-child(${index})`);
    }
    current = parent;
    if (path.length >= 4) break;
  }
  return path.join(' > ');
}

function generateSelector(element: HTMLElement, variantRoot: HTMLElement): string {
  const testId = element.getAttribute('data-testid') || element.getAttribute('data-cy');
  if (testId) return `[data-testid="${testId}"]`;

  const id = element.id;
  if (id && !isCssInJsClass(id) && !id.startsWith(':')) return `#${id}`;

  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) {
    const tag = element.tagName.toLowerCase();
    return `${tag}[aria-label="${ariaLabel}"]`;
  }

  const role = element.getAttribute('role');
  if (role && !['generic', 'presentation', 'none'].includes(role)) {
    const tag = element.tagName.toLowerCase();
    const name = element.getAttribute('name');
    if (name) return `${tag}[role="${role}"][name="${name}"]`;
    return `${tag}[role="${role}"]`;
  }

  const meaningfulClasses = filterClasses(element.className);
  if (meaningfulClasses) {
    const classSelector = meaningfulClasses
      .split(/\s+/)
      .slice(0, 2)
      .map((c) => `.${c}`)
      .join('');
    const matches = variantRoot.querySelectorAll(classSelector);
    if (matches.length === 1) return classSelector;

    const parent = element.parentElement;
    if (parent && parent !== variantRoot) {
      const parentClasses = filterClasses(parent.className);
      if (parentClasses) {
        const parentSelector = parentClasses.split(/\s+/).slice(0, 1).map((c) => `.${c}`).join('');
        return `${parentSelector} > ${classSelector}`;
      }
    }
    return classSelector;
  }

  const tag = element.tagName.toLowerCase();
  const type = element.getAttribute('type');
  const name = element.getAttribute('name');
  if (tag === 'input' || tag === 'button' || tag === 'select') {
    if (name) return `${tag}[name="${name}"]`;
    if (type) return `${tag}[type="${type}"]`;
  }

  return generateStructuralPath(element, variantRoot);
}

const tagLabels: Record<string, string> = {
  div: 'Container', section: 'Section', article: 'Article', nav: 'Navigation',
  header: 'Header', footer: 'Footer', main: 'Main', aside: 'Sidebar',
  form: 'Form', ul: 'List', ol: 'Numbered List', li: 'List Item',
  button: 'Button', a: 'Link', input: 'Input', select: 'Dropdown',
  textarea: 'Text Area', img: 'Image', span: 'Text', p: 'Paragraph',
};

function capitalizeTag(tag: string): string {
  return tagLabels[tag] || tag.charAt(0).toUpperCase() + tag.slice(1);
}

function formatClassName(className: string): string {
  return className
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getElementLabel(element: HTMLElement): string {
  const tag = element.tagName.toLowerCase();
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;

  if (tag === 'button' || tag === 'a') {
    const text = element.textContent?.trim().slice(0, 30);
    if (text) return `${capitalizeTag(tag)}: "${text}"`;
  }

  if (tag === 'input' || tag === 'select' || tag === 'textarea') {
    const name = element.getAttribute('name') || element.getAttribute('placeholder');
    if (name) return `${capitalizeTag(tag)}: ${name}`;
  }

  if (/^h[1-6]$/.test(tag)) {
    const text = element.textContent?.trim().slice(0, 30);
    if (text) return `Heading: "${text}"`;
  }

  const classes = filterClasses(element.className);
  if (classes) return formatClassName(classes.split(/\s+/)[0]);

  return capitalizeTag(tag);
}

function generateReadablePath(element: HTMLElement, variantRoot: HTMLElement, variantId: VariantId): string {
  const parts: string[] = [`Variant ${variantId}`];
  const path: HTMLElement[] = [];
  let current: HTMLElement | null = element;
  while (current && current !== variantRoot) {
    path.unshift(current);
    current = current.parentElement;
  }
  const relevantPath = path.slice(-3);
  for (const el of relevantPath) {
    const label = getElementLabel(el);
    if (label) parts.push(label);
  }
  return parts.join(' > ');
}

function getTextContent(element: HTMLElement, maxLength = 50): string {
  const text = element.textContent?.trim() || '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

function calculateCoordinates(element: HTMLElement, variantRoot: HTMLElement, clickX: number, clickY: number): Coordinates {
  const rootRect = variantRoot.getBoundingClientRect();
  const x = ((clickX - rootRect.left) / rootRect.width) * 100;
  const y = ((clickY - rootRect.top) / rootRect.height) * 100;
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}

function identifyElement(
  element: HTMLElement,
  variantRoot: HTMLElement,
  variantId: VariantId,
  clickX: number,
  clickY: number
): { element: ElementIdentifier; coordinates: Coordinates } {
  return {
    element: {
      selector: generateSelector(element, variantRoot),
      readablePath: generateReadablePath(element, variantRoot, variantId),
      tagName: element.tagName.toLowerCase(),
      textContent: getTextContent(element),
      className: filterClasses(element.className),
      attributes: getRelevantAttributes(element),
    },
    coordinates: calculateCoordinates(element, variantRoot, clickX, clickY),
  };
}

function isOverlayElement(element: HTMLElement): boolean {
  let current: HTMLElement | null = element;
  while (current) {
    if (current.className && typeof current.className === 'string' && current.className.includes(OVERLAY_CLASS_PREFIX)) {
      return true;
    }
    current = current.parentElement;
  }
  return false;
}

function findVariantContainer(element: HTMLElement): { root: HTMLElement; variantId: VariantId } | null {
  let current: HTMLElement | null = element;
  while (current) {
    const variantId = current.getAttribute('data-variant');
    if (variantId && /^[A-F]$/.test(variantId)) {
      return { root: current, variantId: variantId as VariantId };
    }
    current = current.parentElement;
  }
  return null;
}

function groupByVariant(comments: Comment[]): Map<VariantId, Comment[]> {
  const groups = new Map<VariantId, Comment[]>();
  for (const comment of comments) {
    const existing = groups.get(comment.variant) || [];
    existing.push(comment);
    groups.set(comment.variant, existing);
  }
  return new Map([...groups.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

function formatComment(comment: Comment, index: number): string {
  const { element, text } = comment;
  const selectorPart = `\`${element.selector}\``;
  const textHint = element.textContent ? `, ${element.tagName} with "${element.textContent}"` : '';
  return `${index}. **${element.readablePath.split(' > ').pop()}** (${selectorPart}${textHint})
   "${text}"`;
}

function formatAsMarkdown(comments: Comment[], target: string, overall: string): string {
  const lines: string[] = [];
  lines.push('## Design Lab Feedback');
  lines.push('');
  lines.push(`**Target:** ${target}`);
  lines.push(`**Comments:** ${comments.length}`);
  lines.push('');

  const grouped = groupByVariant(comments);
  for (const [variantId, variantComments] of grouped) {
    lines.push(`### Variant ${variantId}`);
    variantComments.forEach((comment, index) => {
      lines.push(formatComment(comment, index + 1));
      lines.push('');
    });
  }

  if (overall.trim()) {
    lines.push('### Overall Direction');
    lines.push(overall.trim());
    lines.push('');
  }

  lines.push('---');
  lines.push('*Feedback from Design Lab interactive overlay*');
  return lines.join('\n');
}

async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('Clipboard API failed, trying fallback:', err);
    }
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    textarea.setAttribute('readonly', '');
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (err) {
    console.error('Fallback clipboard method failed:', err);
    return false;
  }
}

function generateId(): string {
  return `comment-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function validateFeedback(comments: Comment[], overall: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (comments.length === 0) errors.push('Please add at least one comment to an element.');
  if (!overall.trim()) errors.push('Please provide an overall direction for the design.');
  return { valid: errors.length === 0, errors };
}

// ============================================================================
// Inline Styles (no external CSS dependencies)
// ============================================================================

const styles: Record<string, CSSProperties> = {
  toggleButton: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 10000,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#fff',
    backgroundColor: '#6366f1',
    border: 'none',
    borderRadius: '9999px',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    transition: 'all 150ms ease',
  },
  toggleButtonActive: { backgroundColor: '#ef4444' },
  toggleButtonHover: {
    transform: 'scale(1.05)',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  hoverHighlight: {
    position: 'fixed',
    pointerEvents: 'none',
    border: '2px dashed #6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: '4px',
    zIndex: 9998,
    transition: 'all 100ms ease',
  },
  pin: {
    position: 'absolute',
    width: '28px',
    height: '28px',
    backgroundColor: '#6366f1',
    color: '#fff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 700,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
    cursor: 'pointer',
    zIndex: 9999,
    transform: 'translate(-50%, -50%)',
    transition: 'transform 150ms ease',
  },
  // Note: Comment panel styles removed - comment input is now in sidebar
  buttonPrimary: {
    flex: 1,
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#fff',
    backgroundColor: '#6366f1',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 150ms ease',
  },
  buttonSecondary: {
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
    backgroundColor: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 150ms ease',
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '360px',
    height: '100vh',
    backgroundColor: '#fff',
    borderLeft: '1px solid #e5e7eb',
    zIndex: 9997,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.05)',
  },
  sidebarHeader: {
    padding: '20px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
  },
  sidebarTitle: { fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 },
  sidebarSubtitle: { fontSize: '13px', color: '#6b7280', marginTop: '4px' },
  sidebarContent: { flex: 1, overflowY: 'auto', padding: '16px' },
  sidebarSection: { marginBottom: '20px' },
  sidebarSectionTitle: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '12px',
  },
  commentCard: {
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    marginBottom: '8px',
    border: '1px solid #e5e7eb',
  },
  commentCardHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
  commentCardPin: {
    width: '24px',
    height: '24px',
    backgroundColor: '#6366f1',
    color: '#fff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 700,
    flexShrink: 0,
  },
  commentCardElement: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#374151',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  commentCardText: { fontSize: '14px', color: '#4b5563', lineHeight: 1.5 },
  commentCardDelete: {
    marginLeft: 'auto',
    padding: '4px 8px',
    fontSize: '12px',
    color: '#ef4444',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'background-color 150ms ease',
  },
  overallSection: {
    padding: '16px',
    borderTop: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
  },
  overallLabel: { fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' },
  // Note: overallTextarea styles moved to CSS injection for !important isolation
  submitSection: { padding: '16px', borderTop: '1px solid #e5e7eb' },
  submitButton: {
    width: '100%',
    padding: '14px 20px',
    fontSize: '15px',
    fontWeight: 600,
    color: '#fff',
    backgroundColor: '#10b981',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'background-color 150ms ease',
  },
  submitButtonDisabled: { backgroundColor: '#9ca3af', cursor: 'not-allowed' },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10002,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  modal: {
    width: '100%',
    maxWidth: '600px',
    maxHeight: '80vh',
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  modalHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: { fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 },
  modalClose: {
    padding: '8px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    borderRadius: '8px',
    transition: 'background-color 150ms ease',
  },
  modalBody: { flex: 1, overflowY: 'auto', padding: '20px 24px' },
  modalPreview: {
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '13px',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
    whiteSpace: 'pre-wrap',
    color: '#374151',
    maxHeight: '300px',
    overflowY: 'auto',
  },
  modalFooter: {
    padding: '16px 24px',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  successMessage: {
    padding: '12px 16px',
    backgroundColor: '#d1fae5',
    color: '#065f46',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  errorMessage: {
    padding: '12px 16px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '16px',
  },
};

// ============================================================================
// Component Implementation
// ============================================================================

export function FeedbackOverlay({
  targetName,
  variants = ['A', 'B', 'C', 'D', 'E'],
  onSubmit,
}: FeedbackOverlayProps) {
  // Load initial state from localStorage (lazy initialization)
  const [state, setState] = useState<FeedbackState>(() => {
    const defaultState: FeedbackState = {
      isActive: false,
      selectedElement: null,
      panelPosition: null,
      comments: [],
      currentCommentText: '',
      overallDirection: '',
      showSubmitModal: false,
      formattedOutput: '',
    };

    if (typeof window === 'undefined') return defaultState;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        return {
          ...defaultState,
          comments: data.comments || [],
          overallDirection: data.overallDirection || '',
        };
      }
    } catch (err) {
      console.warn('Failed to load saved feedback:', err);
    }
    return defaultState;
  });

  const [, setHoveredElement] = useState<HTMLElement | null>(null);
  const [hoverRect, setHoverRect] = useState<DOMRect | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Inject CSS isolation styles into head
  useEffect(() => {
    const styleId = `${OVERLAY_CLASS_PREFIX}-isolation-styles`;
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.textContent = ISOLATION_STYLES;
      document.head.appendChild(styleEl);
    }
    return () => {
      const existing = document.getElementById(styleId);
      if (existing) {
        existing.remove();
      }
    };
  }, []);

  // Save comments to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          comments: state.comments,
          overallDirection: state.overallDirection,
        })
      );
    } catch (err) {
      console.warn('Failed to save feedback:', err);
    }
  }, [state.comments, state.overallDirection]);

  // Focus textarea when panel opens
  useEffect(() => {
    if (state.panelPosition && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [state.panelPosition]);

  // Handle document clicks in feedback mode
  const handleDocumentClick = useCallback(
    (e: MouseEvent) => {
      if (!state.isActive) return;
      const target = e.target as HTMLElement;
      if (isOverlayElement(target)) return;

      const variantInfo = findVariantContainer(target);
      if (!variantInfo) {
        console.warn('Clicked element is not within a variant container');
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      // Calculate panel position (floating near click)
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const panelWidth = 320;
      const panelHeight = 200;

      let panelX = e.clientX + 20;
      let panelY = e.clientY + 20;

      // Keep panel in viewport
      if (panelX + panelWidth > viewportWidth - 380) { // 380 = sidebar width + margin
        panelX = e.clientX - panelWidth - 20;
      }
      if (panelY + panelHeight > viewportHeight - 20) {
        panelY = e.clientY - panelHeight - 20;
      }

      // Store click info on element for later use
      (target as any).__feedbackClickInfo = {
        variantInfo,
        clickX: e.clientX,
        clickY: e.clientY,
      };

      setState((prev) => ({
        ...prev,
        selectedElement: target,
        panelPosition: { x: panelX, y: panelY },
        currentCommentText: '',
      }));
    },
    [state.isActive]
  );

  // Handle mouse move for hover highlighting
  const handleDocumentMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!state.isActive || state.panelPosition) return;
      const target = e.target as HTMLElement;

      if (isOverlayElement(target)) {
        setHoveredElement(null);
        setHoverRect(null);
        return;
      }

      const variantInfo = findVariantContainer(target);
      if (!variantInfo) {
        setHoveredElement(null);
        setHoverRect(null);
        return;
      }

      setHoveredElement(target);
      setHoverRect(target.getBoundingClientRect());
    },
    [state.isActive, state.panelPosition]
  );

  // Set up event listeners
  useEffect(() => {
    if (state.isActive) {
      document.addEventListener('click', handleDocumentClick, true);
      document.addEventListener('mousemove', handleDocumentMouseMove);
      document.body.style.cursor = 'crosshair';
    } else {
      document.body.style.cursor = '';
    }

    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.body.style.cursor = '';
    };
  }, [state.isActive, handleDocumentClick, handleDocumentMouseMove]);

  const toggleFeedbackMode = () => {
    setState((prev) => ({
      ...prev,
      isActive: !prev.isActive,
      selectedElement: null,
      panelPosition: null,
      currentCommentText: '',
    }));
    setHoveredElement(null);
    setHoverRect(null);
  };

  const saveComment = () => {
    if (!state.selectedElement || !state.currentCommentText.trim()) return;

    const clickInfo = (state.selectedElement as any).__feedbackClickInfo;
    if (!clickInfo) return;

    const { variantInfo, clickX, clickY } = clickInfo;
    const identification = identifyElement(
      state.selectedElement,
      variantInfo.root,
      variantInfo.variantId,
      clickX,
      clickY
    );

    const newComment: Comment = {
      id: generateId(),
      variant: variantInfo.variantId,
      element: identification.element,
      coordinates: identification.coordinates,
      text: state.currentCommentText.trim(),
      timestamp: Date.now(),
    };

    setState((prev) => ({
      ...prev,
      comments: [...prev.comments, newComment],
      selectedElement: null,
      panelPosition: null,
      currentCommentText: '',
    }));

    delete (state.selectedElement as any).__feedbackClickInfo;
  };

  const cancelComment = () => {
    if (state.selectedElement) {
      delete (state.selectedElement as any).__feedbackClickInfo;
    }
    setState((prev) => ({
      ...prev,
      selectedElement: null,
      panelPosition: null,
      currentCommentText: '',
    }));
  };

  const deleteComment = (id: string) => {
    setState((prev) => ({
      ...prev,
      comments: prev.comments.filter((c) => c.id !== id),
    }));
  };

  const openSubmitModal = () => {
    const validation = validateFeedback(state.comments, state.overallDirection);

    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors([]);
    const formatted = formatAsMarkdown(state.comments, targetName, state.overallDirection);

    setState((prev) => ({
      ...prev,
      showSubmitModal: true,
      formattedOutput: formatted,
    }));
  };

  // Primary action: Copy to clipboard only
  const handleCopyToClipboard = async () => {
    const success = await copyToClipboard(state.formattedOutput);
    setCopySuccess(success);

    if (onSubmit) {
      onSubmit({
        version: '1.0',
        target: targetName,
        timestamp: new Date().toISOString(),
        comments: state.comments,
        overall: state.overallDirection,
      });
    }

    if (success) {
      setTimeout(() => {
        localStorage.removeItem(STORAGE_KEY);
        setState((prev) => ({
          ...prev,
          showSubmitModal: false,
          comments: [],
          overallDirection: '',
          isActive: false,
        }));
        setCopySuccess(false);
      }, 2000);
    }
  };

  const commentsByVariant = state.comments.reduce(
    (acc, comment) => {
      const variant = comment.variant;
      if (!acc[variant]) acc[variant] = [];
      acc[variant].push(comment);
      return acc;
    },
    {} as Record<VariantId, Comment[]>
  );

  const getGlobalIndex = (comment: Comment): number => {
    return state.comments.findIndex((c) => c.id === comment.id) + 1;
  };

  if (typeof window === 'undefined') return null;

  return createPortal(
    <>
      {/* Toggle Button - Only shown when sidebar is NOT active */}
      {!state.isActive && (
        <button
          className={`${OVERLAY_CLASS_PREFIX}-toggle`}
          style={{
            ...styles.toggleButton,
            ...(isButtonHovered ? styles.toggleButtonHover : {}),
          }}
          onClick={toggleFeedbackMode}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
        >
          <span>💬</span>
          <span>Add Feedback</span>
        </button>
      )}

      {/* Hover Highlight */}
      {state.isActive && hoverRect && !state.panelPosition && (
        <div
          className={`${OVERLAY_CLASS_PREFIX}-highlight`}
          style={{
            ...styles.hoverHighlight,
            left: hoverRect.left,
            top: hoverRect.top,
            width: hoverRect.width,
            height: hoverRect.height,
          }}
        />
      )}

      {/* Comment Pins */}
      {state.comments.map((comment) => {
        const variantEl = document.querySelector(`[data-variant="${comment.variant}"]`);
        if (!variantEl) return null;

        const variantRect = variantEl.getBoundingClientRect();
        const pinX = variantRect.left + (comment.coordinates.x / 100) * variantRect.width;
        const pinY = variantRect.top + (comment.coordinates.y / 100) * variantRect.height;

        return (
          <div
            key={comment.id}
            className={`${OVERLAY_CLASS_PREFIX}-pin`}
            style={{ ...styles.pin, left: pinX, top: pinY }}
            title={comment.text}
          >
            {getGlobalIndex(comment)}
          </div>
        );
      })}

      {/* Floating Comment Input Panel (appears near click) */}
      {state.panelPosition && (
        <div
          ref={panelRef}
          className={`${OVERLAY_CLASS_PREFIX}-panel`}
          style={{
            position: 'fixed',
            zIndex: 10001,
            width: '320px',
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e5e7eb',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            overflow: 'hidden',
            left: state.panelPosition.x,
            top: state.panelPosition.y,
          }}
        >
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid #e5e7eb',
            fontSize: '13px',
            fontWeight: 600,
            color: '#374151',
            backgroundColor: '#f9fafb',
          }}>
            Add Comment
          </div>
          <div style={{ padding: '16px' }}>
            <textarea
              ref={textareaRef}
              className={`${OVERLAY_CLASS_PREFIX}-textarea`}
              placeholder="What feedback do you have for this element?"
              value={state.currentCommentText}
              onChange={(e) => setState((prev) => ({ ...prev, currentCommentText: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.metaKey) saveComment();
                if (e.key === 'Escape') cancelComment();
              }}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button style={styles.buttonSecondary} onClick={cancelComment}>
                Cancel
              </button>
              <button
                style={{
                  ...styles.buttonPrimary,
                  opacity: state.currentCommentText.trim() ? 1 : 0.5,
                }}
                onClick={saveComment}
                disabled={!state.currentCommentText.trim()}
              >
                Save (⌘↵)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      {state.isActive && (
        <div className={`${OVERLAY_CLASS_PREFIX}-sidebar`} style={styles.sidebar}>
          <div style={{ ...styles.sidebarHeader, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={styles.sidebarTitle}>Design Feedback</h2>
              <div style={styles.sidebarSubtitle}>
                {state.comments.length} comment{state.comments.length !== 1 ? 's' : ''} on {targetName}
              </div>
            </div>
            <button
              className={`${OVERLAY_CLASS_PREFIX}-close`}
              style={{
                padding: '6px 10px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#ef4444',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                flexShrink: 0,
              }}
              onClick={toggleFeedbackMode}
            >
              ✕ Exit
            </button>
          </div>

          <div style={styles.sidebarContent}>
            {variants.map((variantId) => {
              const variantComments = commentsByVariant[variantId as VariantId];
              if (!variantComments || variantComments.length === 0) return null;

              return (
                <div key={variantId} style={styles.sidebarSection}>
                  <div style={styles.sidebarSectionTitle}>Variant {variantId}</div>
                  {variantComments.map((comment) => (
                    <div key={comment.id} style={styles.commentCard}>
                      <div style={styles.commentCardHeader}>
                        <div style={styles.commentCardPin}>{getGlobalIndex(comment)}</div>
                        <div style={styles.commentCardElement}>
                          {comment.element.readablePath.split(' > ').slice(-1)[0]}
                        </div>
                        <button style={styles.commentCardDelete} onClick={() => deleteComment(comment.id)}>
                          Delete
                        </button>
                      </div>
                      <div style={styles.commentCardText}>{comment.text}</div>
                    </div>
                  ))}
                </div>
              );
            })}

            {state.comments.length === 0 && (
              <div style={{ color: '#6b7280', textAlign: 'center', padding: '40px 20px' }}>
                <p style={{ fontSize: '14px', marginBottom: '8px' }}>Click on any element to add feedback</p>
                <p style={{ fontSize: '13px', opacity: 0.8 }}>Comments will appear here</p>
              </div>
            )}
          </div>

          {/* Overall Direction */}
          <div style={styles.overallSection}>
            <div style={styles.overallLabel}>Overall Direction</div>
            <textarea
              className={`${OVERLAY_CLASS_PREFIX}-overall-textarea`}
              placeholder="What's the overall direction? e.g., 'Go with Variant B's layout but use A's button styling...'"
              value={state.overallDirection}
              onChange={(e) => setState((prev) => ({ ...prev, overallDirection: e.target.value }))}
            />
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div style={{ padding: '0 16px' }}>
              <div style={styles.errorMessage}>
                {validationErrors.map((err, i) => (<div key={i}>{err}</div>))}
              </div>
            </div>
          )}

          {/* Submit Section */}
          <div style={styles.submitSection}>
            <button
              style={{
                ...styles.submitButton,
                ...(state.comments.length === 0 ? styles.submitButtonDisabled : {}),
              }}
              onClick={openSubmitModal}
              disabled={state.comments.length === 0}
            >
              Submit Feedback
            </button>
          </div>
        </div>
      )}

      {/* Submit Modal */}
      {state.showSubmitModal && (
        <div
          className={`${OVERLAY_CLASS_PREFIX}-modal`}
          style={styles.modalOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setState((prev) => ({ ...prev, showSubmitModal: false }));
              setCopySuccess(false);
            }
          }}
        >
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Copy Feedback</h3>
              <button
                style={styles.modalClose}
                onClick={() => {
                  setState((prev) => ({ ...prev, showSubmitModal: false }));
                  setCopySuccess(false);
                }}
              >
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              {copySuccess && (
                <div style={styles.successMessage}>
                  <span>✓</span>
                  <span>Copied! Paste this into your terminal to send to Claude.</span>
                </div>
              )}

              <div style={{ marginBottom: '12px', fontSize: '14px', color: '#4b5563' }}>
                Click &quot;Copy to Clipboard&quot; then paste into your terminal to share feedback with Claude.
              </div>

              <div style={styles.modalPreview}>{state.formattedOutput}</div>
            </div>

            <div style={styles.modalFooter}>
              <button
                style={styles.buttonSecondary}
                onClick={() => {
                  setState((prev) => ({ ...prev, showSubmitModal: false }));
                  setCopySuccess(false);
                }}
              >
                Cancel
              </button>
              <button style={styles.submitButton} onClick={handleCopyToClipboard}>
                {copySuccess ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}

export default FeedbackOverlay;

# Interaction Design Skill

Use this skill when designing or implementing UI interactions, animations, motion, and micro-interactions.

---

## Core Philosophy

**"Let's do it until there's no more that can be done."** — Jony Ive

- Quality is a function of TIME, not resources or scale
- Good taste = seeing there's more to be done
- "People aren't trying to use computers—they're trying to get their jobs done" (1987 Apple HIG)
- Balance **usability** vs **aesthetics** - not "delight" as north star
- 80/20 rule: If interface works 80% of time but fails 20%, perception won't be 80%—it'll be much lower
- **Novelty tax**: Average users pay cost for learning new things. Build familiarity before adding novelty.

---

## 8 Core Principles

### 1. Inferring Intent
Anticipate what users want before they explicitly ask.

**Key Techniques:**
- **Hover preloading**: `mousedown` fires before `click` — preload on mousedown, navigate on click
- **Proximity detection**: Scale/highlight elements based on cursor distance
- **Contextual defaults**: Pre-fill forms, pre-select likely options
- **Predictive actions**: Show relevant actions based on current state

### 2. Interaction Metaphors
Map digital interactions to familiar physical/real-world experiences.

**Examples:**
- Drag = picking up and moving objects
- Swipe = flicking a stack of cards
- Pull-to-refresh = stretching a rubber band
- Pinch = physical zoom gesture

**Implementation:**
- Use physics simulation (springs, damping) for natural feel
- Maintain metaphor consistency throughout the interface

### 3. Ergonomic Interactions
Design for comfortable, effortless use.

**Guidelines:**
- **Hit areas**: Minimum 44x44px touch targets; expand with `::after` pseudo-elements for thin elements
- **Hand positioning**: Place primary actions within thumb reach on mobile
- **Effort reduction**: Frequently used actions should require minimal movement
- **Bidirectional support**: Support both horizontal AND vertical scroll for carousels

```css
/* Expand hit area for thin elements */
.thin-element::after {
  content: '';
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 100%; height: 100%;
  padding: 20px;
}
```

### 4. Simulating Physics
Use physics-based animations for natural, believable motion.

**Spring Physics:**
```js
// Starting config - tune per interaction
const spring = {
  type: "spring",
  stiffness: 200,  // Higher = snappier
  damping: 20,     // Higher = less bounce
  mass: 1,         // Higher = heavier, slower
}
```

**Key Concepts:**
- **Stiffness**: Controls speed/snappiness (100-500 typical range)
- **Damping**: Controls bounce/overshoot (10-40 typical range)
- **Mass**: Controls inertia (0.5-2 typical range)
- **Never reuse spring values** between different interactions

**Damping Response:**
```js
// Dampen movement for rubber band effect
movementY = movementY * 0.1;
```

**Projection Function (iOS UIScrollView):**
```js
function project(initialVelocity, decelerationRate = 0.998) {
  return ((initialVelocity / 1000) * decelerationRate) / (1 - decelerationRate);
}
```

### 5. Motion Choreography
Sequence and coordinate multiple animations.

**Problems to Avoid:**
- **Overlapping layers**: Feel terrible, produce clutter
- **Too much simultaneous motion**: Overwhelming

**Solutions:**
- **Blur overlapping layers**: 1-2px blur during transitions
- **Stagger animations**: Small delays between elements
  ```js
  delay: index * 0.01 // 10ms between items
  ```
- **Double exit stiffness** for faster cleanup:
  ```js
  exit: { stiffness: transition.stiffness * 2 }
  ```
- **Crossfade icons**: Use scale=0.5 + blur=7px (NOT scale=0 or blur=50px)
- **Choreograph depths**: Primary movement first, secondary follows (400ms delay typical)

**Morph Surface Pattern:**
- Don't move inner layers during container morph
- Crossfade inner content while container animates size
- Use `overflow: hidden` on container

### 6. Responsive Interfaces
Every input expects proportional response.

**Input-Response Loop:**
- Blinking cursors = system is listening
- Loading indicators = system understood, thinking
- Every interaction needs feedback

**Exaggeration Rules:**
- Reserve for "moments of magnitude" (achievements, milestones)
- Don't exaggerate mundane actions

**Sound Effects:**
- Different pitches for enter vs exit states
- DISABLE on mobile (pauses user's music)

**Products vs Marketing:**
- Products: Fast, reduced responsiveness
- Marketing: Can be more expressive

**High-Frequency Actions:**
- NO fade-in for menus (only fade-out)
- NO animation between data points in graphs
- Keyboard interactions often don't need animation (mechanical nature)

**Gesture Lifecycle:**
```js
// START: Set constraints
function onPanStart() {
  grab.start(); // Lock cursor, disable pointer-events
}

// MOVE: Continuous feedback
function onPan(_, { delta }) {
  y.jump(clamp(y.get() + delta.y, [0, MAX])); // jump() = no animation
}

// END: Snap to final state
function onPanEnd(_, { velocity }) {
  const projection = y.get() + project(velocity.y);
  const targetY = projection >= SNAP_DISTANCE ? SNAPPED_Y : 0;
  y.set(targetY); // set() = animated
}
```

**Interpolation with useTransform:**
```js
const blur = useTransform(y, [0, max], [12, 0]);
const opacity = useTransform(y, [0, max], [0.2, 0]);
```

### 7. Contained Gestures
Isolate gestures from interfering with the rest of the interface.

**CSS for Gesture Containment:**
```css
.gesture-grabbing {
  cursor: grabbing;
  user-select: none;
  -webkit-user-select: none;
}
.gesture-grabbing * {
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
}
```

**Utility Pattern:**
```js
export const grab = {
  start: () => document.body.classList.add("cursor-grabbing"),
  end: () => document.body.classList.remove("cursor-grabbing"),
}
```

**Touch Action:**
```css
/* Prevent browser taking over during custom gestures */
.draggable { touch-action: none; }
/* Or be specific */
.horizontal-only { touch-action: pan-y; }
```

**Gesture Conflicts (Click vs Drag):**
- Track state: `press` → `drag` → `drag-end`
- Cancel click when state is `drag-end`

**Drag Threshold:**
```js
const distance = Math.sqrt(dx*dx + dy*dy);
if (distance >= threshold) state.current = "drag";
```

**Pointer Capture:**
```js
// On pointerdown
ref.current.setPointerCapture(e.pointerId);
// On pointerup
ref.current.releasePointerCapture(e.pointerId);
```

### 8. Drawing Inspiration
Remix and elevate existing ideas.

**Philosophy:**
- "Good artists copy, great artists steal, exceptional artists **elevate**"
- Completely original ideas are fantasy; originality = how you weave ideas
- Remix MULTIPLE sources to make something your own
- Always attribute credit when learning from others

---

## Code Patterns Library

### Performance: useMotionValue vs useState
```js
// BAD: Re-renders on every mouse move
const [mouse, setMouse] = useState({ x: 0, y: 0 });

// GOOD: Updates DOM directly, no re-renders
const mouseX = useMotionValue(0);
const mouseY = useMotionValue(0);
mouseX.set(e.clientX);
```

### Animated Values: useSpring
```js
const y = useSpring(0, { stiffness: 100, damping: 10 });
y.set(100);  // Animates to 100
y.jump(100); // Sets immediately, no animation
```

### Grid Stacking (Overlapping Elements)
```css
.root { display: grid; place-items: center; }
.item { grid-area: 1 / 1; }
```

### Native Scroll over Wheel Events
```js
// Set body height = scrollable width + viewport
document.body.style.height = `calc(100vh + ${scrollableWidth}px)`;
// Use position: fixed and translate based on scrollY
```

### Clip-path for Animated Resizing (not width)
```js
// width animation: slow, triggers layout
// scale: distorts content
// clip-path: GPU accelerated, no distortion
const clipPath = active
  ? 'inset(0px 0px 0px 0px)'
  : `inset(0px ${FRAME_DIFF_CENTER}px)`;
```

### Re-mount with React key for CSS Keyframes
```jsx
<div key={`${index}-exit`} className="animate-exit" />
<div key={`${index}-enter`} className="animate-enter" />
```

### Shared Layout Animation
```jsx
<motion.div layoutId="shared-element" />
```

### Skip High-Frequency Animations
```js
const deltaMs = Date.now() - lastUpdate.current;
if (deltaMs < animationDurationMs) return; // Skip animation
```

### Scroll Fading (Blur Fade)
```js
function onScroll(e) {
  const opacity = clamp(e.currentTarget.scrollTop / minMax, [0, 1]);
  fadeRef.current.style.opacity = String(opacity);
}
```

### Overflow: clip vs hidden
```css
/* hidden: creates scroll container (often unwanted) */
/* clip: prevents overflow without scroll container */
overflow: clip;
```

### Aesthetic Focus Rings
```css
.link {
  border-radius: 4px;
  outline: 2px solid orange;
  outline-offset: 2px;
}
```

### Intersection Detection
```js
function areIntersecting(el1, el2, padding = 0) {
  const rect1 = el1.getBoundingClientRect();
  const rect2 = el2.getBoundingClientRect();
  return !(
    rect1.right + padding < rect2.left ||
    rect1.left - padding > rect2.right ||
    rect1.bottom + padding < rect2.top ||
    rect1.top - padding > rect2.bottom
  );
}
```

### Transition End Listener (auto-cleanup)
```js
element.addEventListener("transitionend", callback, { once: true });
```

### Smart Image Preloading
```jsx
// Don't use display: none (browser won't load)
// Use opacity: 0
<Image src={preloadSrc} style={{ position: "absolute", opacity: 0 }} />
```

---

## Testing & Quality

### Interface Robustness Checklist
- [ ] Scroll fast — does it break?
- [ ] Spam click — does it break?
- [ ] Resize rapidly — does it break?
- [ ] Interrupt animations mid-way — does it recover?
- [ ] Test with slow network
- [ ] Test with keyboard only
- [ ] Test all state combinations

### Debugging Techniques
1. **Visual debug tools** over console.log
2. **Keyboard shortcuts** to toggle states quickly
3. **Reduce complexity**: Remove code until issue stops
4. **Record and scrub** animations frame-by-frame
5. **Clipboard history** for quick version snapshots

### Before Shipping
- Nudge elements by 1px for optical alignment
- Test peripheral vision: Does animation draw unwanted attention?
- Don't animate on initial page load
- Before/after screenshots in PRs (same positioning)

---

## Quick Reference

| Situation | Solution |
|-----------|----------|
| Overlapping motion | Add 1-2px blur |
| Menu animation | Fade-out only, no fade-in |
| Keyboard interactions | Often no animation needed |
| High-frequency updates | Skip animation if too fast |
| Drag gesture | Use `jump()` during, `set()` at end |
| Touch gestures | Use `touch-action: none` |
| Thin hit areas | Expand with `::after` pseudo-element |
| Scroll-based animation | Use native scroll, not wheel event |
| Width animation | Use `clip-path` instead |
| Replay CSS animation | Change React `key` prop |
| Morph between elements | Use `layoutId` |
| State during gesture | Track: press → drag → drag-end |
| Overflow without scroll | Use `overflow: clip` |

---

## Resources

- **Motion React Docs**: https://motion.dev/docs
- **Apple HIG**: Human Interface Guidelines
- **Disney's 12 Principles of Animation**
- **"Game Feel" by Steve Swink**
- **Not Boring Software**: https://notboring.software/


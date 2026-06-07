# Drag-and-Drop vs. Text Selection Fix

This document explains the common pitfall with HTML5 Drag-and-Drop in interfaces containing form elements, and documents our clean, state-driven React solution in the unified Admin Panel.

---

## The Issue

When an element has the HTML5 attribute `draggable="true"` set, the browser prioritizes drag-and-drop operations over standard mouse selection behaviors for all of its nested children. 

As a result, if you have input fields (`<input>`, `<textarea>`, `<select>`) nested inside a draggable container:
1.  **Cursor positioning with the mouse fails**: Clicking inside the field to place the blinking cursor (caret) is ignored.
2.  **Text selection with the mouse fails**: Clicking and dragging the mouse across text in the input does not highlight or select it; instead, the browser tries to drag the entire card.
3.  **Double-clicking fails**: Double-clicking a word inside the field to highlight it is intercepted and fails.
4.  **Arrow keys are unaffected**: Only keyboard inputs (like backspace or left/right arrow keys) work.

This completely ruins the user experience in admin panels or forms where cards are both **reorderable** and **editable**.

---

## What Doesn't Work (Common Mistakes)

### 1. Adding `draggable="false"` directly to the `<input>`
Setting `<input draggable="false">` does not resolve the issue. The parent element still has `draggable="true"`, so on `mousedown`, the browser still initiates drag preparation for the parent container before the click can register selection on the input.

### 2. Calling `e.preventDefault()` on `dragstart` for Inputs
This prevents the card from moving when dragged *from* the inputs, but it still **does not** allow mouse text selection because the browser has already intercepted the click-and-drag.

---

## The React Solution

In our React-based Next.js admin interface (`src/app/admin/page.tsx`), we solve this by **making cards draggable only when the user is actively interacting with the designated drag handle icon (⠿)**. We leverage React's state management to toggle the `draggable` property dynamically.

### Implementation Details

1.  **Draggable State**: We track the index of the element that is allowed to be dragged using a React state variable:
    ```typescript
    const [draggableIdx, setDraggableIdx] = useState<number | null>(null);
    ```

2.  **Dynamic `draggable` Attribute**: The card container only sets `draggable` to `true` if its index matches `draggableIdx`:
    ```tsx
    <div
      key={member.student_id}
      className="card"
      draggable={draggableIdx === idx}
      onDragStart={(e) => handleDragStart(e, idx)}
      onDragOver={(e) => handleDragOver(e, idx)}
      onDrop={(e) => handleDrop(e, idx)}
      onDragEnd={handleDragEnd}
    >
    ```

3.  **Handle Interaction**: The drag handle triggers state changes on `onMouseDown` and `onMouseUp`:
    ```tsx
    <div
      className="drag-handle"
      onMouseDown={() => setDraggableIdx(idx)}
      onMouseUp={() => setDraggableIdx(null)}
      style={{ cursor: 'grab' }}
    >
      ⠿
    </div>
    ```

### Why this works:
- When a user clicks and drags the **drag handle**, `onMouseDown` sets `draggableIdx` to the card's index, making `draggable={true}` on the card and allowing standard drag-and-drop reordering.
- When a user clicks inside an **input field** or anywhere else on the card, `draggableIdx` remains `null`. The card container gets `draggable={false}`, allowing the browser's default text selection and cursor placement behaviors to work perfectly.

---

## Summary of Benefits

1.  **State-Driven Cleanliness**: Avoids direct DOM manipulation, event listeners addition/removal, or global document selectors.
2.  **No HTML Clutter**: Kept tidy inside React component structure.
3.  **Perfect UX**: Reordering from the grab handles works smoothly while all form fields behave normally.

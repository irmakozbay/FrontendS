/**
 * Helper to handle Enter key navigation across form elements.
 * 
 * Rules:
 * 1. Ignores textarea and button elements (lets them retain default Enter behavior).
 * 2. On Enter key press in form controls (input, select, checkbox, radio etc.):
 *    - Prevents default form submission/behavior unless it is the LAST focusable field.
 *    - Navigates to the next visible, enabled, non-disabled form control.
 *    - If the current field is the LAST focusable input in the form, triggers form submit.
 */
export const handleFormKeyDown = (e) => {
  if (e.key !== 'Enter') return;

  const target = e.target;
  if (!target) return;

  const tagName = target.tagName.toLowerCase();
  
  // Rule 3: İstisnalar - textarea or button retain default Enter key behavior
  if (tagName === 'textarea' || tagName === 'button') {
    return;
  }

  // Also ignore buttons represented by input type="submit" or type="button" or type="reset"
  if (tagName === 'input' && (target.type === 'button' || target.type === 'submit' || target.type === 'reset')) {
    return;
  }

  const form = target.form || target.closest('form');
  if (!form) return;

  // Find all focusable form controls inside the container form
  const selector = 'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const focusables = Array.from(form.querySelectorAll(selector)).filter((el) => {
    // Exclude hidden or non-visible elements
    return el.offsetWidth > 0 && el.offsetHeight > 0 && getComputedStyle(el).visibility !== 'hidden';
  });

  // Filter down to fields that user navigates through (excluding buttons/submits from intermediate targets)
  const inputFields = focusables.filter((el) => {
    const tag = el.tagName.toLowerCase();
    if (tag === 'button') return false;
    if (tag === 'input' && (el.type === 'button' || el.type === 'submit' || el.type === 'reset')) return false;
    return true;
  });

  const currentIndex = inputFields.indexOf(target);

  if (currentIndex !== -1 && currentIndex < inputFields.length - 1) {
    // Move to next input field
    e.preventDefault();
    const nextEl = inputFields[currentIndex + 1];
    nextEl.focus();
    if (typeof nextEl.select === 'function' && nextEl.type !== 'checkbox' && nextEl.type !== 'radio' && nextEl.type !== 'date') {
      nextEl.select();
    }
  } else if (currentIndex === inputFields.length - 1) {
    // Last input field - trigger form submit
    e.preventDefault();
    if (typeof form.requestSubmit === 'function') {
      form.requestSubmit();
    } else {
      const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
      if (submitBtn) {
        submitBtn.click();
      } else {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }
  }
};

import { modalInfobox } from "./elements.js";

export function info(title, body, closeModal) {
    if (closeModal) closeModal.hide();
    modalInfobox.title.innerHTML = title;
    modalInfobox.body.innerHTML = body;
    modalInfobox.modal.show();
}

export function disableButton(button) {

    button.disabled = true;
    const originalLabel = button.innerHTML;
    button.innerHTML = 'wait...';
    return originalLabel;
}

export function enableButton(button, label) {
    if (label) button.innerHTML = label;
    button.disabled = false;
}
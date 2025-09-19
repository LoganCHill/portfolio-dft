// js/ModalManager.js

/**
 * A generic manager for modal dialog behavior.
 * It handles opening, closing, and updating the title of a modal element.
 * It also adds a listener to close the modal when clicking on the background overlay.
 */
export class ModalManager {
  constructor(modalId, closeButtonSelector) {
    /**
     * @param {string} modalId - The ID of the modal element.
     * @param {string} closeButtonSelector - The CSS selector for the close button within the modal.
     */
    this.modalElement = document.getElementById(modalId);
    this.closeButton = this.modalElement.querySelector(closeButtonSelector);
    this.titleElement = this.modalElement.querySelector('#modalTitle');

    if (!this.modalElement || !this.closeButton || !this.titleElement) {
      console.error('[ModalManager] Modal elements not found.');
      return;
    }

    this.close = this.close.bind(this);
    this._init();
  }

  /**
   * Initializes event listeners for the close button and the modal overlay.
   * @private
   */
  _init() {
    this.closeButton.addEventListener('click', this.close);
    // Also close when clicking outside the modal content
    this.modalElement.addEventListener('click', (event) => {
      if (event.target === this.modalElement) {
        this.close();
      }
    });
  }

  /**
   * Opens the modal and sets its title.
   * @param {string} [title] - The title to display in the modal header.
   */
  open(title) {
    this.titleElement.textContent = title || 'Health Metrics'
    this.modalElement.classList.add('is-visible')
    document.body.classList.add('modal-open');
  }

  /**
   * Closes the modal.
   */
  close() {
    this.modalElement.classList.remove('is-visible')
    document.body.classList.remove('modal-open');
  }

  /**
   * Sets the title of the modal.
   * @param {string} title - The new title for the modal.
   */
  setTitle(title) {
    this.titleElement.textContent = title || 'Health Metrics';
  }
}
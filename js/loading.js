export class LoadingState {
  static show(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>
    `;
  }

  static hide(containerId) {
    const container = document.getElementById(containerId);
    container.querySelector('.loading-spinner')?.remove();
  }
}

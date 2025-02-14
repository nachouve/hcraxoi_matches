export class ErrorDisplay {
  static show(containerId, error) {
    const container = document.getElementById(containerId);
    container.innerHTML += `
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        ${error.message}
        <button type="button" class="close" data-dismiss="alert">
          <span>&times;</span>
        </button>
      </div>
    `;
  }
}

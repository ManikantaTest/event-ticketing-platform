let toastQueue = [];
let isShowingToast = false;
let currentToastId = null;

// Utility
const wait = (ms) => new Promise((res) => setTimeout(res, ms));

export function showToast(config) {
  return new Promise((resolve) => {
    toastQueue.push({ config, resolve });
    processQueue();
  });
}

async function processQueue() {
  if (isShowingToast || toastQueue.length === 0) return;

  isShowingToast = true;

  const { config, resolve } = toastQueue.shift();
  const toastId = await showToastInternal(config);

  resolve(toastId);

  await wait(config.duration || 4000);

  dismissToast(toastId);

  // wait fade-out fully (matching duration-500)
  await wait(500);

  isShowingToast = false;

  processQueue();
}

// actual toast function
async function showToastInternal({
  type = "normal",
  message = "",
  duration = 4000,
}) {
  // Icons
  const icons = {
    normal: `<svg class="size-6 text-blue-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"></path></svg>`,
    success: `<svg class="size-6 text-teal-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"></path></svg>`,
    error: `<svg class="size-6 text-red-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"></path></svg>`,
    warning: `<svg class="size-6 text-yellow-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"></path></svg>`,
    loading: `
        <svg class="w-6 h-6 text-blue-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">

          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
      `,
  };

  // Setup container
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className =
      "fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[9999] space-y-3 flex flex-col items-center";
    document.body.appendChild(container);
  }

  const toastId = "toast-" + Date.now();

  const toast = document.createElement("div");
  toast.id = toastId;
  toast.className =
    "w-[350px] max-w-full bg-white border border-gray-300 rounded-xl shadow-xl animate-fadeIn transition-opacity duration-500";
  toast.setAttribute("role", "alert");
  toast.innerHTML = `
    <div class="flex p-5">
      <div class="shrink-0">
        ${icons[type]}
      </div>
      <div class="ms-4">
        <p class="text-base font-medium text-gray-800">${message}</p>
      </div>
    </div>
  `;

  container.appendChild(toast);

  currentToastId = toastId;

  return toastId;
}

export function dismissToast(toastId) {
  const toast = document.getElementById(toastId);
  if (!toast) return;

  toast.classList.add("opacity-0");

  setTimeout(() => {
    toast.remove();
  }, 500); // match fade-out duration
}

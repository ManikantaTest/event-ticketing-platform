import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);
export const toastRef = { current: null };

let toastId = 0;

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const show = useCallback((type, message, duration = 3000) => {
    const id = ++toastId;

    setToast({ id, type, message, visible: true });

    // Auto hide
    setTimeout(() => {
      setToast((curr) =>
        curr?.id === id ? { ...curr, visible: false } : curr
      );
    }, duration - 300);

    // Remove from DOM
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, duration);
  }, []);

  const api = {
    success: (msg, time) => show("success", msg, time),
    error: (msg, time) => show("error", msg, time),
    loading: (msg, time = 4000) => show("loading", msg, time),
    normal: (msg, time) => show("normal", msg, time),
    hide: () => setToast(null),
  };

  toastRef.current = api;

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toast && <Toast {...toast} />}
    </ToastContext.Provider>
  );
}

function Toast({ type, message, visible }) {
  const icons = {
    normal: (
      <svg
        className="size-6 text-blue-500 mt-0.5"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"></path>
      </svg>
    ),
    success: (
      <svg
        className="size-6 text-teal-500 mt-0.5"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"></path>
      </svg>
    ),
    error: (
      <svg
        className="size-6 text-red-500 mt-0.5"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"></path>
      </svg>
    ),
    warning: (
      <svg
        className="size-6 text-yellow-500 mt-0.5"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"></path>
      </svg>
    ),
    loading: (
      <svg
        className="w-6 h-6 text-blue-500 animate-spin mt-0.5"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        ></path>
      </svg>
    ),
  };

  return (
    <div
      className={`
          fixed left-1/2 -translate-x-1/2 bottom-8 
          w-[350px] max-w-full bg-white border border-gray-300 
          rounded-xl shadow-xl transition-all duration-500 z-[9999]
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        `}
      role="alert"
    >
      <div className="flex p-5">
        <div className="shrink-0">{icons[type]}</div>

        <div className="ms-4">
          <p className="text-base font-medium text-gray-800">{message}</p>
        </div>
      </div>
    </div>
  );
}

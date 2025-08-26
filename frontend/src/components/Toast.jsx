import { useState, useCallback, createContext, useContext } from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const showToast = useCallback((msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);
  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded shadow-lg z-50 text-white ${toast.type === "error" ? "bg-red-600" : toast.type === "success" ? "bg-green-600" : "bg-blue-600"}`} role="alert">
          {toast.msg}
        </div>
      )}
    </ToastContext.Provider>
  );
}
export function useToast() {
  return useContext(ToastContext);
}
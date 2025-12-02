import { useEffect, useRef } from "react";
import { dismissToast, showToast } from "../components/toast";

export default function useAsyncToast({
  loading,
  error,
  success,
  successMessage = "Action completed successfully!",
  loadingMessage = "Processing...",
  onSuccess = () => {},
  onError = () => {},
}) {
  const loaderToastRef = useRef(null);

  useEffect(() => {
    // 1️⃣ ERROR
    if (error) {
      if (loaderToastRef.current) {
        dismissToast(loaderToastRef.current);
        loaderToastRef.current = null;
      }

      showToast({
        type: "error",
        message: error,
      });

      onError(error); // optional callback
      return;
    }

    // 2️⃣ LOADING
    if (loading) {
      if (!loaderToastRef.current) {
        loaderToastRef.current = showToast({
          type: "loading",
          message: loadingMessage,
          duration: 60000,
        });
      }
      return;
    }

    // 3️⃣ SUCCESS
    if (success) {
      if (loaderToastRef.current) {
        dismissToast(loaderToastRef.current);
        loaderToastRef.current = null;
      }

      showToast({
        type: "success",
        message: successMessage,
      });

      onSuccess();
    }
  }, [loading, error, success]);
}

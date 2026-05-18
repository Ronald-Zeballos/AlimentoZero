import { useEffect, useState } from "react";

export function useToast() {
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return {
    toast,
    showToast: setToast
  };
}

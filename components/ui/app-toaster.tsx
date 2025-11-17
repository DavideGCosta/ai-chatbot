"use client";

import { Toaster } from "sonner";

function AppToaster() {
  return (
    <Toaster
      closeButton={false}
      containerAriaLabel="Notification center"
      offset={{ top: 20, right: -60 }}
      position="top-right"
    />
  );
}

export { AppToaster };

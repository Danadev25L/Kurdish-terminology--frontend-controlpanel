"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          className={cn(
            "w-full max-w-md rounded-[12px] bg-white p-6 shadow-xl",
            className
          )}
        >
          {title && (
            <DialogTitle className="mb-4 text-lg font-semibold text-gray-900">
              {title}
            </DialogTitle>
          )}
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  );
}

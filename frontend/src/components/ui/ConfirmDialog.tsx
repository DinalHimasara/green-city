"use client";

import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="max-w-md">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-text leading-relaxed">
          {description}
        </p>
        <div className="flex items-center justify-end gap-3 border-t border-card-border pt-4 mt-2">
          <Button variant="ghost" onClick={onClose} disabled={isLoading} size="sm">
            {cancelText}
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isLoading} size="sm">
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

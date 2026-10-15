"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";
import { getStockLabel } from "../constants";
import { StockManagementType, ColorWiseStockType } from "../types";

interface StockConfirmModalProps {
  isOpen: boolean;
  confirmModalForSave: boolean;
  savedStockType: StockManagementType;
  savedColorWiseType: ColorWiseStockType;
  pendingStockType: StockManagementType;
  pendingColorWiseType: ColorWiseStockType | null;
  stockManagementType: StockManagementType;
  colorWiseStockType: ColorWiseStockType;
  savingStockSettings: boolean;
  onConfirm: (autoSave?: boolean) => void;
  onCancel: () => void;
}

export function StockConfirmModal({
  isOpen,
  confirmModalForSave,
  savedStockType,
  savedColorWiseType,
  pendingStockType,
  pendingColorWiseType,
  stockManagementType,
  colorWiseStockType,
  savingStockSettings,
  onConfirm,
  onCancel,
}: StockConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-amber-500/30 bg-slate-900 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Reset &amp; Change Stock Type?</h3>
              <p className="text-xs text-slate-400">Inventory configuration switch</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning Message Box */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>All products stocks are reset</span>
          </div>
          <p className="leading-relaxed text-slate-300">
            Changing your product management type will reset stock availability, numeric quantities, and color variant stock for all existing products in your store to match the new inventory configuration.
          </p>
        </div>

        {/* Type Comparison */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Current Setting:</span>
            <span className="font-semibold text-slate-200 text-right">
              {getStockLabel(savedStockType, savedColorWiseType)}
            </span>
          </div>
          <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between">
            <span className="text-amber-400 font-medium">New Selection:</span>
            <span className="font-bold text-amber-300 text-right">
              {getStockLabel(pendingStockType || stockManagementType, pendingColorWiseType || colorWiseStockType)}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-normal">
          Are you sure you want to proceed? After switching, you will need to update stock details on your product forms.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onCancel}
            disabled={savingStockSettings}
          >
            Cancel (Keep Current)
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            className="bg-amber-600 hover:bg-amber-500 text-white border-amber-500"
            isLoading={savingStockSettings}
            onClick={() => onConfirm(confirmModalForSave)}
          >
            {confirmModalForSave ? "Confirm & Save Changes" : "Confirm & Switch Type"}
          </Button>
        </div>
      </div>
    </div>
  );
}

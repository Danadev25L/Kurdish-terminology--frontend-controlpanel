"use client";

import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface DropdownItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  className?: string;
}

export function Dropdown({ trigger, items, className }: DropdownProps) {
  return (
    <Menu as="div" className={cn("relative inline-block", className)}>
      <MenuButton as="div">{trigger}</MenuButton>
      <MenuItems className="absolute end-0 z-50 mt-1 w-48 rounded-lg border border-border bg-white py-1 shadow-lg">
        {items.map((item, i) => (
          <MenuItem key={i}>
            {({ focus }) => (
              <button
                onClick={item.onClick}
                className={cn(
                  "w-full px-4 py-2 text-start text-sm",
                  focus && "bg-gray-50",
                  item.danger ? "text-danger" : "text-gray-700"
                )}
              >
                {item.label}
              </button>
            )}
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
}

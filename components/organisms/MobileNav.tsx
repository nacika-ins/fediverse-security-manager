import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import React, { Dispatch, FC, useCallback } from 'react';
import { SettingsNav } from '@/components/molecules/SettingsNav';

export const MobileNav: FC<{ open: boolean; setOpen: Dispatch<boolean> }> = ({
  open,
  setOpen,
}) => {
  const onOpenChange = useCallback(
    (state: boolean) => {
      setOpen(state);
    },
    [setOpen],
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Fediverse Security Manager</SheetTitle>
          <SheetDescription>
            <div>
              <SettingsNav />
            </div>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

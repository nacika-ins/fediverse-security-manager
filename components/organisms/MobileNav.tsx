import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Dispatch, FC, useCallback } from "react";

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
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

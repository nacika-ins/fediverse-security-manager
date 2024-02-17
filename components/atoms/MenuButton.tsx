import React, { Dispatch, FC, useCallback } from "react";
import Image from "next/image";
import { Toggle } from "@/components/toggle";

export const MenuButton: FC<{ open: boolean; setOpen: Dispatch<boolean> }> = ({
  open,
  setOpen,
}) => {
  const onChange: (isSelected: boolean) => void = useCallback(
    (state) => {
      setOpen(state);
    },
    [setOpen],
  );

  return (
    <Toggle onChange={onChange} isSelected={open}>
      <Image
        src="/hum-white.svg"
        width={16}
        height={16}
        alt="Picture of the author"
      />
    </Toggle>
  );
};

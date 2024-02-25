import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import React, { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  value: z.string().min(1).includes('.'),
});

export const ConfirmModal: React.FC<{
  buttonTitle: string;
  title: string;
  description: string;
  submitButtonTitle: string;
  onSubmit: (data: z.infer<typeof schema>) => void;
}> = ({
  buttonTitle,
  title,
  description,
  submitButtonTitle,
  onSubmit: _onSubmit,
}) => {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    defaultValues: { value: '' },
    resolver: zodResolver(schema),
  });

  const trigger = useRef<HTMLButtonElement>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const onSubmit: SubmitHandler<z.infer<typeof schema>> = useCallback(
    async (data) => {
      setLoading(true);
      console.debug('data =', data);
      await _onSubmit(data);
      trigger.current?.click();
      setLoading(false);
      setOpen(false);
    },
    [_onSubmit],
  );

  const onOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        setOpen(true);
        reset();
      } else {
        setOpen(false);
      }
    },
    [reset],
  );

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogTrigger>
        <Button type="button" variant="outline" size="sm">
          {buttonTitle}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end mt-2">
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                ref={trigger}
                disabled={loading}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {submitButtonTitle}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

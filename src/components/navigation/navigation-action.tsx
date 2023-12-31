'use client';

import { Plus } from 'lucide-react';
import { ActionTooltip } from '@/components/action-tooltip';
import { ModalType, useModalStore } from '@/hooks/stores/use-modal-store';

export function NavigationAction() {
  const { onOpen } = useModalStore();

  return (
    <div>
      <ActionTooltip side='right' align='center' label='add a server'>
        <button
          onClick={() => onOpen({ type: ModalType.CREATE_SERVER, data: {} })}
          className='group flex items-center'
        >
          <div
            className='flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden items-center justify-center border-2
          border-teal-500 bg-transparent dark:border-none dark:bg-neutral-700 group-hover:bg-teal-500'
          >
            <Plus
              className='group-hover:text-teal-50 transition text-teal-500'
              size={25}
            />
          </div>
        </button>
      </ActionTooltip>
    </div>
  );
}

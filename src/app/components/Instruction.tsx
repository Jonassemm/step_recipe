'use client';

import { useState } from 'react';

interface InstructionProps {
  idx: number;
  text: string;
}

export default function Instruction(props: InstructionProps) {
  const idx = props.idx;
  const text = props.text;
  const [checked, setChecked] = useState(false);

  return (
    <li
      className={
        'flex my-4 px-4 py-6 sm:p-8 shadow-md rounded-lg flex-row items-center gap-2 justify-between ' +
        (checked ? 'bg-gray-100' : 'bg-white ')
      }
      onClick={() => setChecked(!checked)}
    >
      <div className="flex items-center">
        <div className="w-8 shrink-0">
          <span className={'text-4xl w-8 pe-2 sm:pe-4 font-bold'}>{idx}</span>
        </div>
        <div
          className={
            'sm:text-lg px-2 sm:px-4 border-l border-gray-300 ' +
            (checked ? 'line-through' : '')
          }
          dangerouslySetInnerHTML={{ __html: text }}
        />
      </div>
      <div>
        <input type="checkbox" className="h-6 w-6" checked={checked} onChange={()=> setChecked(!checked)} />
      </div>
    </li>
  );
}

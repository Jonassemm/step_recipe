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
        'flex  my-4 p-8 shadow-md rounded-lg flex-row items-center gap-2 justify-between ' +
        (checked ? 'bg-gray-100' : 'bg-white ')
      }
      onClick={() => setChecked(!checked)}
    >
      <div className="flex items-center">
        <span className={'text-4xl font-bold '}>{idx}</span>
        <div
          className={'text-lg px-4 ' + (checked ? 'line-through' : '')}
          dangerouslySetInnerHTML={{ __html: text }}
        />
      </div>
      <div>
        <input type="checkbox" className="h-6 w-6" checked={checked} />
      </div>
    </li>
  );
}

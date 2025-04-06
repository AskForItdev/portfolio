// /app/components/DennisComp/denniscomp.js
import React from 'react';
import { useState } from 'react';

export default function DennisComp() {
  const [casinoBoard, setCasinoBoard] = useState([
    { value: 1 },
    { value: 2 },
    { value: 3 },
    { value: 4 },
    { value: 5 },
    { value: 6 },
    { value: 7 },
    { value: 8 },
    { value: 9 },
  ]);

  const roll = () => {
    const newBoard = casinoBoard.map(() => ({
      value: Math.floor(Math.random() * 10),
    }));
    setCasinoBoard(newBoard);
  };

  return (
    <>
      <div className="flex flex-col items-center m-2">
        <h2>Dennis Idea page comp</h2>
      </div>
      <div>casino!</div>
      <div className="flex flex-col items-center">
        <div className="flex flex-row items-center border p-4 gap-4">
          <div className="grid grid-cols-3 gap-6">
            {casinoBoard.map((slot, index) => {
              return (
                <div
                  className="border p-10 rounded-md"
                  key={index}
                >
                  {slot.value}
                </div>
              );
            })}
          </div>
          <button onClick={roll} className="border p-2">
            test
          </button>
        </div>
      </div>
    </>
  );
}

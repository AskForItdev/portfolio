'use client';
import Link from 'next/link';

export default function Validated() {
  return (
    <div>
      <h2 className="text-xl mb-4">Validated page</h2>
      <p className="text-sm mt-2">
        You have successfully validated your email!
      </p>
      <Link href="/login"> Proceed to login</Link>
    </div>
  );
}

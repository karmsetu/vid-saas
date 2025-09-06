import { ReactNode } from 'react';

export const Center = ({ children }: { children: ReactNode }) => (
    <section className="h-[100vh] w-[100vw] flex justify-center items-center">
        {children}
    </section>
);

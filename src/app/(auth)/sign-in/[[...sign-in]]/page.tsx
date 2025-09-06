import { Center } from '@/components/Center';
import { SignIn } from '@clerk/nextjs';

export default function Page() {
    return (
        <Center>
            <SignIn />
        </Center>
    );
}

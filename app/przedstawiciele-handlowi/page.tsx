import { RepresentativesPage } from '@/components/przedstawiciele-handlowi/RepresentativesPage';
import fs from 'fs/promises';
import path from 'path';

export const metadata = {
    title: 'Przedstawiciele Handlowi | HERT',
    description:
        'Znajdź swojego przedstawiciela handlowego HERT na terenie całej Polski. Doradztwo i wsparcie w Twoim regionie.',
};

async function getData() {
    const publicDir = path.join(process.cwd(), 'public');

    const [usersRaw, dataRaw, postalRaw] = await Promise.all([
        fs.readFile(path.join(publicDir, 'users.json'), 'utf-8'),
        fs.readFile(path.join(publicDir, 'data.json'), 'utf-8'),
        fs.readFile(path.join(publicDir, 'postal-codes.json'), 'utf-8'),
    ]);

    const usersData = JSON.parse(usersRaw);
    const dataPowiat = JSON.parse(dataRaw);
    const postalCodes = JSON.parse(postalRaw);

    const users = usersData.map((e: any) => ({
        ...e,
        powiaty: dataPowiat
            .filter((d: any) => d.id == e.id)
            .map((m: any) => m.powiat),
    }));

    return { users, postalCodes };
}

export default async function PrzedstawicielHandlowuPage() {
    const { users, postalCodes } = await getData();

    return <RepresentativesPage users={users} postalCodes={postalCodes} />;
}
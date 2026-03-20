// src/utils/slugify.js
export const createSlug = function (name: any) {
    let slug = name.toLowerCase();

    const polishChars: any = {
        'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n',
        'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z'
    };

    slug = slug.replace(/[ąćęłńóśźż]/g, (char: any) => polishChars[char] || char);
    slug = slug.replace(/[^a-z0-9\s-]/g, '');
    slug = slug.replace(/[\s_]+/g, '-');
    slug = slug.replace(/-+/g, '-');
    slug = slug.replace(/^-+|-+$/g, '');

    return slug;
};
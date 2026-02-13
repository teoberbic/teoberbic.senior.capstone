import React, { useState, useEffect } from 'react';

/**
 * BrandComparer.jsx
 * 
 * Gemini 3 Pro Thinking helped implement the logic for condensing the different types (Brand, Collection, Product) into a single reusable component.
 * We worked together to simplify the code and make it more efficient. I originally had a longer code that was kind of all over the place and it didn't make sense. 
 * I asked for a better way because I knew there was a better way to do it so this solution seems more logical. 
 * Especially the comparison card lines 13 through 57,the stat from lines 59 through 68 
 */


const ComparisonCard = ({ data, type }) => {
    if (!data) return <div className="h-full flex items-center justify-center bg-gray-50 border-2 border-dashed rounded-lg text-gray-400">Select {type.slice(0, -1)}</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border h-full">
            {type === 'Products' && data.images?.[0] && (
                <div className="h-24 bg-gray-100 rounded mb-4 overflow-hidden flex items-center justify-center">
                    <img src={data.images[0]} alt={data.title} className="h-full w-full object-contain" />
                </div>
            )}


            <h3 className="text-xl font-bold mb-1">{data.name || data.title}</h3>
            {data.brand && <p className="text-sm text-gray-500 mb-4">{data.brand.name}</p>}

            <div className="space-y-4">
                {type === 'Brands' && (
                    <>
                        <Stat label="Website" value={data.domain} link={`https://${data.domain}`} />
                        <div className="grid grid-cols-2 gap-4">
                            <Stat label="Collections" value={data.collection_count || 0} />
                            <Stat label="Tags" value={data.tags?.join(', ') || 'None'} />
                        </div>
                    </>
                )}

                {type === 'Collections' && (
                    <>
                        <Stat label="Launched" value={data.launchedAt ? new Date(data.launchedAt).toLocaleDateString() : 'N/A'} />
                        <Stat label="Volume" value={`${data.products?.length || 0} items`} />
                        <Stat label="Avg Price" value="N/A (Requires Detail Fetch)" />
                    </>
                )}

                {type === 'Products' && (
                    <>
                        <Stat label="Price" value={`$${data.price}`} css="text-2xl" />
                        <Stat label="Type" value={data.product_type} />
                        <Stat label="Tags" value={data.tags?.join(', ')} />
                    </>
                )}
            </div>
        </div>
    );
};

const Stat = ({ label, value, link, css = "font-medium" }) => (
    <div>
        <span className="text-xs uppercase text-gray-400 font-semibold">{label}</span>
        {link ? (
            <a href={link} className={`block text-blue-600 hover:underline ${css}`} target="_blank" rel="noreferrer">{value}</a>
        ) : (
            <p className={`text-gray-900 ${css}`}>{value || '-'}</p>
        )}
    </div>
);

export default function BrandComparer() {
    const [mode, setMode] = useState('Brands');
    const [items, setItems] = useState([]);
    const [selA, setSelA] = useState(null);
    const [selB, setSelB] = useState(null);

    // Fetch list generic
    useEffect(() => {
        setSelA(null); setSelB(null);
        fetch(`/api/${mode.toLowerCase()}`)
            .then(res => res.json())
            .then(setItems)
            .catch(console.error);
    }, [mode]);

    // Helper to generic set selection
    const handleSet = (id, setFn) => setFn(items.find(i => i._id === id) || null);

    return (
        <div className="p-6 max-w-7xl mx-auto pb-24">
            <header className="mb-8 flex gap-4 border-b">
                {['Brands', 'Collections', 'Products'].map(m => (
                    <button key={m} onClick={() => setMode(m)}
                        className={`pb-2 px-4 font-medium ${mode === m ? 'border-b-2 border-black' : 'text-gray-400 focus:outline-none'}`}>
                        {m}
                    </button>
                ))}
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Selector A */}
                <div className="space-y-4">
                    <select className="w-full p-2 border rounded" onChange={e => handleSet(e.target.value, setSelA)}>
                        <option value="">Select {mode.slice(0, -1)} A...</option>
                        {items.map(i => <option key={i._id} value={i._id}>{i.name || i.title}</option>)}
                    </select>
                    <ComparisonCard data={selA} type={mode} />
                </div>

                {/* Selector B */}
                <div className="space-y-4">
                    <select className="w-full p-2 border rounded" onChange={e => handleSet(e.target.value, setSelB)}>
                        <option value="">Select {mode.slice(0, -1)} B...</option>
                        {items.map(i => <option key={i._id} value={i._id}>{i.name || i.title}</option>)}
                    </select>
                    <ComparisonCard data={selB} type={mode} />
                </div>
            </div>
        </div>
    );
}

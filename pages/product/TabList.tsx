// components/TabList.tsx
import React, { useState } from 'react';



interface TabListProps {
    tabs: any;
    defaultActiveIndex?: number;
    className?: string;
}

const TabList: React.FC<TabListProps> = ({
    tabs,
    defaultActiveIndex = 0,
    className = ""
}) => {
    const [activeTab, setActiveTab] = useState(defaultActiveIndex);

    if (!tabs || tabs.length === 0) {
        return null;
    }
    console.log(tabs)
    const SpecsTable = (specs: any) => {
        console.log(specs)
        // Filtrujemy puste wartości (np. jeśli chcesz pominąć puste pola)
        const filteredSpecs = Object.fromEntries(
            Object.entries(specs).filter(([_, value]) => value && value !== '')
        );

        return (
            <table className="w-full border-collapse">
                <tbody>
                    {Object.entries(filteredSpecs).map(([key, value], idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="py-2 px-4 font-semibold w-1/3 border border-gray-200">{key}:</td>
                            <td className="py-2 px-4 border border-gray-200">{value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div className={`mt-2  ${className}`}>
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab: any, index: any) => (
                        <button
                            key={index}
                            onClick={() => setActiveTab(index)}
                            className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base transition-colors
                ${activeTab === index
                                    ? 'border-hert text-hert'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
              `}
                            aria-current={activeTab === index ? 'page' : undefined}
                        >
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6 flex">
                {tabs.map((tab: any, index: any) => (
                    <div
                        key={index}
                        className={`
              space-y-4 text-base leading-relaxed text-gray-700
              ${activeTab === index ? 'block' : 'hidden'}
            `}
                        id={`tab-content-${index}`}
                    >
                        {tab.type == 'html' && tab.html && (
                            <p dangerouslySetInnerHTML={{ __html: tab.html }} />
                        )}

                        {tab.type == 'table' && tab.obj && (
                            <div>{SpecsTable(tab.obj)}</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TabList;